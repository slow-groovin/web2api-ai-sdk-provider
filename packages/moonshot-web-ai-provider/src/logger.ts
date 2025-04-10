// logger.ts

// 定义日志级别枚举
export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR" | "OFF";
const level2num: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  OFF: 4,
};

export class Logger {
  // 原始 console 方法
  private readonly _realDebug = console.debug.bind(console);
  private readonly _realInfo = console.info.bind(console);
  private readonly _realWarn = console.warn.bind(console);
  private readonly _realError = console.error.bind(console);
  private readonly _noop = () => {};

  // 当前配置和级别
  private _level: LogLevel;

  constructor(level: LogLevel = "INFO") {
    this._level = level;
  }

  // 日志方法
  get debug() {
    return level2num[this._level] > level2num["DEBUG"]
      ? this._noop
      : this._realDebug;
  }

  get info() {
    return level2num[this._level] > level2num["INFO"]
      ? this._noop
      : this._realInfo;
  }
  get warn() {
    return level2num[this._level] > level2num["WARN"]
      ? this._noop
      : this._realWarn;
  }
  get error() {
    return level2num[this._level] > level2num["ERROR"]
      ? this._noop
      : this._realError;
  }
}

// 可选：导出单例实例
export const logger = new Logger();
