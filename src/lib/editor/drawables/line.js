// @flow
import React, { PureComponent } from 'react';
import DragIndicator from './drag-indicator';

type Props = {|
  id: string,
  x1: number,
  x2: number,
  y1: number,
  y2: number,
  stroke: string,
  strokeWidth: number,
  selected: boolean,
  onSelect: (e: MouseEvent, id: string) => void,
  onDragIndicatorMouseDown: (e: MouseEvent, id: string) => void,
  dragIndicatorStrokeWidth: number,
  onResizeHandleMouseDown: (e: MouseEvent, id: string, handleX: 'left' | 'right', handleY: 'top' | 'bottom') => void
|};

export default class LineDrawable extends PureComponent<Props> {
  handleClick = (e: MouseEvent) => {
    this.props.onSelect(e, this.props.id);
  }

  handleResizeHandleTopLeftMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, this.props.id, 'left', 'top');

  handleResizeHandleBottomRightMouseDown = (e: MouseEvent) => this.props.onResizeHandleMouseDown(e, this.props.id, 'right', 'bottom');

  handleDragIndicatorMouseDown = (e: MouseEvent) => {
    this.props.onDragIndicatorMouseDown(e, this.props.id);
  };

  render() {
    const {
      id,
      x1,
      x2,
      y1,
      y2,
      stroke,
      strokeWidth,
      selected,
      dragIndicatorStrokeWidth: diStrokeWidth,
    } = this.props;

    const diStrokeWidthHalf = diStrokeWidth / 2;

    const lowerX = Math.min(x1, x2);
    const higherX = Math.max(x1, x2);
    const lowerY = Math.min(y1, y2);
    const higherY = Math.max(y1, y2);
    const diX = lowerX - diStrokeWidthHalf;
    const diY = lowerY - diStrokeWidthHalf;
    const diWidth = higherX - lowerX + diStrokeWidth;
    const diHeight = higherY - lowerY + diStrokeWidth;

    return (
      <g
        style={{ pointerEvents: 'bounding-box' }}
        data-id={id}
        onClick={this.handleClick}
      >
        <line x1={x1} x2={x2} y1={y1} y2={y2} stroke={stroke} strokeWidth={strokeWidth} />
        <DragIndicator
          id={id}
          onDragIndicatorMouseDown={this.handleDragIndicatorMouseDown}
          onResizeHandleTopLeftMouseDown={this.handleResizeHandleTopLeftMouseDown}
          onResizeHandleBottomRightMouseDown={this.handleResizeHandleBottomRightMouseDown}
          diX={diX}
          diY={diY}
          diWidth={diWidth}
          diHeight={diHeight}
          diStrokeWidth={diStrokeWidth}
          selected={selected}
          diLeft={x1}
          diRight={x2}
          diTop={y1}
          diBottom={y2}
        />
      </g>
    );
  }
}
