import jsx from 'babel-plugin-syntax-jsx';
import pkg from '../package.json';

import {
  STYLE_ID_PROP_NAME,
  STYLE_CHILD_PROP_NAME,
  STYLE_COMPONENT,
} from './_constants';

export default function ({ types: t }) {
  return {
    inherits: jsx,
    visitor: {
      Program: {
        enter(path, state) {
          if (!state.opts.pattern) {
            state.opts.pattern = /\.css$/;
          }
          if (typeof state.opts.pattern === 'string') {
            state.opts.pattern = new RegExp(state.opts.pattern);
          }
          state.imports = [];
          state.isStyledModulesImported = false;
        },
        exit({ node, scope }, state) {
          if (
            state.imports.length === 0 ||
            scope.hasBinding(STYLE_COMPONENT) ||
            state.isStyledModulesImported
          ) {
            return;
          }

          node.body.unshift(
            t.importDeclaration(
              [t.importDefaultSpecifier(t.identifier(STYLE_COMPONENT))],
              t.stringLiteral(`${pkg.name}/style`)
            )
          );
        },
      },
      ImportDeclaration(path, state) {
        const source = path.get('source').node.value;
        if (source === 'styled-modules/style') {
          state.isStyledModulesImported = true;
        } else if (state.opts.pattern.test(source)) {
          const specifiers = path.get('specifiers');
          if (specifiers.length === 0) {
            path.replaceWith(
              t.importDeclaration(
                [
                  t.importDefaultSpecifier(
                    path.scope.generateUidIdentifier('globalStyles')
                  ),
                ],
                t.stringLiteral(source)
              )
            );
            return;
          }
          for (const specifier of specifiers) {
            if (t.isImportDefaultSpecifier(specifier)) {
              state.imports.push(specifier.get('local').node.name);
              return;
            }
          }

          const id = path.scope.generateUidIdentifier('styles');
          path.replaceWith(
            t.importDeclaration(
              [
                t.importDefaultSpecifier(id),
                ...path.node.specifiers,
              ],
              t.stringLiteral(source)
            )
          );
        }
      },
      CallExpression(path, state) {
        if (
          path.get('callee').node.name !== 'require' ||
          t.isVariableDeclarator(path.parent)
        ) {
          return;
        }
        const source = path.get('arguments')[0].node.value;
        if (state.opts.pattern.test(source)) {
          path.parentPath.replaceWith(
            t.variableDeclaration(
              'var',
              [
                t.variableDeclarator(
                  path.scope.generateUidIdentifier('globalStyles'),
                  t.callExpression(
                    t.identifier('require'),
                    [t.stringLiteral(source)]
                  )
                ),
              ]
            )
          );
        }
      },
      VariableDeclarator(path, state) {
        const subpath = path.get('init');
        if (
          !subpath.isCallExpression() ||
          subpath.get('callee').node.name !== 'require'
        ) {
          return;
        }
        const source = subpath.get('arguments')[0].node.value;
        if (source === 'styled-modules/style') {
          state.isStyledModulesImported = true;
        } else if (state.opts.pattern.test(source)) {
          state.imports.push(path.get('id').node.name);
        }
      },
      JSXElement(path, state) {
        if (
          state.imports.length === 0 ||
          t.isJSXElement(path.parent) ||
          path.get('openingElement').node.name.name === STYLE_COMPONENT ||
          state.isStyledModulesImported
        ) {
          return;
        }
        const openingNode = path.get('openingElement').node;
        const hoistProps = [];
        const ownProps = openingNode.attributes.reduce((props, prop) => {
          if (t.isJSXAttribute(prop) && ['key'].indexOf(prop.name.name) !== -1) {
            hoistProps.push(prop);
          } else {
            props.push(prop);
          }
          return props;
        }, []);
        openingNode.attributes = ownProps;

        path.replaceWith(
          t.jSXElement(
            t.jSXOpeningElement(
              t.jSXIdentifier(STYLE_COMPONENT),
              [
                ...hoistProps,
                t.jSXAttribute(
                  t.jSXIdentifier('styles'),
                  t.jSXExpressionContainer(
                    t.arrayExpression(
                      state.imports.map(importId => t.objectExpression([
                        t.objectProperty(
                          t.identifier(STYLE_ID_PROP_NAME),
                          t.memberExpression(
                            t.identifier(importId),
                            t.identifier(STYLE_ID_PROP_NAME)
                          ),
                        ),
                        t.objectProperty(
                          t.identifier(STYLE_CHILD_PROP_NAME),
                          t.memberExpression(
                            t.identifier(importId),
                            t.identifier(STYLE_CHILD_PROP_NAME)
                          )
                        ),
                      ]))
                    )
                  )
                ),
              ]
            ),
            t.jSXClosingElement(
              t.jSXIdentifier(STYLE_COMPONENT)
            ),
            [
              t.jSXText('\n'),
              path.node,
              t.jSXText('\n'),
            ],
            false
          )
        );
      },
    },
  };
}
