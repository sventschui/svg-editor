// @flow

import React, { PureComponent, type Node } from 'react';
import memoize from 'memoize-one';

export type Props = {
  // source info
  backgroundUrl: string,
  width: number,
  height: number,

  // zoom, rotate, translate
  zoom: number,
  translateX: number,
  translateY: number,
  rotate: 0 | 90 | 180 | 270;
  onZoom: (newZoom: number) => void,
  minZoom?: number,
  maxZoom?: number,

  // drag support
  allowDrag: boolean,
  onDragStart?: () => void,
  onDragEnd?: () => void,
  onDrag: (x: number, y: number) => void,

  children?: Node,

  canvasSytle?: ?any,
  canvasClassName?: ?string,

  // draw support: TODO: move to other component
  // onDrawEnd: (shape: DrawItem) => void,
  // drawMethod?: 'path' | null,
  // drawStroke?: string,
  // drawStrokeWidth?: number,
  // drawFill?: string,
};

type State = {
  // selectedItem?: string | null,
  // drawingPoints?: Array<DrawingPoint> | null,
};

// function Path({
//   points,
//   stroke,
//   strokeWidth,
// }: {
//   points: Array<DrawingPoint>,
//   stroke: string,
//   strokeWidth: number,
// }) {
//   return (
//     <path
//       d={`M ${points.map(p => `${p.x} ${p.y}`).join('L')}`}
//       fill="none"
//       strokeWidth={strokeWidth}
//       stroke={stroke}
//     />
//   );
// }

export default class Editor extends PureComponent<$Exact<Props>, State> {
  referenceRectNoZoom: { current: null | Element } = React.createRef();

  makeZoomAndTranslateStyles = memoize((
    zoom: number,
    imageWidth: number,
    imageHeight: number,
    translateX: number,
    translateY: number,
    rotate: 0 | 90 | 180 | 270,
  ) => {
    const matrix = [zoom, 0, 0, zoom, translateX, translateY];

    if (rotate === 0) {
      matrix[4] -= (imageWidth / 2) * (zoom - 1);
      matrix[5] -= (imageHeight / 2) * (zoom - 1);
    } else if (rotate === 90) {
      // 1 0 0 1 x y -> 0 1 -1 0 x y
      matrix[1] = matrix[0]; // eslint-disable-line prefer-destructuring
      matrix[0] = 0;
      matrix[2] = -matrix[3];
      matrix[3] = 0;

      matrix[4] += imageHeight + ((imageHeight / 2) * (zoom - 1));
      matrix[5] -= (imageWidth / 2) * (zoom - 1);
    } else if (rotate === 180) {
      // 1 0 0 1 x y -> -1 0 0 -1 x y
      matrix[0] *= -1;
      matrix[3] *= -1;

      matrix[4] += imageWidth + ((imageWidth / 2) * (zoom - 1));
      matrix[5] += imageHeight + ((imageHeight / 2) * (zoom - 1));
    } else if (rotate === 270) {
      // 1 0 0 1 x y -> 0 -1 1 0 x y
      matrix[1] = -matrix[0];
      matrix[0] = 0;
      matrix[2] = matrix[3]; // eslint-disable-line prefer-destructuring
      matrix[3] = 0;

      matrix[4] -= ((imageHeight / 2) * (zoom - 1));
      matrix[5] += imageWidth + ((imageWidth / 2) * (zoom - 1));
    }

    return {
      transform: `matrix(${matrix[0]}, ${matrix[1]}, ${matrix[2]}, ${matrix[3]}, ${matrix[4]}, ${matrix[5]})`,
    };
  });

