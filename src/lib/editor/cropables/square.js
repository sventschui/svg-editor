// @flow
import React, { PureComponent } from 'react';
import DragIndicator from '../drawables/drag-indicator';

type Props = {|
  x: number,
  y: number,
  width: number,
  height: number,
  active: boolean,
  onDragIndicatorMouseDown: (e: MouseEvent) => void,
  onResizeHandleMouseDown: (e: MouseEvent, handleX: 'left' | 'right', handleY: 'top' | 'bottom') => void,
|};

export default class RectCrop extends PureComponent<Props> {
  handleResizeHandleTopLeftMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, 'left', 'top');

  handleResizeHandleTopRightMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, 'right', 'top');

  handleResizeHandleBottomLeftMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, 'left', 'bottom');

  handleResizeHandleBottomRightMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, 'right', 'bottom');

  handleDragIndicatorMouseDown = (e: MouseEvent) => {
    this.props.onDragIndicatorMouseDown(e);
  };

  render() {
    const {
      x,
      y,
      width,
      height,
      active,
    } = this.props;

    const id = 'svg-editor-cut';
    const diStrokeWidth = 2;

    const diStrokeWidthHalf = diStrokeWidth / 2;

    const diX = x - diStrokeWidthHalf;
    const diY = y - diStrokeWidthHalf;
    const diWidth = width + diStrokeWidth;
    const diHeight = height + diStrokeWidth;

    console.log('cropable#square');

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
          onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
          onResizeHandleTopLeftMouseDown={this.handleResizeHandleTopLeftMouseDown}
          onResizeHandleTopRightMouseDown={this.handleResizeHandleTopRightMouseDown}
          onResizeHandleBottomLeftMouseDown={this.handleResizeHandleBottomLeftMouseDown}
          onResizeHandleBottomRightMouseDown={this.handleResizeHandleBottomRightMouseDown}
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
