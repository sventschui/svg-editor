// @flow
import React, { PureComponent, type Node } from 'react';
import type { Drawable } from '../drawables';
import ArtboardBase from './base';

type Props ={
  drawingStroke: string,
  drawingStrokeWidth: number,
  children: Node,
  width: number,
  height: number,
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

export default class ArtboardRect extends PureComponent<Props, State> {
  static defaultProps = {
    drawingStroke: 'black',
    drawingStrokeWidth: 5,
    minWidth: 10,
    minHeight: 10,
  }

  state = {};

  getLinePoints = ({ startCoord, currentCoord }: {
    startCoord?: { x: number, y: number } | null,
    currentCoord?: { x: number, y: number } | null,
  }) => {
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

    const linePoints = this.getLinePoints({ startCoord: start, currentCoord: current });

    if (linePoints) {
      const id = String(Date.now());
      this.props.onDrawEnd({
        type: 'line',
        id,
        ...linePoints,
        fill: this.props.drawingFill,
        stroke: this.props.drawingStroke,
        strokeWidth: this.props.drawingStrokeWidth,
      });
    }
    this.setState({ startCoord: null, currentCoord: null });
  }

  render() {
    const {
      width,
      height,
      x,
      y,
      drawingStroke,
      drawingStrokeWidth,
      children,
      clipPath,
    } = this.props;

    const points = this.getLinePoints(this.state);

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
        {points && (
          <line
            {...points}
            stroke={drawingStroke}
            strokeWidth={drawingStrokeWidth}
          />
        )}
      </ArtboardBase>
    );
  }
}
