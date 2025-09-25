import { isSameRestaurant } from "../lib/dedupe";
import { describe, it, expect } from "vitest";

describe("dedupe", () => {
  it("matches by normalized name + address", () => {
    expect(
      isSameRestaurant(
        { name: "Sakura  Bento", address: "12  Sushi St." },
        { name: "sakura bento", address: "12 sushi st" },
      ),
    ).toBe(true);

    expect(
      isSameRestaurant(
        { name: "Green Bowl", address: "5 Leaf Ave" },
        { name: "Green  Bowl", address: "6 Leaf Ave" },
      ),
    ).toBe(false);
  });
});
