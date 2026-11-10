import "server-only";

import { cache } from "react";
import { OpenFeature, type JsonValue } from "@openfeature/server-sdk";
import {
  FlagshipServerProvider,
  LoggingHook,
} from "@cloudflare/flagship/server";

import { getFlagshipBinding } from "@/lib/flags-binding";

/**
 * Feature flags. Every read goes through `getFlag` / `getObjectFlag`, which:
 *  - registers the Flagship provider once per isolate (flags are global, so
 *    the OpenFeature singleton is safe to share between requests),
 *  - memoizes per request (React `cache`), so a layout and a page asking for
 *    the same flag share one evaluation and the value cannot change mid-render,
 *  - never throws: with no binding, or on any error, you get the fallback.
 *
 */

let ready: Promise<void> | undefined;

function ensureProvider(): Promise<void> {
  ready ??= (async () => {
    const binding = getFlagshipBinding();
    // No binding: OpenFeature's built-in no-op provider returns fallbacks.
    if (!binding) return;
    OpenFeature.addHooks(new LoggingHook());
    await OpenFeature.setProviderAndWait(
      // cacheTtl is a cross-request cache: a flag change can take up to 30s
      // to show up. The per-request memo below is separate.
      new FlagshipServerProvider({ binding, cacheTtl: 30_000 }),
    );
  })().catch((error) => {
    console.error("Flagship provider failed to initialize", error);
    ready = undefined; // let the next request retry
  });
  return ready;
}

// One Map per request. Keyed by `kind:key` rather than by argument identity
// (what `cache` alone would do) so object fallbacks still dedupe. The first
// caller's fallback wins if two callers disagree.
const requestMemo = cache(() => new Map<string, Promise<unknown>>());

function memoized<T>(kind: string, key: string, evaluate: () => Promise<T>) {
  const memo = requestMemo();
  const id = `${kind}:${key}`;
  let result = memo.get(id) as Promise<T> | undefined;
  if (!result) {
    result = ensureProvider().then(evaluate);
    memo.set(id, result);
  }
  return result;
}

/**
 * Evaluate a boolean, string or number flag once per request. The type of
 * `fallback` picks the evaluation type.
 */
export function getFlag(key: string, fallback: boolean): Promise<boolean>;
export function getFlag(key: string, fallback: string): Promise<string>;
export function getFlag(key: string, fallback: number): Promise<number>;
export function getFlag(key: string, fallback: boolean | string | number) {
  const client = () => OpenFeature.getClient();
  switch (typeof fallback) {
    case "boolean":
      return memoized("boolean", key, () =>
        client().getBooleanValue(key, fallback),
      );
    case "string":
      return memoized("string", key, () =>
        client().getStringValue(key, fallback),
      );
    default:
      return memoized("number", key, () =>
        client().getNumberValue(key, fallback),
      );
  }
}

/**
 * Evaluate a JSON flag once per request. `T` is a promise, not a check:
 * Flagship does not validate the shape, so keep `fallback` safe to use if the
 * stored value is wrong (or validate it yourself).
 */
export function getObjectFlag<T extends JsonValue>(key: string, fallback: T) {
  return memoized("object", key, () =>
    OpenFeature.getClient().getObjectValue<T>(key, fallback),
  );
}
