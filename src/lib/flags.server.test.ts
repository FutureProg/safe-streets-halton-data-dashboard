import { beforeEach, describe, expect, test, vi } from "vite-plus/test";

const mocks = vi.hoisted(() => {
  const client = {
    getBooleanValue: vi.fn(),
    getStringValue: vi.fn(),
    getNumberValue: vi.fn(),
    getObjectValue: vi.fn(),
  };
  return {
    client,
    addHooks: vi.fn(),
    setProviderAndWait: vi.fn(),
    getBinding: vi.fn(),
    providerCtor: vi.fn(),
    // Stand-in for React's request-scoped `cache`: one memoized result until
    // `endRequest()` is called.
    requestCaches: new Map<unknown, unknown>(),
  };
});

vi.mock("server-only", () => ({}));

vi.mock("react", () => ({
  cache: (fn: () => unknown) => () => {
    if (!mocks.requestCaches.has(fn)) mocks.requestCaches.set(fn, fn());
    return mocks.requestCaches.get(fn);
  },
}));

vi.mock("@openfeature/server-sdk", () => ({
  OpenFeature: {
    getClient: () => mocks.client,
    addHooks: mocks.addHooks,
    setProviderAndWait: mocks.setProviderAndWait,
  },
}));

vi.mock("@cloudflare/flagship/server", () => ({
  FlagshipServerProvider: class {
    constructor(options: unknown) {
      mocks.providerCtor(options);
    }
  },
  LoggingHook: class {},
}));

vi.mock("@/lib/flags-binding", () => ({
  getFlagshipBinding: mocks.getBinding,
}));

type FlagsModule = typeof import("./flags.server");

/** Fresh module = fresh per-isolate provider state. */
async function loadFlags(): Promise<FlagsModule> {
  vi.resetModules();
  return import("./flags.server");
}

const endRequest = () => mocks.requestCaches.clear();

beforeEach(() => {
  vi.clearAllMocks();
  endRequest();
  mocks.getBinding.mockReturnValue({ fake: "binding" });
  mocks.setProviderAndWait.mockResolvedValue(undefined);
  mocks.client.getBooleanValue.mockImplementation(async () => true);
  mocks.client.getStringValue.mockImplementation(async () => "variant-a");
  mocks.client.getNumberValue.mockImplementation(async () => 42);
  mocks.client.getObjectValue.mockImplementation(async () => ({ on: true }));
});

describe("getFlag: boolean flags", () => {
  test("returns the evaluated value and passes the fallback through", async () => {
    const { getFlag } = await loadFlags();

    await expect(getFlag("new-map", false)).resolves.toBe(true);
    expect(mocks.client.getBooleanValue).toHaveBeenCalledWith("new-map", false);
    expect(mocks.client.getStringValue).not.toHaveBeenCalled();
    expect(mocks.client.getNumberValue).not.toHaveBeenCalled();
  });
});

describe("getFlag: string flags", () => {
  test("returns the evaluated value and passes the fallback through", async () => {
    const { getFlag } = await loadFlags();

    await expect(getFlag("banner-copy", "default")).resolves.toBe("variant-a");
    expect(mocks.client.getStringValue).toHaveBeenCalledWith(
      "banner-copy",
      "default",
    );
    expect(mocks.client.getBooleanValue).not.toHaveBeenCalled();
  });
});

describe("getFlag: number flags", () => {
  test("returns the evaluated value and passes the fallback through", async () => {
    const { getFlag } = await loadFlags();

    await expect(getFlag("cluster-cap", 100)).resolves.toBe(42);
    expect(mocks.client.getNumberValue).toHaveBeenCalledWith(
      "cluster-cap",
      100,
    );
    expect(mocks.client.getBooleanValue).not.toHaveBeenCalled();
  });

  test("treats a zero fallback as a number, not a missing value", async () => {
    const { getFlag } = await loadFlags();

    await getFlag("cluster-cap", 0);
    expect(mocks.client.getNumberValue).toHaveBeenCalledWith("cluster-cap", 0);
  });
});

describe("getObjectFlag: JSON flags", () => {
  test("returns the evaluated value and passes the fallback through", async () => {
    const { getObjectFlag } = await loadFlags();
    const fallback = { on: false };

    await expect(getObjectFlag("layout", fallback)).resolves.toEqual({
      on: true,
    });
    expect(mocks.client.getObjectValue).toHaveBeenCalledWith(
      "layout",
      fallback,
    );
  });
});

describe("per-request memo (cache)", () => {
  test("evaluates a flag once per request and shares the result", async () => {
    const { getFlag } = await loadFlags();

    const [a, b] = await Promise.all([
      getFlag("new-map", false),
      getFlag("new-map", false),
    ]);
    await getFlag("new-map", false);

    expect(a).toBe(b);
    expect(mocks.client.getBooleanValue).toHaveBeenCalledTimes(1);
  });

  test("re-evaluates in the next request", async () => {
    const { getFlag } = await loadFlags();

    await getFlag("new-map", false);
    endRequest();
    await getFlag("new-map", false);

    expect(mocks.client.getBooleanValue).toHaveBeenCalledTimes(2);
  });

  test("keeps the first caller's fallback when callers disagree", async () => {
    const { getFlag } = await loadFlags();

    await getFlag("new-map", false);
    await getFlag("new-map", true);

    expect(mocks.client.getBooleanValue).toHaveBeenCalledTimes(1);
    expect(mocks.client.getBooleanValue).toHaveBeenCalledWith("new-map", false);
  });

  test("dedupes object flags even when fallbacks are different objects", async () => {
    const { getObjectFlag } = await loadFlags();

    const first = await getObjectFlag("layout", { on: false });
    const second = await getObjectFlag("layout", { on: false });

    expect(second).toBe(first);
    expect(mocks.client.getObjectValue).toHaveBeenCalledTimes(1);
  });

  test("keeps different keys separate", async () => {
    const { getFlag } = await loadFlags();

    await getFlag("a", false);
    await getFlag("b", false);

    expect(mocks.client.getBooleanValue).toHaveBeenCalledTimes(2);
  });

  test("keeps different flag types with the same key separate", async () => {
    const { getFlag, getObjectFlag } = await loadFlags();

    await getFlag("shared", false);
    await getFlag("shared", "x");
    await getFlag("shared", 1);
    await getObjectFlag("shared", {});

    expect(mocks.client.getBooleanValue).toHaveBeenCalledTimes(1);
    expect(mocks.client.getStringValue).toHaveBeenCalledTimes(1);
    expect(mocks.client.getNumberValue).toHaveBeenCalledTimes(1);
    expect(mocks.client.getObjectValue).toHaveBeenCalledTimes(1);
  });
});
