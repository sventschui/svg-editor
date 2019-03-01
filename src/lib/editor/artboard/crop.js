// @flow
import React, { PureComponent, type Node } from 'react';
import ArtboardBase from './base';

export type Crop = {
  x: number,
  y: number,
  width: number,
  height: number,
}

type Props = {
  width: number,
  height: number,
  onCropEnd: (crop: Crop) => void,
  minWidth: number,
  minHeight: number,
  children: Node,
};

type State = {
  startCoord?: { x: number, y: number } | null,
  currentCoord?: { x: number, y: number } | null,
};

export default class ArtboardCut extends PureComponent<Props, State> {
  static defaultProps = {
    minWidth: 10,
    minHeight: 10,
  }

  state = {};

  getRectBounds = ({ startCoord, currentCoord }) => {
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
      x: lowerX,
      y: lowerY,
      width,
      height,
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

    const rectBounds = this.getRectBounds({ startCoord: start, currentCoord: current });

    if (rectBounds) {
      this.props.onCropEnd(rectBounds);
    }
    this.setState({ startCoord: null, currentCoord: null });
  }

  render() {
    const {
      width,
      height,
      children,
    } = this.props;

    const rectBounds = this.getRectBounds(this.state);

    return (
      <ArtboardBase
        onMouseDown={this.onMouseDown}
        onMouseMove={this.onMouseMove}
        onMouseUp={this.onMouseUp}
        width={width}
        height={height}
        x={0}
        y={0}
      >
        {children}
        {rectBounds && (
          <rect
            {...rectBounds}
            fill="none"
            stroke="blue"
            strokeWidth="2"
          />
        )}
        {rectBounds && (
          <path
            d={`M0 0 H${width} V${height} H0 Z M${rectBounds.x} ${rectBounds.y} H${rectBounds.x + rectBounds.width} V${rectBounds.y + rectBounds.height} H${rectBounds.x} Z`}
            fillRule="evenodd"
            fill="#00000050"
          />
        )}
      </ArtboardBase>
    );
  }
}
