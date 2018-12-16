// @flow
import React, { PureComponent, Fragment } from 'react';
import type { Drawable } from '../drawables';

type Props ={|
  drawingStroke: string,
  drawingStrokeWidth: number,
  width: number,
  height: number,
  onDrawEnd: (drawable: Drawable) => void,
  minWidth: number,
  minHeight: number,
|};

type State = {
  startCoord?: { x: number, y: number } | null,
  currentCoord?: { x: number, y: number } | null,
};

const artboardStyles = { pointerEvents: 'bounding-box' };

export default class ArtboardRect extends PureComponent<Props, State> {
  static defaultProps = {
    drawingStroke: 'black',
    drawingStrokeWidth: 5,
    minWidth: 10,
    minHeight: 10,
  }

  state = {};

  getLinePoints = () => {
    const { startCoord, currentCoord } = this.state;

    if (!startCoord || !currentCoord) {
      return null;
    }

    const lowerX = Math.min(startCoord.x, currentCoord.x);
    const lowerY = Math.min(startCoord.y, currentCoord.y);
    const higherX = Math.max(startCoord.x, currentCoord.x);
    const higherY = Math.max(startCoord.y, currentCoord.y);

    const width = higherX - lowerX;
    const height = higherY - lowerY;

    if (width < this.props.minWidth && height < this.props.minHeight) {
      return null;
    }

    return {
      x1: startCoord.x,
      y1: startCoord.y,
      x2: currentCoord.x,
      y2: currentCoord.y,
    };
  }

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

    this.setState({ startCoord: transformPoint(e) });

    const mouseMoveHandler = (e2: MouseEvent) => {
      this.setState({ currentCoord: transformPoint(e2) });
    };

    const mouseUpHandler = () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);

      const points = this.getLinePoints();

      if (points) {
        const id = String(Date.now());
        this.props.onDrawEnd({
          type: 'line',
          id,
          ...points,
          stroke: this.props.drawingStroke,
          strokeWidth: this.props.drawingStrokeWidth,
        });
      }
      this.setState({ startCoord: null, currentCoord: null });
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

    const points = this.getLinePoints();

    return (
      <Fragment>
        <rect
          style={artboardStyles}
          key="artboard"
          fill="none"
          onMouseDown={this.handleArtboardMouseDown}
          x={0}
          y={0}
          width={width}
          height={height}
        />
        {points && (
          <line
            {...points}
            stroke={drawingStroke}
            strokeWidth={drawingStrokeWidth}
          />
        )}
      </Fragment>
    );
  }
}
