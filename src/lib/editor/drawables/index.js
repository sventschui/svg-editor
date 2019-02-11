// @flow
import React, { PureComponent } from 'react';
import EllipseDrawable from './ellipse';
import LineDrawable from './line';
import PathDrawable from './path';
import RectDrawable from './rect';

export type Drawable = {
  type: 'rect',
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  strokeWidth: number,
  stroke: string,
  fill: string,
} | {
  type: 'ellipse',
  id: string,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  strokeWidth: number,
  stroke: string,
  fill: string,
} | {
  type: 'line',
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  strokeWidth: number,
  stroke: string,
} | {
  type: 'path',
  id: string,
  points: Array<{ x: number, y: number }>,
  strokeWidth: number,
  stroke: string,
};

type Props = {|
  height: number,
  width: number,
  canSelectDrawable: boolean,
  selectedDrawable?: ?string,
  onSelectDrawable: (id: string) => void,
  onDrawableTranslate: (id: string, x: number, y: number) => void,
  onRemoveDrawable: (id: string) => void,
  onResizeDrawable: (
    e: MouseEvent,
    id: string,
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
    newX: number,
    newY: number,
  ) => void,
  drawables: Array<Drawable>,
|};

type State = {
  diStrokeWidth: ?number,
};

export default class Drawables extends PureComponent<Props, State> {
  state = {
    diStrokeWidth: null,
  };

  referenceRect: ?Element = null;

  referenceRectRef = (el: ?Element) => {
    this.referenceRect = el;

    if (this.referenceRect) {
      // TODO: calc this
      this.setState({ diStrokeWidth: 5 });
    }
  };

  handleDragIndicatorMouseDown = (e: MouseEvent, id: string) => {
    if (!this.props.canSelectDrawable) {
      return;
    }

    const { referenceRect } = this;

    if (!referenceRect) {
      console.error('referenceRect not available!'); // eslint-disable-line no-console
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

    // select the drawable, if not yet selected
    if (this.props.selectedDrawable !== id) {
      this.props.onSelectDrawable(id);
    }

    // move the drawable with the mouse
    let lastCoords = transformPoint(e);

    const mouseMoveHandler = (e2: MouseEvent) => {
      const currentCoords = transformPoint(e2);

      this.props.onDrawableTranslate(
        id,
        currentCoords.x - lastCoords.x,
        currentCoords.y - lastCoords.y,
      );

      lastCoords = currentCoords;
    };

    const mouseUpHandler = () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };

    window.addEventListener('mousemove', mouseMoveHandler);
    window.addEventListener('mouseup', mouseUpHandler);
  }

  handleDrawableSelect = (e: MouseEvent, id: string) => {
    if (!this.props.canSelectDrawable) {
      return;
    }

    e.stopPropagation();
    this.props.onSelectDrawable(id);
  };

  handleRemoveDrawable = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    this.props.onRemoveDrawable(id);
  };

  handleResizeHandleMouseDown = (e: MouseEvent, id: string, handleX: 'left' | 'right', handleY: 'top' | 'bottom') => {
    if (!this.props.canSelectDrawable) {
      return;
    }

    e.stopPropagation();

    const { referenceRect } = this;

    if (!referenceRect) {
      console.error('Reference rect not available!'); // eslint-disable-line no-console
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

    const mouseMoveHandler = (e2) => {
      const newCoords = transformPoint(e2);

      this.props.onResizeDrawable(
        e,
        id,
        handleX,
        handleY,
        newCoords.x,
        newCoords.y,
      );
    };

    const mouseUpHandler = () => {
      window.removeEventListener('mousemove', mouseMoveHandler);
      window.removeEventListener('mouseup', mouseUpHandler);
    };

    window.addEventListener('mouseup', mouseUpHandler);
    window.addEventListener('mousemove', mouseMoveHandler);
  }

  render() {
    const { height, width, selectedDrawable } = this.props;
    const { diStrokeWidth } = this.state;

    return (
      <g>
        {/* invisible rect to determine actual width/height and convert
          stuff to viewBox coordinates */}
        <rect
          x="0"
          y="0"
          height={`${height}`}
          width={`${width}`}
          ref={this.referenceRectRef}
          fill="none"
        />
        {diStrokeWidth && this.props.drawables.map((item) => {
          switch (item.type) {
            case 'ellipse':
              return (
                <EllipseDrawable
                  key={item.id}
                  id={item.id}
                  cx={item.cx}
                  cy={item.cy}
                  rx={item.rx}
                  ry={item.ry}
                  fill={item.fill}
                  stroke={item.stroke}
                  strokeWidth={item.strokeWidth}
                  selected={selectedDrawable === item.id}
                  onSelect={this.handleDrawableSelect}
                  onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
                  dragIndicatorStrokeWidth={diStrokeWidth}
                  onResizeHandleMouseDown={this.handleResizeHandleMouseDown}
                  onRemoveDrawable={this.handleRemoveDrawable}
                />
              );
            case 'line':
              return (
                <LineDrawable
                  key={item.id}
                  id={item.id}
                  x1={item.x1}
                  x2={item.x2}
                  y1={item.y1}
                  y2={item.y2}
                  stroke={item.stroke}
                  strokeWidth={item.strokeWidth}
                  selected={selectedDrawable === item.id}
                  onSelect={this.handleDrawableSelect}
                  onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
                  dragIndicatorStrokeWidth={diStrokeWidth}
                  onResizeHandleMouseDown={this.handleResizeHandleMouseDown}
                  onRemoveDrawable={this.handleRemoveDrawable}
                />
              );
            case 'path':
              return (
                <PathDrawable
                  key={item.id}
                  id={item.id}
                  points={item.points}
                  stroke={item.stroke}
                  strokeWidth={item.strokeWidth}
                  selected={selectedDrawable === item.id}
                  onSelect={this.handleDrawableSelect}
                  onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
                  dragIndicatorStrokeWidth={diStrokeWidth}
                  onRemoveDrawable={this.handleRemoveDrawable}
                />
              );
            case 'rect':
              return (
                <RectDrawable
                  key={item.id}
                  id={item.id}
                  x={item.x}
                  y={item.y}
                  width={item.width}
                  height={item.height}
                  fill={item.fill}
                  stroke={item.stroke}
                  strokeWidth={item.strokeWidth}
                  selected={selectedDrawable === item.id}
                  onSelect={this.handleDrawableSelect}
                  onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
                  dragIndicatorStrokeWidth={diStrokeWidth}
                  onResizeHandleMouseDown={this.handleResizeHandleMouseDown}
                  onRemoveDrawable={this.handleRemoveDrawable}
                />
              );
            default:
              console.error('item of unknown type could not be drawn', item); // eslint-disable-line no-console
              return null;
          }
        })}
      </g>
    );
  }
}
