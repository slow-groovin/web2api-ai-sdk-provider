import { resolveValue, setValue, mergeDefault } from "./utils.js";
import { describe, expect, it } from "vitest";

describe("utils", () => {
  describe("resolveValue", () => {
    it("should return the value if it is not a function", async () => {
      const value = 123;
      const result = await resolveValue(value);
      expect(result).toBe(value);
    });

    it("should return the result of the function if it is a function", async () => {
      const value = () => 123;
      const result = await resolveValue(value);
      expect(result).toBe(123);
    });

    it("should return the result of the function if it is a async function", async () => {
      const value = () =>
        new Promise((resolve) => {
          resolve(123);
        });
      const result = await resolveValue(value);
      expect(result).toBe(123);
    });
  });

  describe("setValue", () => {
    it("should call the setter with the value", async () => {
      const value = 123;
      const setter = (v: number) => {
        expect(v).toBe(value);
      };
      await setValue(value, setter);
    });

    it("should await the result of the setter if it is a promise", async () => {
      const value = 123;
      let toSet = 0;
      const setter = (v: number) => {
        return new Promise<void>((resolve) => {
          expect(v).toBe(123);
          toSet = v;
          resolve();
        });
      };
      await setValue(value, setter);
      expect(toSet).toBe(123);
    });
  });

  describe("mergeDefault", () => {
    it("should merge the settings with the default settings", () => {
      const settings = { a: 1, b: 2 };
      const defaultSettings = { a: 0, b: 0, c: 3 };
      const result = mergeDefault(settings, defaultSettings);
      expect(result).toEqual({ a: 1, b: 2, c: 3 });
    });

    it("should return the default settings if settings is null or undefined", () => {
      const settings = null;
      const defaultSettings = { a: 0, b: 0, c: 3 };
      const result = mergeDefault(settings, defaultSettings);
      expect(result).toEqual(defaultSettings);
    });
  });
});
