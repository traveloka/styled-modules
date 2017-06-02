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

export default () => (
  <div
    className={styles.helloWorld}
  >
    <Header />
    Hello World
    <Footer />
  </div>
);
