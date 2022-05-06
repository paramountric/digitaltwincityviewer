import { makeObservable, observable, action } from 'mobx';

// just testing app state here temporarily with a simple counter
export class Store {
  public count = 0;
  public exampleFiles = [
    {
      url: 'https://digitaltwincityviewer.s3.eu-north-1.amazonaws.com/Helsingborg2021.json',
      text: 'Helsingborg',
    },
  ];

  public loadExampleFile(fileIndex: number) {
    console.log(fileIndex);
  }

  public constructor() {
    makeObservable(this, {
      increment: action,
      count: observable,
    });
  }

  public increment() {
    this.count++;
  }
}
