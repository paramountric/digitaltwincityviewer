// a base is a connection to a source to help users reason about a thing in the real world
export class Base {
  // several streams are needed per base (for example disciplines in BIM, lists, separation of concern)
  // ? first try with one object per base, then see if a base needs several objects, then see if base needs several streams
  // streamIds: string[];
  constructor(public name: string, public objectId: string) {}
}
