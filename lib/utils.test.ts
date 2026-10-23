import { describe, expect, it, vi } from "vitest";
import { cn, shuffle, slugify } from "./utils";

describe("cn", () => {
  it("combines class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("slugify", () => {
  it("converts strings to URL-friendly slugs", () => {
    expect(slugify("Hello World!")).toBe("hello-world");
    expect(slugify("  Foo   Bar  ")).toBe("foo-bar");
  });
});

describe("shuffle", () => {
  it("handles empty array", () => {
    expect(shuffle([])).toEqual([]);
  });

  it("handles single-item array", () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it("does not mutate original array", () => {
    const original = [1, 2, 3, 4, 5];
    const originalCopy = [...original];
    shuffle(original);
    expect(original).toEqual(originalCopy);
  });

  it("contains all original elements after shuffle", () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffled = shuffle(items);

    expect(shuffled).toHaveLength(items.length);
    expect(shuffled.sort((a, b) => a - b)).toEqual(items);
  });

  it("uses crypto.getRandomValues for cryptographically secure randomness", () => {
    const getRandomValuesSpy = vi.spyOn(crypto, "getRandomValues");
    const items = [1, 2, 3, 4, 5];

    shuffle(items);

    expect(getRandomValuesSpy).toHaveBeenCalled();
    getRandomValuesSpy.mockRestore();
  });
});
