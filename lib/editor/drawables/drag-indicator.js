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
