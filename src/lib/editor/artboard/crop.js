// @flow
import React, { PureComponent, Fragment } from 'react';


export type Crop = {
  x: number,
  y: number,
  width: number,
  height: number,
}

type Props ={|
  width: number,
  height: number,
  onCropEnd: (crop: Crop) => void,
  minWidth: number,
  minHeight: number,
|};

type State = {
  startCoord?: { x: number, y: number } | null,
  currentCoord?: { x: number, y: number } | null,
};

const artboardStyles = { pointerEvents: 'all' };

export default class ArtboardCut extends PureComponent<Props, State> {
  static defaultProps = {
    minWidth: 10,
    minHeight: 10,
  }

  state = {};

  getRectBounds = () => {
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
      x: lowerX,
      y: lowerY,
      width,
      height,
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

      const rectBounds = this.getRectBounds();

      if (rectBounds) {
        this.props.onCropEnd({
          ...rectBounds,
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
    } = this.props;

    const rectBounds = this.getRectBounds();

    return (
      <Fragment>
        <rect
          style={artboardStyles}
          pointerEvents="bounding-box"
          key="artboard"
          fill="none"
          onMouseDown={this.handleArtboardMouseDown}
          x={0}
          y={0}
          width={width}
          height={height}
        />
        {rectBounds && (
          <rect
            {...rectBounds}
            fill="none"
            stroke="blue"
            strokeWidth="2"
          />
        )}
      </Fragment>
    );
  }
}
