// @flow

import { PureComponent, type Node } from 'react';
import determineFileType from './util/determine-file-type';

type Source = string | Blob | File | URL;

export type RenderProps = {
  state: 'LOADING',
} | {
  state: 'ERROR',
} | {
  state: 'LOADED',
  url: string,
  width: number,
  height: number,
};

export type RenderPropFunc = (source: RenderProps) => Node

type Props = {|
  source: Source,
  hqPdf?: boolean,
  children: RenderPropFunc,
  fetch?: typeof window.fetch,
|};

type State = {
  source: RenderProps,
};

export default class GenericSource extends PureComponent<Props, State> {
  state = {
    source: { state: 'LOADING' },
  };

  constructor(props: Props) {
    super(props);
    this.updateSource(props.source, props.source);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.source !== this.props.source) {
      this.updateSource(this.props.source, this.props.source);
    }
  }

  // TODO: these async methods should check that the blob did not change over time...
  updateSource = async (source: Source, initialSource: Source) => {
    if (source instanceof URL) {
      this.updateSource(source.toString(), initialSource);
    } else if (typeof source === 'string') {
      let response;
      try {
        response = await (this.props.fetch || window.fetch)(source);
      } catch (e) {
        // stop if source changed in meantime
        if (this.props.source !== initialSource) {
          return;
        }

        this.setState({ source: { state: 'ERROR', error: { code: 'FETCH_FAILED', details: e } } });
        return;
      }

      // stop if source changed in meantime
      if (this.props.source !== initialSource) {
        return;
      }

      let blob;
      try {
        blob = await response.blob();
      } catch (e) {
        // stop if source changed in meantime
        if (this.props.source !== initialSource) {
          return;
        }

        this.setState({ source: { state: 'ERROR', error: { code: 'RESPONSE_EXTRACTION_FAILED', details: e } } });
        return;
      }

      // stop if source changed in meantime
      if (this.props.source !== initialSource) {
        return;
      }

      await this.updateSource(blob, initialSource);
    } else if (source instanceof Blob || source instanceof File) {
      let fileType;
      try {
        fileType = await determineFileType(source);
      } catch (e) {
        // stop if source changed in meantime
        if (this.props.source !== initialSource) {
          return;
        }

        this.setState({ source: { state: 'ERROR', error: { code: 'DETERMINE_FILE_TYPE_FAILED', details: e } } });
        return;
      }

      // stop if source changed in meantime
      if (this.props.source !== initialSource) {
        return;
      }

      if (!fileType) {
        this.setState({ source: { state: 'ERROR', error: { code: 'UNKNOWN_FILE_TYPE' } } });
        return;
      }

      if (fileType.type === 'pdf') {
        let url: string;
        let width: number;
        let height: number;
        try {
          const result = await this.pdfToPng(source, 1);
          url = result.png;
          width = result.width; // eslint-disable-line prefer-destructuring
          height = result.height; // eslint-disable-line prefer-destructuring
        } catch (e) {
          // stop if source changed in meantime
          if (this.props.source !== initialSource) {
            return;
          }

          this.setState({ source: { state: 'ERROR', error: { code: 'PDF_TO_PNG_FAILED', details: e } } });
          return;
        }

        // stop if source changed in meantime
        if (this.props.source !== initialSource) {
          return;
        }

        this.setState({
          source: {
            state: 'LOADED',
            url,
            width,
            height,
          },
        });

        // now re-render the PDF in higher quality and update the context afterwards
        if (this.props.hqPdf) {
          try {
            const result = await this.pdfToPng(source, 5);
            url = result.png;
            width = result.width; // eslint-disable-line prefer-destructuring
            height = result.height; // eslint-disable-line prefer-destructuring
          } catch (e) {
            console.error('Failed to render PDF in higher quality', e); // eslint-disable-line no-console
            return;
          }

          // stop if source changed in meantime
          if (this.props.source !== initialSource) {
            return;
          }

          this.setState({
            source: {
              state: 'LOADED',
              url,
              width,
              height,
            },
          });
        }
      } else {
        const url = (URL || window.webkitURL).createObjectURL(source);
        const img = document.createElement('img');
        const prom = new Promise((res, rej) => {
          img.onload = () => {
            res(img);
          };
          img.onerror = rej;
        });
        img.src = url;
        const { width, height } = await prom;

        // stop if source changed in meantime
        if (this.props.source !== initialSource) {
          return;
        }

        this.setState({
          source: {
            state: 'LOADED',
            url,
            width,
            height,
          },
        });
      }
    } else {
      this.setState({ source: { state: 'ERROR', error: { code: 'UNKNOWN_SOURCE_TYPE', details: source } } });
    }
  }

  pdfToPng = async (blob: Blob, zoom: number) => {
    const pdfjs = (await import('pdfjs-dist')).default;
    pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

    const doc = await pdfjs.getDocument(URL.createObjectURL(blob));

    // TODO: validate that there is only one page...

    const page = await doc.getPage(1);

    const viewport = page.getViewport(zoom, 0);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport,
    };

    await page.render(renderContext);

    let png;
    if (canvas.toBlob) {
      const b = await new Promise(res => canvas.toBlob(res));
      png = (URL || window.webkitURL).createObjectURL(b);
    } else {
      png = canvas.toDataURL();
    }

    return {
      png,
      height: viewport.height / zoom,
      width: viewport.width / zoom,
    };
  }

  render() {
    const { children } = this.props;
    const { source } = this.state;

    return children(source);
  }
}
