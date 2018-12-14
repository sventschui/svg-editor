// @flow
import React, { PureComponent } from 'react';
import UncontrolledEditor, { type Props as UncontrolledEditorProps } from './uncontrolled';
import Drawables, { type Drawable } from './drawables';
import translateDrawable from './drawables/translate';
import resizeDrawable from './drawables/resize';
import ArtboardPen from './artboard/pen';
import ArtboardRect from './artboard/rect';
import ArtboardEllipse from './artboard/ellipse';
import ArtboardLine from './artboard/line';
// import convertToLocalCoordinates from '../util/to-local-coordinates';

type Props = UncontrolledEditorProps & {
  initialZoom?: number,
  drawables?: Array<Drawable>,
  onDrawablesChange?: (drawables: Array<Drawable>) => void,
  defaultDrawables?: Array<Drawable>,
  drawMode: 'pen' | 'rect' | 'ellipse' | 'line' | null,
};

type State = {|
  zoom: number,
  drawables: Array<Drawable>,
  selectedDrawable?: ?string,
|};

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

  handleDrawableTranslate = (id: string, x: number, y: number) => {
    this.setState(state => ({
      drawables: state.drawables.map((i) => {
        if (i.id === id) {
          return translateDrawable(i, x, y);
        }

        return i;
      }),
    }));
  }

  handleDrawEnd = (drawable: Drawable) => {
    this.setState((state) => {
      const drawables = [...state.drawables, drawable];

      if (this.props.onDrawablesChange) {
        this.props.onDrawablesChange(drawables);
      }

      return {
        drawables,
      };
    });
  }

  handleResizeDrawable = (
    e: MouseEvent,
    id: string,
    handleX: 'left' | 'right',
    handleY: 'top' | 'bottom',
    newX: number,
    newY: number,
  ) => {
    this.setState(state => ({
      drawables: state.drawables.map((item) => {
        if (item.id === id) {
          return resizeDrawable(item, handleX, handleY, newX, newY);
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
      drawables,
    } = this.state;
    const {
      defaultDrawables,
      onDrawablesChange,
      drawMode,
      ...otherProps
    } = this.props;
    const { width, height } = this.props;

    let Artboard;
    switch (drawMode) {
      case 'pen':
        Artboard = ArtboardPen;
        break;
      case 'rect':
        Artboard = ArtboardRect;
        break;
      case 'ellipse':
        Artboard = ArtboardEllipse;
        break;
      case 'line':
        Artboard = ArtboardLine;
        break;
      default:
        Artboard = null;
    }

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
          {Artboard && (
            <Artboard
              width={width}
              height={height}
              onDrawEnd={this.handleDrawEnd}
            />
          )}
        </UncontrolledEditor>
        <pre>{JSON.stringify(this.state, null, 2)}</pre>
        <pre>{JSON.stringify(this.props, null, 2)}</pre>
      </div>
    );
  }
}