  svgMouseDownHandler = (e: MouseEvent) => {
    if (this.props.allowDrag) {
      const referenceRect = this.referenceRectNoZoom.current;

      if (!referenceRect) {
        console.error('ReferenceRectNoZoom not available!'); // eslint-disable-line no-console
        return;
      }

      const svg = referenceRect.closest('svg');

      if (!svg) {
        console.error('svg not found'); // eslint-disable-line no-console
        return;
      }

      // $FlowFixMe flow doesn't know artboard is an SVGGraphicsElement
      const inverseMatrix = referenceRect.getScreenCTM().inverse();

      const transformPoint = ({ clientX, clientY }) => {
        // $FlowFixMe flow doesn't know we get an SVG element
        let pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        pt = pt.matrixTransform(inverseMatrix);

        return { x: pt.x, y: pt.y };
      };

      e.stopPropagation();

      if (this.props.onDragStart) {
        this.props.onDragStart();
      }

      let lastCoords = transformPoint(e);

      const mouseMoveHandler = (e2: MouseEvent) => {
        const newCoords = transformPoint(e2);

        this.props.onDrag(
          this.props.translateX + newCoords.x - lastCoords.x,
          this.props.translateY + newCoords.y - lastCoords.y,
        );

        lastCoords = newCoords;
      };

      const mouseUpHandler = () => {
        window.removeEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('mouseup', mouseUpHandler);

        if (this.props.onDragEnd) {
          this.props.onDragEnd();
        }
      };

      window.addEventListener('mousemove', mouseMoveHandler);
      window.addEventListener('mouseup', mouseUpHandler);
    }
  };

  // svgMouseDownHandlerDrawPath = (e: MouseEvent) => {
  //   const referenceRect = this.referenceRect.current;

  //   if (!referenceRect) {
  //     console.error('Reference rect not available!');
  //     return;
  //   }

  //   const rect = referenceRect.getBoundingClientRect();

  //   const initialCoords = convertToLocalCoordinates(
  //     referenceRect,
  //     e.clientX - rect.x,
  //     e.clientY - rect.y,
  //   );

  //   const points = [initialCoords];
  //   this.setState({ drawingPoints: points });

  //   const mouseMoveHandler = (e2: MouseEvent) => {
  //     points.push(convertToLocalCoordinates(
  //       referenceRect,
  //       e2.clientX - rect.x,
  //       e2.clientY - rect.y,
  //     ));
  //     this.setState({ drawingPoints: points.slice() });
  //   };

  //   const mouseUpHandler = () => {
  //     window.removeEventListener('mousemove', mouseMoveHandler);
  //     window.removeEventListener('mouseup', mouseUpHandler);
  //     // TODO: finish drawing...

  //     const id = String(Date.now());
  //     this.props.onDrawEnd({
  //       type: 'path',
  //       id,
  //       points,
  //       stroke: this.props.drawStroke || 'black',
  //       strokeWidth: this.props.drawStrokeWidth || 5,
  //     });
  //     this.setState({
  //       drawingPoints: null,
  //       selectedItem: id,
  //     });
  //   };

  //   window.addEventListener('mousemove', mouseMoveHandler);
  //   window.addEventListener('mouseup', mouseUpHandler);
  // };

  handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    this.props.onZoom(Math.min(
      this.props.maxZoom || 4,
      Math.max(
        this.props.minZoom || 1,
        this.props.zoom + (e.deltaY / 100),
      ),
    ));
  };

  render() {
    const {
      backgroundUrl,
      width: imageWidth,
      height: imageHeight,
      zoom,
      translateX,
      translateY,
      rotate,
      canvasSytle,
      canvasClassName,
    } = this.props;

    let width: number;
    let height: number;
    if (rotate === 90 || rotate === 270) {
      width = imageHeight;
      height = imageWidth;
    } else {
      width = imageWidth;
      height = imageHeight;
    }

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        onMouseDown={this.svgMouseDownHandler}
        onWheel={this.handleWheel}
        style={canvasSytle}
        className={canvasClassName}
      >
        {/* invisible rect to determine actual width/height and convert
          stuff to viewBox coordinates */}
        <rect
          x="0"
          y="0"
          width={`${width}`}
          height={`${height}`}
          ref={this.referenceRectNoZoom}
          fill="none"
        />
        {/* the zoomable part of the svg */}
        <g
          style={this.makeZoomAndTranslateStyles(
            zoom,
            imageWidth,
            imageHeight,
            translateX,
            translateY,
            rotate,
          )}
        >
          {/* The canvas (aka artboard) */}
          <image xlinkHref={backgroundUrl} x="0" y="0" height={`${imageHeight}`} width={`${imageWidth}`} />
          {this.props.children}
        </g>
      </svg>
    );
  }
}
