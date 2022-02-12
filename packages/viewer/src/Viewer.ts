import { EventManager } from 'mjolnir.js';

// todo: transformations, eventmanager

export class Viewer {
  eventManager: EventManager;
  constructor() {
    this.eventManager = new EventManager();
  }
}
