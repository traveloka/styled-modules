require('babel-polyfill');
import React from 'react';
const Header = require('./Header');

export default class extends React.Component {
  render() {
    return <Header />;
  }
}
