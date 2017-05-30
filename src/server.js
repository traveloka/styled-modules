import React from 'react';
import { STYLE_ID_PREFIX } from './_constants';
import { flush } from './style';

export default function flushToReact() {
  const mem = flush();
  const arr = [];
  for (const [id, c] of mem) {
    arr.push(React.createElement('style', {
      id: `${STYLE_ID_PREFIX}-${id}`,
      // avoid warnings upon render with a key
      key: `${STYLE_ID_PREFIX}-${id}`,
      dangerouslySetInnerHTML: {
        __html: c.props.children,
      },
    }));
  }
  return arr;
}

export function flushToHTML() {
  const mem = flush();
  let html = '';
  for (const [id, c] of mem) {
    html += `<style id="${STYLE_ID_PREFIX}-${id}">${c.props.children}</style>`;
  }
  return html;
}
