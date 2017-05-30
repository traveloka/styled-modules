import * as t from 'babel-types';
import { STYLE_ATTRIBUTE } from './_constants';

export const getExpressionText = expr => {
  const node = expr.node;

  // Assume string literal
  if (t.isStringLiteral(node)) {
    return node.value;
  }

  const expressions = expr.get('expressions');

  // Simple template literal without expressions
  if (expressions.length === 0) {
    return node.quasis[0].value.cooked;
  }
};

export const isStyledJsx = ({ node: el }) => (
  t.isJSXElement(el) &&
  el.openingElement.name.name === 'style' &&
  el.openingElement.attributes.some(attr => attr.name.name === STYLE_ATTRIBUTE)
);

export const findStyles = path => {
  if (isStyledJsx(path)) {
    return [];
  }
  return path.get('children').filter(isStyledJsx);
};
