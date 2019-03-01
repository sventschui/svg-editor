// @flow
import React, { Fragment, type Node } from 'react';
import ArtboardPen from './pen';
import ArtboardRect from './rect';
import ArtboardEllipse from './ellipse';
import ArtboardLine from './line';
import ArtboardCrop from './crop';

type Crop = {
  x: number,
  y: number,
  height: number,
  width: number,
}

type Props = {
  drawMode: null | 'pen' | 'rect' | 'ellipse' | 'line' | 'crop',
  crop: ?Crop,
  height: number,
  width: number,
  children: Node,
  onCropEnd: Function,
  onDrawEnd: Function,
  x?: number,
  y?: number,
};

const ArtboardComponent = ({
  drawMode,
  crop,
  height,
  width,
  ...rest
}: Props) => {
  let vHeight = height;
  let vWidth = width;
  let vX = 0;
  let vY = 0;
  let clipPath;

  if (crop) {
    clipPath = 'url(#svg-editor-cut)';
    const {
      height: cropHeight,
      width: cropWidth,
      x,
      y,
    } = crop;

    vHeight = cropHeight;
    vWidth = cropWidth;
    vX = x;
    vY = y;
  }

  const props = {
    ...rest,
    clipPath,
    width: vWidth,
    height: vHeight,
    x: vX,
    y: vY,
  };

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
    case 'crop':
      //  render cropping artboard only if not yet cropped
      if (!crop) {
        Artboard = ArtboardCrop;
      }
      break;
    default:
      if (drawMode) {
        console.warn('Unknown drawMode', drawMode); // eslint-disable-line
      }
  }

  if (!Artboard) {
    return <Fragment>{props.children}</Fragment>;
  }

  return (
    <Artboard
      {...props}
    />
  );
};

export default ArtboardComponent;
