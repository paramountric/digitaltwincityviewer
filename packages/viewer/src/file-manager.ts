import { Viewer } from './viewer';

export class FileManager {
  viewer: Viewer;
  fileTypes: any = {
    json: {
      name: 'JSON',
      extensions: ['json'],
      readFn: 'readAsText',
      parseFn: 'parseJSON',
    },
    xlsx: {
      name: 'Excel',
      extensions: ['xlsx'],
      readFn: 'readAsArrayBuffer',
      parseFn: 'parseXLSX',
    },
  };
  constructor({ viewer }: any) {
    this.viewer = viewer;
  }

  importFile(file: File) {
    const fileName = file.name;
    if (!fileName) {
      return;
    }
    const fileType = fileName.split('.').pop();
    if (!fileType) {
      return;
    }
    const fileTypeLowerCase = fileType.toLowerCase();
    const reader = new FileReader();

    reader.onload = () => {
      const fileContent = reader.result;
      if (!fileContent) {
        return;
      }
      const fileTypeInfo = this.fileTypes[fileTypeLowerCase];
      if (!fileTypeInfo) {
        return;
      }
      try {
        // @ts-ignore
        const data = this[parseFn](fileContent);
      } catch (e) {
        console.error(e);
      }
    };

    const fileTypeInfo = this.fileTypes[fileTypeLowerCase];
    if (!fileTypeInfo) {
      return;
    }
    const fn = fileTypeInfo.fn;
    if (!fn) {
      return;
    }
    fn(file);
  }
}
