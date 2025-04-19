/*
in provider, you should only throw Errors but not AISDKError which is the provider framework throw output.
*/
export class NoAuthError extends Error {}

export class ResponseStatusError extends Error {}

export class PoWValidateError extends Error {}

export class CriticalValueMissError extends Error {
  constructor(key: string, category?: string) {
    super(`cannot get critical ${category} value: ${key}.`);
  }
}
