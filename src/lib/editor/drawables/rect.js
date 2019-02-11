// @flow
import React, { PureComponent } from 'react';
import DragIndicator from './drag-indicator';

type Props = {|
  id: string,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke: string,
  strokeWidth: number,
  selected: boolean,
  onSelect: (e: MouseEvent, id: string) => void,
  onDragIndicatorMouseDown: (e: MouseEvent, id: string) => void,
  dragIndicatorStrokeWidth: number,
  onResizeHandleMouseDown: (e: MouseEvent, id: string, handleX: 'left' | 'right', handleY: 'top' | 'bottom') => void,
  onRemoveDrawable: (e: MouseEvent, id: string) => void,
|};

export default class RectDrawable extends PureComponent<Props> {
  handleClick = (e: MouseEvent) => {
    this.props.onSelect(e, this.props.id);
  }

  handleResizeHandleTopLeftMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, this.props.id, 'left', 'top');

  handleResizeHandleTopRightMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, this.props.id, 'right', 'top');

  handleResizeHandleBottomLeftMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, this.props.id, 'left', 'bottom');

  handleResizeHandleBottomRightMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, this.props.id, 'right', 'bottom');

  handleDragIndicatorMouseDown = (e: MouseEvent) => {
    this.props.onDragIndicatorMouseDown(e, this.props.id);
  };

  handleRemoveDrawable = (e: MouseEvent) => this.props.onRemoveDrawable(e, this.props.id);

  render() {
    const {
      id,
      x,
      y,
      width,
      height,
      fill,
      stroke,
      strokeWidth,
      selected,
      dragIndicatorStrokeWidth: diStrokeWidth,
    } = this.props;

    const diStrokeWidthHalf = diStrokeWidth / 2;

    const diX = x - diStrokeWidthHalf;
    const diY = y - diStrokeWidthHalf;
    const diWidth = width + diStrokeWidth;
    const diHeight = height + diStrokeWidth;

    return (
      <g
        style={{ pointerEvents: 'bounding-box' }}
        data-id={id}
        onClick={this.handleClick}
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
        <DragIndicator
          id={id}
          onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
          onResizeHandleTopLeftMouseDown={this.handleResizeHandleTopLeftMouseDown}
          onResizeHandleTopRightMouseDown={this.handleResizeHandleTopRightMouseDown}
          onResizeHandleBottomLeftMouseDown={this.handleResizeHandleBottomLeftMouseDown}
          onResizeHandleBottomRightMouseDown={this.handleResizeHandleBottomRightMouseDown}
          onRemoveDrawable={this.handleRemoveDrawable}
          diX={diX}
          diY={diY}
          diWidth={diWidth}
          diHeight={diHeight}
          diStrokeWidth={diStrokeWidth}
          selected={selected}
        />
      </g>
    );
  }
}
