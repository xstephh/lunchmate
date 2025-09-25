import { sampleWeighted, type Candidate } from "../lib/sampler";
import { describe, it, expect } from "vitest";

const base: Candidate[] = [
  {
    id: "a",
    name: "A",
    address: "",
    lat: null,
    lng: null,
    source: "manual",
    avgMyRating: 5,
    publicRating: 5,
  },
  {
    id: "b",
    name: "B",
    address: "",
    lat: null,
    lng: null,
    source: "manual",
    avgMyRating: 2,
    publicRating: 3,
  },
];

describe("sampleWeighted", () => {
  it("prefers higher-scored items when epsilon=0", () => {
    const TRIALS = 400; // a bit larger for stability
    let countA = 0;

    for (let i = 0; i < TRIALS; i++) {
      const pick = sampleWeighted(base, { epsilon: 0 });
      if (pick?.id === "a") countA++;
    }

    // Expected ≈62.7%; use a conservative floor (58%) to avoid flakiness
    expect(countA).toBeGreaterThan(TRIALS * 0.58);
  });

  it("explores occasionally when epsilon>0", () => {
    const TRIALS = 400;
    let countB = 0;

    for (let i = 0; i < TRIALS; i++) {
      const pick = sampleWeighted(base, { epsilon: 0.3 });
      if (pick?.id === "b") countB++;
    }
    // With epsilon=0.3, we should see some B picks
    expect(countB).toBeGreaterThan(TRIALS * 0.05);
  });
});
