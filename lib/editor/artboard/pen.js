// @flow
import React, { PureComponent, Fragment } from 'react';
import type { Drawable } from '../drawables';

type Props ={|
  drawingStroke: string,
  drawingStrokeWidth: number,
  width: number,
  height: number,
  onDrawEnd: (drawable: Drawable) => void,
|};

type State = {
  drawingPoints?: ?Array<{ x: number, y: number }>,
};

function Path({
  points,
  stroke,
  strokeWidth,
}: {
  points: Array<{ x: number, y: number }>,
  stroke: string,
  strokeWidth: number,
}) {
  return (
    <path
      d={`M ${points.map(p => `${p.x} ${p.y}`).join('L')}`}
      fill="none"
      strokeWidth={strokeWidth}
      stroke={stroke}
    />
  );
}

export default class ArtboardPen extends PureComponent<Props, State> {
  static defaultProps = {
    drawingStroke: 'black',
    drawingStrokeWidth: 5,
  }

  state = {};

  handleArtboardMouseDown = (e: MouseEvent) => {
    const artboard = e.currentTarget;

    // $FlowFixMe flow doesn't know currentTarget is of type Element
    const svg = artboard.closest('svg');

    if (!svg) {
      console.error('svg not found'); // eslint-disable-line no-console
      return;
    }

    // $FlowFixMe flow doesn't know artboard is an SVGGraphicsElement
    const inverseMatrix = artboard.getScreenCTM().inverse();

    e.stopPropagation();

    const transformPoint = ({ clientX, clientY }) => {
      // $FlowFixMe flow doesn't know we get an SVG element
      let pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      pt = pt.matrixTransform(inverseMatrix);

      return { x: pt.x, y: pt.y };
    };

    const initialCoords = transformPoint(e);

    const points = [initialCoords];
    this.setState({ drawingPoints: points });

    const mouseMoveHandler = (e2: MouseEvent) => {
      points.push(transformPoint(e2));
      this.setState({ drawingPoints: points.slice() });
    };

    const mouseUpHandler = () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
      // TODO: finish drawing...

      const id = String(Date.now());
      this.props.onDrawEnd({
        type: 'path',
        id,
        points,
        stroke: this.props.drawingStroke,
        strokeWidth: this.props.drawingStrokeWidth,
      });
      this.setState({ drawingPoints: null });
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  };

  render() {
    const {
      width,
      height,
      drawingStroke,
      drawingStrokeWidth,
    } = this.props;
    const {
      drawingPoints,
    } = this.state;

    return (
      <Fragment>
        <rect
          style={{ pointerEvents: 'bounding-box' }}
          key="artboard"
          fill="none"
          onMouseDown={this.handleArtboardMouseDown}
          x={0}
          y={0}
          width={width}
          height={height}
        />
        {drawingPoints && (
          <Path
            key="path"
            points={drawingPoints}
            stroke={drawingStroke}
            strokeWidth={drawingStrokeWidth}
          />
        )}
      </Fragment>
    );
  }
}
