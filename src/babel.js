import jsx from 'babel-plugin-syntax-jsx';
import pkg from '../package.json';
import { externalVisitor } from './babel-external';

import {
  findStyles,
  isStyledJsx,
} from './_utils';

import {
  STYLE_ID_PROP_NAME,
  STYLE_SOURCE_PROP_NAME,
  STYLE_ATTRIBUTE,
  STYLE_COMPONENT,
  STYLE_COMPONENT_ID,
} from './_constants';

export default function({ types: t }) {
  return {
    inherits: jsx,
    visitor: {
      Program: {
        enter(path, state) {
          state.hasJSXStyle = null;
          state.file.hasJSXStyle = false;
          state.imports = [];
        },
        exit({node, scope}, state) {
          if (!(state.file.hasJSXStyle && !scope.hasBinding(STYLE_COMPONENT))) {
            return;
          }

          const importDeclaration = t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier(STYLE_COMPONENT))],
            t.stringLiteral(`${pkg.name}/style`)
          );

          node.body.unshift(importDeclaration);
        },
      },
      ImportDefaultSpecifier(path, state) {
        state.imports.push(path.get('local').node.name);
      },
      ImportSpecifier(path, state) {
        state.imports.push(
          (path.get('local') || path.get('imported')).node.name
        );
      },
      VariableDeclarator(path, state) {
        const subpath = path.get('init');
        if (
          !subpath.isCallExpression() ||
          subpath.get('callee').node.name !== 'require'
        ) {
          return;
        }
        state.imports.push(path.get('id').node.name);
      },
      JSXElement: {
        enter(path, state) {
          if (state.hasJSXStyle !== null) {
            return;
          }

          const styles = findStyles(path);

          if (styles.length === 0) {
            return;
          }

          state.styles = [];
          for (const style of styles) {
            // Compute children excluding whitespace
            const children = style.get('children').filter(
              c =>
              t.isJSXExpressionContainer(c.node) ||
              // Ignore whitespace around the expression container
              (t.isJSXText(c.node) && c.node.value.trim() !== '')
            );

            if (children.length !== 1) {
              throw path.buildCodeFrameError(
                `Expected one child under ` +
                `JSX Style tag, but got ${children.length} ` +
                `(eg: <style ${STYLE_ATTRIBUTE}>{\`hi\`}</style>)`
              );
            }

            const child = children[0];

            if (!t.isJSXExpressionContainer(child)) {
              throw path.buildCodeFrameError(
                `Expected a child of ` +
                `type JSXExpressionContainer under JSX Style tag ` +
                `(eg: <style ${STYLE_ATTRIBUTE}>{\`hi\`}</style>), got ${child.type}`
              );
            }

            const expression = child.get('expression');

            if (t.isIdentifier(expression.node)) {
              const idName = expression.node.name;
              if (state.imports.indexOf(idName) !== -1) {
                const id = t.jSXIdentifier(idName);
                state.styles.push(id);
                continue;
              }

              throw path.buildCodeFrameError(
                `The Identifier ` +
                `\`${expression.getSource()}\` is either \`undefined\` or ` +
                `it is not an external StyleSheet reference i.e. ` +
                `it doesn't come from an \`import\` or \`require\` statement`
              );
            }
          }

          state.hasJSXStyle = true;
          state.file.hasJSXStyle = true;
        },
        exit(path, state) {
          if (state.hasJSXStyle) {
            state.hasJSXStyle = null;
          }

          if (!isStyledJsx(path)) {
            return;
          }

          if (
            state.styles.length > 0 &&
            t.isIdentifier(path.get('children')[0].get('expression').node)
          ) {
            const id = state.styles.shift();

            path.replaceWith(t.jSXElement(
              t.jSXOpeningElement(
                t.jSXIdentifier(STYLE_COMPONENT),
                [
                  t.jSXAttribute(
                    t.jSXIdentifier(STYLE_COMPONENT_ID),
                    t.jSXExpressionContainer(
                      t.jSXMemberExpression(
                        id,
                        t.jSXIdentifier(STYLE_ID_PROP_NAME)
                      )
                    )
                  )
                ]
              ),
              t.jSXClosingElement(
                t.jSXIdentifier(STYLE_COMPONENT)
              ),
              [
                t.jSXExpressionContainer(
                  t.jSXMemberExpression(
                    id,
                    t.jSXIdentifier(STYLE_SOURCE_PROP_NAME)
                  )
                ),
              ],
            ));
          }
        },
      },
      ...externalVisitor,
    },
  };
}
