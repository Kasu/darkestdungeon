import * as React from 'react';
import {Bounds} from '../Bounds';
import {AppState} from '../state/AppState';

export class BoundsObserver {
  private domNode: Element;
  private pollIntervalId: any;
  private lastBounds: ClientRect;
  private publishBounds: (bounds: Bounds) => void;

  get isObserving () {
    return !!this.domNode;
  }

  constructor (
    private appState: AppState
  ) {}

  observe (domNode: Element, boundsCollector: (bounds: Bounds) => void) {
    if (this.domNode) {
      throw new Error('Already observing a node');
    }

    this.domNode = domNode;
    this.publishBounds = boundsCollector;
    this.pollIntervalId = setInterval(() => this.pollBounds(), 16);
    this.pollBounds();
  }

  stopObserving () {
    delete this.domNode;
    delete this.lastBounds;
    clearInterval(this.pollIntervalId);
  }

  pollBounds () {
    const n = this.domNode;
    const absRect = n.getBoundingClientRect();

    if (JSON.stringify(this.lastBounds) === JSON.stringify(absRect)) {
      return;
    }

    this.lastBounds = absRect;

    // Get bounds ignoring transforms
    // HACK only ignores the app transform, any other transforms will mess this up
    const {x, y} = this.appState.bounds.transformClientPoint(
      absRect.left, absRect.top
    );

    const newBounds = new Bounds(
      x, y,
      absRect.width / this.appState.bounds.scale,
      absRect.height / this.appState.bounds.scale
    );

    this.publishBounds(newBounds);
  }
}
