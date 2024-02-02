// Simple logging utility.
// Exports a singleton. See "Module instance" in https://medium.com/@dmnsgn/singleton-pattern-in-es6-d2d021d150ae.
// Optionally logs context info, controlled by _options.

class Logger {
  constructor() {
    this._options = {
      active: true,
      // Log?
      componentName: true,
      // Include component name in context.
      callerName: true,
      // Include caller name in context.
    };
  }

  configure(options) {
    return Object.assign(this._options, options);
  }

  isActive() {
    return this._options.active;
  }
}

const nameFromStackLine = /^\s*at (?:\w+\.)?(\w+) .*$/;

// Add the fancy logging methods to Logger.prototype
["error", "info", "log", "warn"].forEach((level) => {
  function method(instance, ...args) {
    if (this._options.active) {
      let context = [];
      if (this._options.componentName) {
        context.push(
          instance && instance.constructor
            ? instance.constructor.displayName || instance.constructor.name
            : "<no constructor>",
        );
      }
      if (this._options.callerName) {
        // This cleverness courtesy of https://stackoverflow.com/a/38435618/1858846
        const stackLines = new Error().stack.split("\n");
        const match = stackLines[2].match(nameFromStackLine);
        const methodName = match && match[1];
        context.push(methodName);
      }
      console[level](`[${context.join(".")}]`, ...args);
    }
  }

  Logger.prototype[level] = method;
});

// Proxy other console methods through Logger
[
  "assert",
  "count",
  "group",
  "groupCollapsed",
  "groupEnd",
  "table",
  "time",
  "timeEnd",
  "trace",
].forEach((name) => {
  function method(...args) {
    if (this._options.active) {
      console[name](...args);
    }
  }
  Logger.prototype[name] = method;
});

const logger = new Logger();
logger.configure({
  active: !import.meta.env.CI || import.meta.env.CI === "log",
});

export default logger;
