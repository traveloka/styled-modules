import React from 'react';
import './global.css';
require('./global2.css');
import styles from './helloWorld.css';
import { root } from './header.css';
const footer = require('./footer.css');

const Header = () => (
  <div className={root} />
);

const Footer = () => (
  <div className={footer.root} />
);

export default class extends React.Component {
  render() {
    const props = {
      style: {
        color: 'red',
      },
    };

    return (
      <div className={styles.helloWorld}>
        <Header />
        Hello World
        {[1, 2, 3].map((value, index) => <span key={index} {...props}>{value}</span>)}
        <Footer />
      </div>
    );
  }
}
