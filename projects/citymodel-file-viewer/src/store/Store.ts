import { makeObservable, observable, action } from 'mobx';

// just testing app state here temporarily with a simple counter
export class Store {
  public count = 0;

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
