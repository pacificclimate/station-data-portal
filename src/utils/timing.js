// Module for timing execution of functions.
//
// Typical usage:
//
//    timer = getTimer("<timer name>");
//
// Use function `timeThis` like a decorator, as follows:
//
//    const f = timer.timeThis("<key>")(
//      function f(...) { ... };
//    );
//
// Execution times of invocations of function `f` are accumulated under the
// key "<key>". Accumulation of execution times is reset when `reset("<key>")`
// or, more commonly, `resetAll()`, is called, normally from a caller of `f`.
//
// Typically timing results are logged immediately after reset:
//
//    timer.resetAll();
//    timer.log();
//
// This is typically done immediately before `reset` is called.

import flow from 'lodash/fp/flow';
import map from 'lodash/fp/map';
import sum from 'lodash/fp/sum';
import sortBy from 'lodash/fp/sortBy';
import isNil from 'lodash/fp/isNil';

export class Timer {
  constructor(name) {
    this.name = name;
    this.timings = {};
  }

  reset(key) {
    if (isNil(key)) {
      this.timings = {};
      return;
    }
    this.timings[key] = {};
  }

  resetAll() {
    this.reset();
  }

  start(key, log = false) {
    if (log) {
      console.log(`${key} timing start`)
    }
    this.timings[key] = this.timings[key] || {};
    this.timings[key].start = Date.now();
    this.timings[key].duration = this.timings[key].duration ?? 0;
  }

  stop(key, log = false) {
    const more = Date.now() - this.timings[key].start;
    if (log) {
      console.log(`${key} timing stop: ${more}`)
    }
    this.timings[key].duration += more;
    this.timings[key].start = null;
  }

  timeThis = (key, options = {}) => f => {
    const { disable = false, log = false } = options;
    if (disable) {
      return f;
    }
    return (...args) => {
      this.start(key, log);
      const r = f(...args);
      this.stop(key, log);
      return r;
    }
  }

  log() {
    console.group(this.name);
    const totalDuration = flow(map('duration'), sum)(this.timings);
    console.log(`Total duration: ${totalDuration / 1000} s`)
    for(const [key, value] of sortBy('[0]', Object.entries(this.timings))) {
      console.log(`${key}: ${value.duration / 1000} s (${Math.round(100 * value.duration / totalDuration)}%) [${value.start ? "running" : "stopped"}]`);
    }
    console.groupEnd();
  }

}


const registry = {};

export const getTimer = name => {
  if (!registry[name]) {
    registry[name] = new Timer(name);
  }
  return registry[name];
};