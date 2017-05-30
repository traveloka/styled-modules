import * as t from 'babel-types';
import hash from 'string-hash';

import {
  getExpressionText,
} from './_utils';

import {
  STYLE_ID_PROP_NAME,
  STYLE_SOURCE_PROP_NAME,
} from './_constants';

const getCss = (path) => {
  if (!path.isTemplateLiteral() && !path.isStringLiteral()) {
    return;
  }
  return getExpressionText(path);
};

const getStyledJsx = (css, opts, path) => {
  const commonHash = hash(css);
  return {
    source: css,
    hash: commonHash,
  };
};

const makeHashesAndScopedCssPaths = (identifierName, data) => {
  return Object.keys(data).map(key => {
    const value = typeof data[key] === 'object'
      ? data[key]
      : t.stringLiteral(`${data[key]}`);

    return t.expressionStatement(
      t.assignmentExpression(
        '=',
        t.memberExpression(
          t.identifier(identifierName),
          t.identifier(key)
        ),
        value
      )
    );
  })
};

const defaultExports = (path, decl, opts) => {
  const css = getCss(decl);
  if (!css) {
    return;
  }
  const { hash, source } = getStyledJsx(css, opts, path);
  path.insertBefore(
    makeHashesAndScopedCssPaths('module.exports', {
      [STYLE_ID_PROP_NAME]: hash,
      [STYLE_SOURCE_PROP_NAME]: source,
    })
  );
  decl.parentPath.remove();
};

export const moduleExportsVisitor = (path, opts) => {
  if (path.get('left').getSource() !== `module.exports.${STYLE_SOURCE_PROP_NAME}`) {
    return;
  }
  defaultExports(path, path.get('right'), opts);
};

const callVisitor = (visitor, path, state) => {
  const { file } = state;
  const { opts } = file;
  visitor(path, {
    sourceMaps: opts.sourceMaps,
    sourceFileName: opts.sourceFileName,
    file,
  });
};

export const externalVisitor = {
  AssignmentExpression(path, state) {
    callVisitor(moduleExportsVisitor, path, state);
  },
};

export default function() {
  return {
    visitor: externalVisitor,
  };
}
