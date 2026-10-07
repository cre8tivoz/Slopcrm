import { describe, expect, it } from "vitest";
import { toCsv } from "./csv";

describe("toCsv", () => {
  it("joins rows with CRLF and cells with commas", () => {
    expect(
      toCsv([
        ["a", 1],
        ["b", 2],
      ]),
    ).toBe("a,1\r\nb,2");
  });

  it("quotes cells containing commas, quotes or newlines", () => {
    expect(toCsv([['Smith, "Jo"', "line\nbreak"]])).toBe(
      '"Smith, ""Jo""","line\nbreak"',
    );
  });

  it("neutralises spreadsheet formula injection", () => {
    for (const payload of ["=SUM(A1)", "+1", "-1", "@cmd", "\tx"]) {
      expect(toCsv([[payload]]).startsWith("'")).toBe(true);
    }
  });

  it("leaves numbers as plain values", () => {
    expect(toCsv([[1250000, 0]])).toBe("1250000,0");
  });
});
