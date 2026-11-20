import { DEMO_TODAY, isIsoDate } from "./demo-clock";

type Input = {
  name: string;
  pipelineValue: string;
  openDeals: string;
  interactionDate: string;
};

function wholeNumber(value: string): number | null {
  if (value.trim() === "") return 0;
  const n = Number(value);
  return Number.isSafeInteger(n) && n >= 0 ? n : null;
}

export function validateNewCompany(input: Input) {
  const name = input.name.trim();
  const pipelineValue = wholeNumber(input.pipelineValue);
  const openDeals = wholeNumber(input.openDeals);
  const interactionDate = input.interactionDate || DEMO_TODAY;
  const errors: Partial<Record<keyof Input, string>> = {};
  if (!name) errors.name = "Enter a company name.";
  if (pipelineValue === null)
    errors.pipelineValue = "Enter a non-negative whole dollar amount.";
  if (openDeals === null)
    errors.openDeals = "Enter a non-negative whole number of deals.";
  if (!isIsoDate(interactionDate) || interactionDate > DEMO_TODAY) {
    errors.interactionDate = `Enter a valid date on or before ${DEMO_TODAY}.`;
  }
  if (
    Object.keys(errors).length ||
    pipelineValue === null ||
    openDeals === null
  ) {
    return { ok: false, errors } as const;
  }
  return { ok: true, name, pipelineValue, openDeals, interactionDate } as const;
}
