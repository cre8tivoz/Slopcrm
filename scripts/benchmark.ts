import { performance } from "node:perf_hooks";
import { COMPANIES, Company, Tag } from "../data/companies";
import { primaryStage } from "../lib/pipeline";

// Create synthetic dataset with multiple tags per company to stress test lookups
const generateCompanies = (count: number): Company[] => {
  const companies: Company[] = [];
  const sampleTags: Tag[] = [
    "Enterprise",
    "Mid-Market",
    "SMB",
    "Strategic",
    "New Logo",
    "Upsell",
    "Expansion",
    "Renewal",
    "Pilot",
    "Co-Sell",
    "Land & Expand",
  ];

  for (let i = 0; i < count; i++) {
    const companyCompanies = COMPANIES[i % COMPANIES.length];
    companies.push({
      ...companyCompanies,
      id: `company-${i}`,
      tags: [
        sampleTags[i % sampleTags.length],
        sampleTags[(i + 3) % sampleTags.length],
        sampleTags[(i + 7) % sampleTags.length],
      ],
    });
  }
  return companies;
};

const testCompanies = generateCompanies(100_000);

// Warmup
for (let i = 0; i < 1_000; i++) {
  primaryStage(testCompanies[i % testCompanies.length]);
}

const ITERATIONS = 10;
const times: number[] = [];

for (let iter = 0; iter < ITERATIONS; iter++) {
  const start = performance.now();
  for (let i = 0; i < testCompanies.length; i++) {
    primaryStage(testCompanies[i]);
  }
  const end = performance.now();
  times.push(end - start);
}

const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
const opsPerSec = (
  testCompanies.length /
  (avgTime / 1000)
).toLocaleString("en-US", { maximumFractionDigits: 0 });

console.log(
  `[BENCHMARK RESULT] Total ops: ${testCompanies.length.toLocaleString()} companies`,
);
console.log(
  `[BENCHMARK RESULT] Average execution time: ${avgTime.toFixed(2)} ms`,
);
console.log(`[BENCHMARK RESULT] Throughput: ${opsPerSec} ops/sec`);
