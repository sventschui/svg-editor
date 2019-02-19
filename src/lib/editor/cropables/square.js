// @flow
import React, { PureComponent } from 'react';
import DragIndicator from '../drawables/drag-indicator';

type Props = {|
  x: number,
  y: number,
  width: number,
  height: number,
  rotate: 0 | 90 | 180 | 270,
  active: boolean,
  onDragIndicatorMouseDown: (e: MouseEvent) => void,
  onResizeHandleMouseDown: (e: MouseEvent, handleX: 'left' | 'right', handleY: 'top' | 'bottom') => void,
  onRemoveCrop: (e: MouseEvent) => void,
|};

export default class RectCrop extends PureComponent<Props> {
  handleResizeHandleTopLeftMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, 'left', 'top');

  handleResizeHandleTopRightMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, 'right', 'top');

  handleResizeHandleBottomLeftMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, 'left', 'bottom');

  handleResizeHandleBottomRightMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, 'right', 'bottom');

  handleDragIndicatorMouseDown = (e: MouseEvent) => {
    this.props.onDragIndicatorMouseDown(e);
  };

  handleRemoveCrop = (e: MouseEvent) => this.props.onRemoveCrop(e);

  render() {
    const {
      x,
      y,
      width,
      height,
      active,
      rotate,
    } = this.props;

    const id = 'svg-editor-cut';
    const diStrokeWidth = 2;

    const diStrokeWidthHalf = diStrokeWidth / 2;

    const diX = x - diStrokeWidthHalf;
    const diY = y - diStrokeWidthHalf;
    const diWidth = width + diStrokeWidth;
    const diHeight = height + diStrokeWidth;

    return (
      <g
        style={{ pointerEvents: 'bounding-box' }}
        data-id={id}
      >

        <clipPath id={id}>
          <rect
            x={x}
            y={y}
            width={width}
            height={height}
          />
        </clipPath>

        <DragIndicator
          id={id}
          rotate={rotate}
          onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
          onResizeHandleTopLeftMouseDown={this.handleResizeHandleTopLeftMouseDown}
          onResizeHandleTopRightMouseDown={this.handleResizeHandleTopRightMouseDown}
          onResizeHandleBottomLeftMouseDown={this.handleResizeHandleBottomLeftMouseDown}
          onResizeHandleBottomRightMouseDown={this.handleResizeHandleBottomRightMouseDown}
          onRemoveDrawable={this.handleRemoveCrop}
          diX={diX}
          diY={diY}
          diWidth={diWidth}
          diHeight={diHeight}
          diStrokeWidth={diStrokeWidth}
          selected={active}
        />
      </g>
    );
  }
}
