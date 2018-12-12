// @flow

export default function readBytes(blob: Blob, num: number): Promise<ArrayBuffer> {
  return new Promise((res, rej) => {
    const fr = new FileReader();

    fr.onloadend = (event) => {
      if (fr.error) {
        rej(fr.error);
        return;
      }

      res(event.target.result);
    };

    fr.readAsArrayBuffer(blob.slice(0, num));
  });
}
