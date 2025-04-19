export type LogLevel = "verbose" | "debug" | "info" | "warn" | "error" | "off";
const level2num: Record<LogLevel, number> = {
  verbose: -1,
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  off: 4,
};
type ILogger = {
  [key in Exclude<LogLevel, "off">]: typeof console.log;
};
export class Logger implements ILogger {
  private readonly _realDebug = console.debug.bind(console);
  private readonly _realInfo = console.info.bind(console);
  private readonly _realWarn = console.warn.bind(console);
  private readonly _realError = console.error.bind(console);
  private readonly _noop = () => {};
  _level: LogLevel;

  constructor(level: LogLevel = "info") {
    this._level = level;
  }
  get verbose() {
    return level2num[this._level] > level2num["verbose"]
      ? this._noop
      : this._realDebug;
  }

  get debug() {
    return level2num[this._level] > level2num["debug"]
      ? this._noop
      : this._realDebug;
  }

  get info() {
    return level2num[this._level] > level2num["info"]
      ? this._noop
      : this._realInfo;
  }
  get warn() {
    return level2num[this._level] > level2num["warn"]
      ? this._noop
      : this._realWarn;
  }
  get error() {
    return level2num[this._level] > level2num["error"]
      ? this._noop
      : this._realError;
  }
}

export const logger = new Logger();
