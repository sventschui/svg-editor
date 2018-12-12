// @flow
import React, { PureComponent } from 'react';
import UncontrolledEditorWithDrawables from './lib/editor/uncontrolled-with-drawables';
import UncontrolledEditor from './lib/editor/uncontrolled';
import Source from './lib/source';

const defaultDrawables = [{
  type: 'rect',
  id: 'rect-1',
  x: 10,
  y: 10,
  width: 20,
  height: 30,
  fill: 'red',
  stroke: 'none',
  strokeWidth: 0,
}, {
  type: 'ellipse',
  id: 'ellipse-1',
  cx: 200,
  cy: 250,
  rx: 40,
  ry: 60,
  fill: 'blue',
  stroke: 'none',
  strokeWidth: 0,
}, {
  type: 'line',
  id: 'line-1',
  x1: 200,
  x2: 450,
  y1: 440,
  y2: 760,
  stroke: 'green',
  strokeWidth: 10,
}];

export default class App extends PureComponent<{}> {
  renderLoading = () => (
    <div>renderLoading</div>
  );

  renderError = () => (
    <div>renderError</div>
  );

  handleDrawablesChange = (drawables: Array<Drawable>) => {
    console.log('handleDrawablesChange', drawables);
  }

  render() {
    return (
      <div>
        <Source source="/pdf-test.pdf">
          {(source) => {
            if (source.state === 'LOADING') {
              return (<div>Loading...</div>);
            }

            if (source.state === 'ERROR') {
              return (<div>Error...</div>);
            }

            return (
              <UncontrolledEditorWithDrawables
                url={source.url}
                width={source.width}
                height={source.height}
                rotate={90}
                defaultDrawables={defaultDrawables}
                drawMode={null} // "pen"
                allowDrag={false}
                onDrawablesChange={this.handleDrawablesChange}
              />
            );
          }}
        </Source>
        <Source source="/pdf-test.pdf">
          {(source) => {
            if (source.state === 'LOADING') {
              return (<div>Loading...</div>);
            }

            if (source.state === 'ERROR') {
              return (<div>Error...</div>);
            }

            return (
              <img src={source.url} width={source.width} height={source.height} alt="bla" />
            );
          }}
        </Source>
        <Source source="/png-test.png">
          {(source) => {
            if (source.state === 'LOADING') {
              return (<div>Loading...</div>);
            }

            if (source.state === 'ERROR') {
              return (<div>Error...</div>);
            }

            return (
              <UncontrolledEditor
                url={source.url}
                width={source.width}
                height={source.height}
                rotate={0}
                allowDrag={false}
              />
            );
          }}
        </Source>
        <Source source="/png-test.png">
          {(source) => {
            if (source.state === 'LOADING') {
              return (<div>Loading...</div>);
            }

            if (source.state === 'ERROR') {
              return (<div>Error...</div>);
            }

            return (
              <img src={source.url} width={source.width} height={source.height} alt="bla" />
            );
          }}
        </Source>
        <style>
          {`
            svg {
              border: 1px solid black;
              background: gray;
            }
          `}
        </style>
      </div>
    );
  }
}
