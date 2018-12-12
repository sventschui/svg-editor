// @flow

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const root = document.getElementById('root');

if (root) {
  ReactDOM.render(<App />, root);
} else {
  alert('#root not found'); // eslint-disable-line
}