// based on https://github.com/microsoft/msagljs/blob/main/modules/renderer-webgl/src/event-source.ts

// MIT License

// Copyright (c) Microsoft Corporation.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE

export interface Event {
  type: string;
  data?: any;
}

type Listener = (evt: Event) => any;

type ListenerRegistry = { [type: string]: Listener[] };

function addEventListener(
  type: string,
  listener: Listener,
  registry: ListenerRegistry
) {
  registry[type] = registry[type] || [];
  if (registry[type].indexOf(listener) < 0) {
    // Does not exist
    registry[type].push(listener);
  }
}

function removeEventListener(
  type: string,
  listener: Listener,
  registry: ListenerRegistry
) {
  if (registry[type]) {
    const index = registry[type].indexOf(listener);
    if (index >= 0) {
      registry[type].splice(index, 1);
    }
  }
}

/**
 * An event source can emit events and register event listeners
 */
export default class EventSource {
  _listeners: ListenerRegistry = {};
  _onceListeners: ListenerRegistry = {};

  /**
   * Adds a listener to a event type.
   */
  on(type: string, listener: Listener) {
    addEventListener(type, listener, this._listeners);
  }

  /**
   * Adds a listener that will be called only once to a event type.
   */
  once(type: string, listener: Listener) {
    addEventListener(type, listener, this._onceListeners);
  }

  /**
   * Removes a previously registered event listener.
   */
  off(type: string, listener: Listener) {
    removeEventListener(type, listener, this._listeners);
    removeEventListener(type, listener, this._onceListeners);
  }

  emit(eventOrType: string | Event, data?: any) {
    let event: Event;
    if (typeof eventOrType === 'string') {
      event = { type: eventOrType };
    } else {
      event = eventOrType;
    }

    const type = event.type;

    if (!this._listens(type)) {
      return;
    }

    if (data) {
      event.data = data;
    }

    // adding or removing listeners inside other listeners may cause an infinite loop
    const listeners = this._listeners[type]?.slice() || [];

    for (const listener of listeners) {
      listener.call(this, event);
    }

    const onceListeners = this._onceListeners[type]?.slice() || [];
    for (const listener of onceListeners) {
      removeEventListener(type, listener, this._onceListeners);
      listener.call(this, event);
    }
  }

  /**
   * Returns true if we have a listener for the event type.
   */
  private _listens(type: string): boolean {
    return (
      (this._listeners[type] && this._listeners[type].length > 0) ||
      (this._onceListeners[type] && this._onceListeners[type].length > 0)
    );
  }
}
