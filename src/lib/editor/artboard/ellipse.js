// @flow
import React, { PureComponent, type Node } from 'react';
import type { Drawable } from '../drawables';
import ArtboardBase from './base';

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

  onMouseDown = ({ start }: { start: { x: number, y: number } }) => {
    this.setState({ startCoord: start });
  }

  onMouseMove = ({ current, start }: {
    current: { x: number, y: number },
    start: { x: number, y: number },
  }) => {
    this.setState({ startCoord: start, currentCoord: current });
  }

  onMouseUp = ({ current, start }: {
    current: { x: number, y: number },
    start: { x: number, y: number },
  }) => {
    this.setState({ startCoord: start, currentCoord: current });

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
      <ArtboardBase
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        width={width}
        height={height}
        x={x}
        y={y}
        clipPath={clipPath}
      >
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
      </ArtboardBase>
    );
  }
}
