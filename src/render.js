import { STYLE_ID_PREFIX } from './_constants';

const tags = new Map();
let prevStyles = new Map();

export default (typeof window === 'undefined' ? renderOnServer : renderOnClient);

function renderOnServer() {} // eslint-disable-line no-empty-function

function renderOnClient(styles) {
  patch(diff(prevStyles, styles));
  prevStyles = styles;
}

function diff(a, b) {
  const added = Array.from(b.entries()).filter(([k]) => !a.has(k));
  const removed = Array.from(a.entries()).filter(([k]) => !b.has(k));
  return [added, removed];
}

const fromServer = new Map();

function patch([added, removed]) {
  for (const [id, css] of added) {
    // Avoid duplicates from server-rendered markup
    if (!fromServer.has(id)) {
      fromServer.set(id, document.getElementById(`${STYLE_ID_PREFIX}-${id}`));
    }

    const tag = fromServer.get(id) || makeStyleTag(css);
    tags.set(id, tag);
  }

  for (const [id] of removed) {
    const t = tags.get(id);
    tags.delete(id);
    t.parentNode.removeChild(t);
    // Avoid checking the DOM later on
    fromServer.delete(id);
  }
}

function makeStyleTag(str) {
  // Based on implementation by glamor
  const tag = document.createElement('style');
  tag.appendChild(document.createTextNode(str));

  const head = document.head || document.getElementsByTagName('head')[0];
  head.appendChild(tag);

  return tag;
}
