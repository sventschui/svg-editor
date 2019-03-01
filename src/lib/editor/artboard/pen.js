// @flow
import React, { PureComponent, type Node } from 'react';
import type { Drawable } from '../drawables';
import ArtboardBase from './base';

type Props ={
  drawingStroke: string,
  drawingStrokeWidth: number,
  width: number,
  height: number,
  children: Node,
  onDrawEnd: (drawable: Drawable) => void,
  clipPath?: string,
  x: number,
  y: number,
};

type State = {
  drawingPoints?: ?Array<{ x: number, y: number }>,
};

export default class ArtboardPen extends PureComponent<Props, State> {
  static defaultProps = {
    drawingStroke: 'black',
    drawingStrokeWidth: 5,
  }

  state = {};

  onMouseDown = ({ start }: { start: { x: number, y: number } }) => {
    this.setState({ drawingPoints: [start] });
  }

  onMouseMove = ({ current }: {
    current: { x: number, y: number },
  }) => {
    this.setState((state) => {
      const copy = state.drawingPoints.slice();
      copy.push(current);
      return { drawingPoints: copy };
    });
  }

  onMouseUp = ({ current }: {
    current: { x: number, y: number },
    start: { x: number, y: number },
  }) => {
    this.setState((state) => {
      const points = state.drawingPoints.slice();
      points.push(current);

      const id = String(Date.now());
      this.props.onDrawEnd({
        type: 'path',
        id,
        points,
        stroke: this.props.drawingStroke,
        strokeWidth: this.props.drawingStrokeWidth,
      });

      return { drawingPoints: null };
    });
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

    const {
      drawingPoints,
    } = this.state;

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
        {drawingPoints && (
          <path
            key="path"
            d={`M ${drawingPoints.map(p => p && `${p.x} ${p.y}`).join('L')}`}
            fill="none"
            strokeWidth={drawingStrokeWidth}
            stroke={drawingStroke}
          />
        )}
      </ArtboardBase>
    );
  }
}
