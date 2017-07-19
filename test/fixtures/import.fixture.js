import React from 'react';
import style from 'styled-modules/style';
const StyledModule = require('styled-modules/style');
import layoutStyles from './Layout.css';
import contentStyles from './Content.css';

const Content = class extends React.Component {
  render() {
    return (
      <style styles={[contentStyles]}>
        <div className={contentStyles.content}>
          Content
        </div>
      </style>
    );
  }
};

export default () => (
  <StyledModule styles={[layoutStyles]}>
    <div className={layoutStyles.layout}>
      <Content />
    </div>
  </StyledModule>
);
