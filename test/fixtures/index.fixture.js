import styles from './styles.fixture';
import { default as styles2 } from './styles.fixture';
const styles3 = require('./styles.fixture');

export default () => (
  <div
    className={[
      styles.helloWorld,
      styles2.helloWorld,
      styles3.helloWorld,
    ].join(' ')}
  >
    <style modules>{styles}</style>
    <style modules>{styles2}</style>
    <style modules>{styles3}</style>
  </div>
);
