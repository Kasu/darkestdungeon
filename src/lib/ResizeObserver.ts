/// <reference types='resize-observer-polyfill' />

// HACK we need this since @types for the polyfill seems pretty broken
type ResizeObserverHack = ResizeObserver & {
  new (callback: ResizeObserverCallback): ResizeObserver;
};

// Get original, works fine in browsers
export let ResizeObserver: ResizeObserverHack = require('resize-observer-polyfill').default as ResizeObserverHack;

// Modify for nodejs
if (typeof ResizeObserver !== 'function') {
  // HACK we must use this method to make this work in node for jest.
  // Using traditional import makes ResizeObserver become undefined some reason.
  ResizeObserver = require('resize-observer-polyfill') as ResizeObserverHack;
}
