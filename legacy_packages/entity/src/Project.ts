import { Base } from './Base.js';
import { Bucket } from './Bucket.js';

// Project is a logical wrapper around a collection of Base
export class Project {
  public bases = new Map<string, Base>();
  public buckets = new Map<string, Bucket>();
  constructor(public name: string) {}
}
