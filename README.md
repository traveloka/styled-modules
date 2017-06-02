# Styled Modules
[![npm version](https://img.shields.io/npm/v/styled-modules.svg?style=flat-square)](https://www.npmjs.com/package/styled-modules)

CSS Modules support in **Next.js** based on [styled-jsx](https://github.com/zeit/styled-jsx).

## Installation
Styled Modules uses **CSS Loader** to enable **CSS Modules**, run the following to install it:
```
npm install css-loader --save-dev
```

Next, run the following to install Styled Modules:
```
npm install styled-modules
```

## Configuration
In the root of your **Next.js** project directory, create `next.config.js` with the following:
```js
// next.config.js
module.exports = (config, { dev }) => {
  config.module.rules.push(
    {
      test: /\.css$/,
      use: [
        'babel-loader',
        'styled-modules/loader',
        'css-loader?modules',
      ],
    },
  );
  return config;
};
```

Next, add `styled-modules/babel` to plugins in your `.babelrc`:
```json
{
  "plugins": ["styled-modules/babel"]
}
```

## Usage
Now, you can start using **CSS Modules** in your **Next.js** project as follows:
```js
import styles from './styles.css';

export default () => (
  <h1 className={styles.title}>Styled Modules</h1>
);
```

Notice that the styles only got applied on the client side. To make it works on the server side as well, create a custom document at `./pages/_document.js` with the following code:
```js
import Document from 'next/document';
import flush from 'styled-modules/server';

class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    return {
      ...renderPage(),
      styles: flush(),
    };
  }
}

export default MyDocument;
```

## How It Works
The example above transpiles to the following:
```js
import _StyledModules from 'styled-module/style';
import styles from './styles.css';

export default () => (
  <_StyledModules styles={[{
    __hash: styles.__hash,
    __css: styles.__css
  }]}>
    <h1 className={styles.title}>Styled Modules</h1>
  </_StyledModules>
);
```

## License
MIT
