// @flow
import React, { PureComponent, type Node } from 'react';
import type { Drawable } from '../drawables';

type Props ={
  drawingFill: string,
  drawingStroke: string,
  drawingStrokeWidth: number,
  width: number,
  height: number,
  children: Node,
  onDrawEnd: (drawable: Drawable) => void,
  minWidth: number,
  minHeight: number,
  clipPath?: string,
  x: number,
  y: number,
};

type State = {
  startCoord?: { x: number, y: number } | null,
  currentCoord?: { x: number, y: number } | null,
};

const artboardStyles = { pointerEvents: 'bounding-box' };

export default class ArtboardEllipse extends PureComponent<Props, State> {
  static defaultProps = {
    drawingFill: 'black',
    drawingStroke: 'none',
    drawingStrokeWidth: 0,
    minWidth: 10,
    minHeight: 10,
  }

  state = {};

  getEllipseBounds = () => {
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
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    if (width < this.props.minWidth && height < this.props.minHeight) {
      return null;
    }

    return {
      cx: lowerX + halfWidth,
      cy: lowerY + halfHeight,
      rx: halfWidth,
      ry: halfHeight,
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
      // TODO: finish drawing...

      const ellipseBounds = this.getEllipseBounds();

      if (ellipseBounds) {
        const id = String(Date.now());
        this.props.onDrawEnd({
          type: 'ellipse',
          id,
          ...ellipseBounds,
          fill: this.props.drawingFill,
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
      x,
      y,
      drawingFill,
      drawingStroke,
      drawingStrokeWidth,
      children,
      clipPath,
    } = this.props;

    const ellipseBounds = this.getEllipseBounds();

    return (
      <g
        key="artboard"
        style={artboardStyles}
        clipPath={clipPath}
        onMouseDown={this.handleArtboardMouseDown}
      >
        <rect
          fill="none"
          x={`${x}`}
          y={`${y}`}
          width={`${width}`}
          height={`${height}`}
        />
        {children}
        {ellipseBounds && (
          <ellipse
            {...ellipseBounds}
            key="rect"
            fill={drawingFill}
            stroke={drawingStroke}
            strokeWidth={drawingStrokeWidth}
          />
        )}
      </g>
    );
  }
}
