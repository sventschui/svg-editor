// @flow
import React, { PureComponent, Fragment } from 'react';
import UncontrolledEditor, { type Props as UncontrolledEditorProps } from './uncontrolled';
import Drawables, { type Drawable } from './drawables';
// import convertToLocalCoordinates from '../util/to-local-coordinates';

type Props = UncontrolledEditorProps & {
  initialZoom?: number,
  drawables?: Array<Drawable>,
  onDrawablesChange?: (drawables: Array<Drawable>) => void,
  defaultDrawables?: Array<Drawable>,
  drawMode: 'pen' | null,
  drawingStroke?: ?string;
  drawingStrokeWidth?: ?number;
};

type State = {|
  zoom: number,
  drawables: Array<Drawable>,
  selectedDrawable?: ?string,
  drawingPoints?: ?Array<{ x: number, y: number }>,
|};

function Path({
  points,
  stroke,
  strokeWidth,
}: {
  points: Array<{ x: number, y: number }>,
  stroke: string,
  strokeWidth: number,
}) {
  return (
    <path
      d={`M ${points.map(p => `${p.x} ${p.y}`).join('L')}`}
      fill="none"
      strokeWidth={strokeWidth}
      stroke={stroke}
    />
  );
}

const rectMinWidth = 10;
const ellipseMinWidth = 10;

export default class UncontrolledEditorWithDrawables extends PureComponent<Props, State> {
  artboard: { current: null | Element } = React.createRef();

  constructor(props: Props) {
    super(props);

    this.state = {
      drawables: props.defaultDrawables || [],
      zoom: props.initialZoom || 1,
    };
  }

  handleSelectDrawable = (selectedDrawable: string) => {
    this.setState({ selectedDrawable });
  }

  handleZoom = (zoom: number) => {
    this.setState({ zoom });
  }

  handleArtboardMouseDown = (e: MouseEvent) => {
    if (this.props.drawMode === 'pen') {
      const artboard = this.artboard.current;

      if (!artboard) {
        console.error('artboard rect not available!'); // eslint-disable-line no-console
        return;
      }

      const svg = artboard.closest('svg');

      if (!svg) {
        console.error('svg not found'); // eslint-disable-line no-console
        return;
      }

      // $FlowFixMe flow doesn't know artboard is an SVGGraphicsElement
      const inverseMatrix = artboard.getScreenCTM().inverse();

      e.stopPropagation();

      const transformPoint = ({ clientX, clientY }) => {
        // $FlowFixMe flow doesn't know we get an SVG element
        let pt = svg.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        pt = pt.matrixTransform(inverseMatrix);

        return { x: pt.x, y: pt.y };
      };

      const initialCoords = transformPoint(e);

      const points = [initialCoords];
      this.setState({ drawingPoints: points });

      const mouseMoveHandler = (e2: MouseEvent) => {
        points.push(transformPoint(e2)); /* convertToLocalCoordinates(
          artboard,
          e2.clientX - rect.left,
          e2.clientY - rect.top,
        ))); */
        this.setState({ drawingPoints: points.slice() });
      };

      const mouseUpHandler = () => {
        window.removeEventListener('mousemove', mouseMoveHandler);
        window.removeEventListener('mouseup', mouseUpHandler);
        // TODO: finish drawing...

        const id = String(Date.now());
        this.setState((state) => {
          const drawables = [...state.drawables, {
            type: 'path',
            id,
            points,
            stroke: this.props.drawingStroke || 'black',
            strokeWidth: this.props.drawingStrokeWidth || 5,
          }];

          if (this.props.onDrawablesChange) {
            this.props.onDrawablesChange(drawables);
          }

          return {
            drawables,
            drawingPoints: null,
          };
        });
      };

      window.addEventListener('mousemove', mouseMoveHandler);
      window.addEventListener('mouseup', mouseUpHandler);
    }
  };

  handleDrawableTranslate = (id: string, x: number, y: number) => {
    this.setState(state => ({
      drawables: state.drawables.map((i) => {
        if (i.id === id) {
          switch (i.type) {
            case 'rect':
              return {
                ...i,
                x: i.x + x,
                y: i.y + y,
              };
            case 'ellipse':
              return {
                ...i,
                cx: i.cx + x,
                cy: i.cy + y,
              };
            case 'path':
              console.error('path can not be translated currently', i); // eslint-disable-line no-console
              return i;
            case 'line':
              return {
                ...i,
                x1: i.x1 + x,
                x2: i.x2 + x,
                y1: i.y1 + y,
                y2: i.y2 + y,
              };
            default:
              console.error('Unknown item type', i); // eslint-disable-line no-console
              return i;
          }
        }

        return i;
      }),
    }));
  }

