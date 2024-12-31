import { describe, it, expect } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import DailyCard from "./daily-card.vue";

describe("DailyCard", () => {
  
  it("should mount the component", async () => {
    const cmp = await mountSuspended(DailyCard);
    expect(cmp.html()).toContain("button");
  })

})
