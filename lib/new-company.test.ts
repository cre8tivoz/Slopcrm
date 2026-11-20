import { describe, expect, it } from "vitest";
import { isoDaysAgo } from "./demo-clock";
import { validateNewCompany } from "./new-company";

const input = {
  name: "  Acme  ",
  openDeals: "2",
  pipelineValue: "12345",
  interactionDate: isoDaysAgo(91),
};

describe("validateNewCompany", () => {
  it("accepts a valid past date and a whole-dollar pipeline value", () => {
    expect(validateNewCompany(input)).toEqual({
      ...input,
      name: "Acme",
      openDeals: 2,
      pipelineValue: 12345,
      ok: true,
    });
  });

  it.each(["2026-02-30", isoDaysAgo(-1)])(
    "rejects invalid or future date %s",
    (interactionDate) => {
      expect(validateNewCompany({ ...input, interactionDate })).toMatchObject({
        ok: false,
        errors: { interactionDate: expect.any(String) },
      });
    },
  );

  it.each(["-1", "1.5", "1e40", "Infinity"])(
    "rejects invalid numbers %s rather than rounding or clamping",
    (value) => {
      expect(
        validateNewCompany({
          ...input,
          openDeals: value,
          pipelineValue: value,
        }),
      ).toMatchObject({
        ok: false,
        errors: {
          openDeals: expect.any(String),
          pipelineValue: expect.any(String),
        },
      });
    },
  );
});