  handleResizeDrawable = (
    e: MouseEvent,
    id: string,
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
    initialX: number,
    initialY: number,
    newX: number,
    newY: number,
  ) => {
    this.setState(state => ({
      drawables: state.drawables.map((item) => {
        if (item.id === id) {
          if (item.type === 'rect') {
            let {
              x,
              y,
              width,
              height,
            } = item;

            if (handleX === 'left') {
              width = Math.max(rectMinWidth, width - (newX - x));
              x = newX;
            } else if (handleX === 'right') {
              width = Math.max(rectMinWidth, newX - x);
            }

            if (handleY === 'top') {
              height = Math.max(rectMinWidth, height - (newY - y));
              y = newY;
            } else if (handleY === 'bottom') {
              height = Math.max(rectMinWidth, newY - y);
            }

            return {
              ...item,
              x,
              y,
              width,
              height,
            };
          }

          if (item.type === 'ellipse') {
            let {
              cx,
              cy,
              rx,
              ry,
            } = item;

            if (handleX === 'left') {
              const moveRight = newX - (cx - rx);
              const moveRightHalf = moveRight / 2;
              rx = Math.max(ellipseMinWidth, rx - moveRightHalf);
              cx += moveRightHalf;
            } else if (handleX === 'right') {
              const moveRight = newX - (cx + rx);
              const moveRightHalf = moveRight / 2;
              rx = Math.max(ellipseMinWidth, rx + moveRightHalf);
              cx += moveRightHalf;
            }

            if (handleY === 'top') {
              const moveUp = newY - (cy - ry);
              const moveUpHalf = moveUp / 2;
              ry = Math.max(ellipseMinWidth, ry - moveUpHalf);
              cy += moveUpHalf;
            } else if (handleY === 'bottom') {
              const moveUp = newY - (cy + ry);
              const moveUpHalf = moveUp / 2;
              ry = Math.max(ellipseMinWidth, ry + moveUpHalf);
              cy += moveUpHalf;
            }

            /* if (handleY === 'top') {
              ry = ry - ((newY - y) / 2);
              y = newY;
            } else if (handleY === 'bottom') {
              ry = (newY - y) / 2;
            } */

            return {
              ...item,
              cx,
              cy,
              rx,
              ry,
            };
          }

          if (item.type === 'line') {
            let {
              x1,
              x2,
              y1,
              y2,
            } = item;

            if (handleX === 'left') {
              x1 = newX;
            } else if (handleX === 'right') {
              x2 = newX;
            }

            if (handleY === 'top') {
              y1 = newY;
            } else if (handleY === 'bottom') {
              y2 = newY;
            }

            return {
              ...item,
              x1,
              x2,
              y1,
              y2,
            };
          }

          console.warn('Can\'t resize item of type %s', item.type); // eslint-disable-line no-console
          return item;
        }

        return item;
      }),
    }));
  }

  handleDragStart = () => {
    this.setState({ selectedDrawable: null });
  }

  render() {
    const {
      selectedDrawable,
      drawingPoints,
      drawables,
    } = this.state;
    const {
      defaultDrawables,
      onDrawablesChange,
      drawMode,
      drawingStroke,
      drawingStrokeWidth,
      ...otherProps
    } = this.props;
    const { width, height } = this.props;

    return (
      <div>
        <UncontrolledEditor
          {...otherProps}
          allowDrag={drawMode === null}
          onZoom={this.handleZoom}
          onDragStart={this.handleDragStart}
        >
          <Drawables
            width={width}
            height={height}
            drawables={drawables}
            onSelectDrawable={this.handleSelectDrawable}
            canSelectDrawable={drawMode === null}
            selectedDrawable={selectedDrawable}
            onResizeDrawable={this.handleResizeDrawable}
            onDrawableTranslate={this.handleDrawableTranslate}
          />
          {drawMode === 'pen' && (
            <Fragment>
              <rect
                style={{ pointerEvents: 'bounding-box' }}
                key="artboard"
                fill="none"
                ref={this.artboard}
                onMouseDown={this.handleArtboardMouseDown}
                x={0}
                y={0}
                width={width}
                height={height}
              />
              {drawingPoints && (
                <Path
                  key="path"
                  points={drawingPoints}
                  stroke={drawingStroke || 'black'}
                  strokeWidth={drawingStrokeWidth || 5}
                />
              )}
            </Fragment>
          )}
        </UncontrolledEditor>
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
        <pre>{JSON.stringify(this.props, null, 2)}</pre>
      </div>
    );
  }
}
