// @flow
import readBytes from './read-bytes';

export type FileType = {
  type: 'pdf',
  mimeType: 'application/pdf',
} | {
  type: 'image',
  mimeType: 'image/jpeg',
} | {
  type: 'image',
  mimeType: 'image/png',
};

const fileTypes: { [key: string]: FileType } = {
  '89504E47': { type: 'image', mimeType: 'image/png' }, // eslint-disable-line quote-props
  FFD8FFDB: { type: 'image', mimeType: 'image/jpeg' },
  FFD8FFE0: { type: 'image', mimeType: 'image/jpeg' },
  FFD8FFE1: { type: 'image', mimeType: 'image/jpeg' },
  '25504446': { type: 'pdf', mimeType: 'application/pdf' }, // eslint-disable-line quote-props
};

export default async function determineFileType(blob: Blob): Promise<FileType | typeof undefined> {
  const uint = new Uint8Array(await readBytes(blob, 4));

  const bytes = [];

  // Array.from is needed for IE compatibility
  Array.from(uint).forEach((byte) => {
    bytes.push(byte.toString(16));
  });

  const hex = bytes.join('').toUpperCase();

  return fileTypes[hex];
}
