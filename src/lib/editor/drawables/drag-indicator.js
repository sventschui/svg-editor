// @flow
import React, { PureComponent } from 'react';
import memoize from 'memoize-one';

type Props = {|
  id: string,
  onDragIndicatorMouseDown: (e: MouseEvent) => void,
  onResizeHandleTopLeftMouseDown?: (e: MouseEvent) => void,
  onResizeHandleTopRightMouseDown?: (e: MouseEvent) => void,
  onResizeHandleBottomLeftMouseDown?: (e: MouseEvent) => void,
  onResizeHandleBottomRightMouseDown?: (e: MouseEvent) => void,
  onRemoveDrawable?: (e: MouseEvent) => void,
  diX: number,
  diY: number,
  diWidth: number,
  diHeight: number,
  diStrokeWidth: number,
  selected: boolean,
  diLeft?: number,
  diRight?: number,
  diTop?: number,
  diBottom?: number,
|};

export default class DragIndicator extends PureComponent<Props> {
  makeDiStyles = memoize((selected: boolean, strokeWidth: number) => ({
    pointerEvents: 'bounding-box',
    fill: 'none',
    stroke: selected ? 'gray' : 'none',
    strokeWidth,
    // TODO: make stroke dashed
  }));

  makeResizHandleStyles = memoize((selected: boolean) => ({
    pointerEvents: 'bounding-box',
    fill: selected ? 'blue' : 'none',
    stroke: 'none',
  }));

  render() {
    const {
      id,
      onDragIndicatorMouseDown,
      onResizeHandleTopLeftMouseDown,
      onResizeHandleTopRightMouseDown,
      onResizeHandleBottomLeftMouseDown,
      onResizeHandleBottomRightMouseDown,
      onRemoveDrawable,
      diX,
      diY,
      diWidth,
      diHeight,
      diStrokeWidth,
      selected,
    } = this.props;

    const diStrokeWidthHalf = diStrokeWidth / 2;

    const diTop = this.props.diTop || (diY - diStrokeWidthHalf);
    const diBottom = this.props.diBottom || (diY - diStrokeWidthHalf + diHeight);
    const diLeft = this.props.diLeft || (diX - diStrokeWidthHalf);
    const diRight = this.props.diRight || (diX - diStrokeWidthHalf + diWidth);

    return (
      <g>
        <rect
          style={this.makeDiStyles(selected, diStrokeWidth)}
          x={diX}
          y={diY}
          width={diWidth}
          height={diHeight}
          strokeWidth={diStrokeWidth}
          onMouseDown={onDragIndicatorMouseDown}
        />
        {selected && onRemoveDrawable && <path fill="gray"
          style={{ cursor: 'pointer' }}
          d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"
          transform={`translate(${diRight - 16}, ${diBottom + 8})`}
          onClick={onRemoveDrawable}
        />}
        {onResizeHandleTopLeftMouseDown && (
          <circle
            style={this.makeResizHandleStyles(selected)}
            cx={diLeft}
            cy={diTop}
            r="8"
            onMouseDown={onResizeHandleTopLeftMouseDown}
            data-id={id}
          />
        )}
        {onResizeHandleTopRightMouseDown && (
          <circle
            style={this.makeResizHandleStyles(selected)}
            cx={diRight}
            cy={diTop}
            r="8"
            onMouseDown={onResizeHandleTopRightMouseDown}
            data-id={id}
          />
        )}
        {onResizeHandleBottomLeftMouseDown && (
          <circle
            style={this.makeResizHandleStyles(selected)}
            cx={diLeft}
            cy={diBottom}
            r="8"
            onMouseDown={onResizeHandleBottomLeftMouseDown}
            data-id={id}
          />
        )}
        {onResizeHandleBottomRightMouseDown && (
          <circle
            style={this.makeResizHandleStyles(selected)}
            cx={diRight}
            cy={diBottom}
            r="8"
            onMouseDown={onResizeHandleBottomRightMouseDown}
            data-id={id}
          />
        )}
      </g>
    );
  }
}
