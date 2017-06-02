import React from 'react';
import render from './render';
import {
  STYLE_ID_PROP_NAME,
  STYLE_CHILD_PROP_NAME,
} from './_constants';

let components = [];

export default class extends React.Component {
  componentWillMount() {
    mount(this);
  }

  componentWillUpdate() {
    update();
  }

  componentWillUnmount() {
    unmount(this);
  }

  render() {
    return React.Children.only(this.props.children);
  }
}

function componentMap() {
  const ret = new Map();
  for (const c of components) {
    c.props.styles.forEach(style => {
      ret.set(style[STYLE_ID_PROP_NAME], style[STYLE_CHILD_PROP_NAME]);
    });
  }
  return ret;
}

export function flush() {
  const ret = componentMap();
  components = [];
  return ret;
}

function mount(component) {
  components.push(component);
  update();
}

function unmount(component) {
  const i = components.indexOf(component);
  if (i < 0) {
    return;
  }

  components.splice(i, 1);
  update();
}

function update() {
  render(componentMap());
}
