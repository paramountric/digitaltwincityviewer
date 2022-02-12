import {EventManager} from 'mjolnir.js';

// todo: transformations, eventmanager

class Viewport {
  eventManager: EventManager;
  constructor() {
    this.eventManager = new EventManager();
  }
}

export { Viewport };