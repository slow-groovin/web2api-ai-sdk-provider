import { isFunction } from "radash";
import { Maybe, ValueOrGetter, ValueSetter } from "./types.js";

export async function resolveValue<T>(
  value: ValueOrGetter<T>
): Promise<Maybe<T>> {
  if (isFunction(value)) {
    return value();
  }
  return value;
}

export async function setValue<T>(value: T, setter: ValueSetter<T>) {
  const rt = setter(value);

  if (rt instanceof Promise) {
    return await rt;
  }
  return;
}

export function mergeDefault<T>(settings: Maybe<T>, defaultSettings: T): T {
  return { ...defaultSettings, ...(settings ?? {}) };
}
