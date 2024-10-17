import { Viewer } from './viewer';

export class FileManager {
  viewer: Viewer;
  fileTypes: any;
  constructor({ viewer }: any) {
    this.viewer = viewer;
    this.fileTypes = {
      json: {
        name: 'JSON',
        extensions: ['json'],
        readFn: 'readAsText',
        parseFn: 'parseJSON',
      },
      geojson: {
        name: 'GeoJSON',
        extensions: ['geojson'],
        readFn: 'readAsText',
        parseFn: 'parseGeoJson',
      },
      xlsx: {
        name: 'Excel',
        extensions: ['xlsx'],
        readFn: 'readAsArrayBuffer',
        parseFn: 'parseXlsx',
      },
    };
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
        const parseFn = fileTypeInfo.parseFn;
        // @ts-ignore
        const features = this[parseFn](fileContent);
        // will add missing _id and _type, etc
        this.viewer.featureManager.addFeatures(features);
        // add new feature states
        const featureStates = features.map((feature: any) => {
          const featureState =
            this.viewer.featureManager.getDefaultFeatureState(feature);
          return featureState;
        });
        // create new view
        const featureExtent = this.viewer.featureManager.getExtent() as [
          number,
          number,
          number,
          number
        ];
        const { latitude, longitude, zoom } =
          this.viewer.viewManager.getZoomToExtentParams(featureExtent);
        this.viewer.viewManager.addView({
          id: fileName,
          sectionViewState: {
            id: 'main',
            latitude,
            longitude,
            zoom,
            featureStates,
          },
        });
        this.viewer.viewManager.setView(fileName);
        // switch viewstate and animate between
        this.viewer.update();
      } catch (e) {
        console.error(e);
      }
    };

    const fileTypeInfo = this.fileTypes[fileTypeLowerCase];
    if (!fileTypeInfo) {
      return;
    }
    const fn = fileTypeInfo.readFn;
    if (!fn) {
      return;
    }
    // @ts-ignore
    reader[fn](file);
  }

  parseJSON(fileContent: string) {
    const parsed = JSON.parse(fileContent);
    return parsed.features;
  }

  parseXlsx(fileContent: ArrayBuffer) {
    console.log('parseXlsx', fileContent);
  }

  parseGeoJson(fileContent: string) {
    const parsed = JSON.parse(fileContent);
    return parsed.features;
  }
}
