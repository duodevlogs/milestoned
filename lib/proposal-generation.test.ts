import { describe, it, expect } from "vitest";
import { addDays, computeAddOnsTotal, toContractDraft, toSowDraft, type ProposalContent } from "./proposal-generation";

function fakeProposal(overrides: Partial<ProposalContent> = {}): ProposalContent {
  return {
    docType: "proposal",
    docTypeLabel: "Proposal",
    docNumber: "DDL-PRO-2026-001",
    dateIssued: "2026-08-01",
    validityDays: 30,
    validUntil: "2026-08-31",
    businessName: "Duo Dev Logs",
    businessAddress: null,
    clientName: "Acme Studio",
    clientCompany: "Acme Studio LLC",
    projectName: "Website redesign",
    executiveSummary: "We'll redesign the site.",
    understandingClientNeeds: "The site is slow and doesn't convert.",
    proposedApproach: "Three phases: discovery, design, build.",
    whyUs: "We've shipped a dozen redesigns.",
    scopeOverview: "Homepage, product pages, contact flow.",
    timelineOverview: "8 weeks.",
    budget: 9000,
    milestones: [
      { label: "Discovery", pct: 50, amount: 4500 },
      { label: "Launch", pct: 50, amount: 4500 },
    ],
    addOns: [],
    paymentTermsLabel: "Milestone-based",
    assumptionsExclusions: "",
    nextSteps: "Reply to move forward.",
    includeAcceptanceSignature: true,
    generatedAt: "2026-08-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("addDays", () => {
  it("adds days within the same month", () => {
    expect(addDays("2026-08-01", 10)).toBe("2026-08-11");
  });

  it("rolls over into the next month", () => {
    expect(addDays("2026-08-25", 10)).toBe("2026-09-04");
  });

  it("rolls over into the next year", () => {
    expect(addDays("2026-12-28", 10)).toBe("2027-01-07");
  });

  it("supports zero days", () => {
    expect(addDays("2026-08-01", 0)).toBe("2026-08-01");
  });
});

describe("computeAddOnsTotal", () => {
  it("sums the amounts", () => {
    expect(computeAddOnsTotal([{ amount: 500 }, { amount: 250 }])).toBe(750);
  });

  it("returns 0 for an empty list", () => {
    expect(computeAddOnsTotal([])).toBe(0);
  });
});

describe("toContractDraft", () => {
  it("carries over client, project, budget, and milestone percentages", () => {
    const draft = toContractDraft(fakeProposal(), "client-1");
    expect(draft.clientName).toBe("Acme Studio");
    expect(draft.clientId).toBe("client-1");
    expect(draft.projectName).toBe("Website redesign");
    expect(draft.budget).toBe(9000);
    expect(draft.milestones).toEqual([
      { label: "Discovery", pct: 50 },
      { label: "Launch", pct: 50 },
    ]);
  });

  it("combines scope overview and proposed approach into one scope field", () => {
    const draft = toContractDraft(fakeProposal(), null);
    expect(draft.scope).toBe("Homepage, product pages, contact flow.\n\nThree phases: discovery, design, build.");
    expect(draft.clientId).toBeNull();
  });

  it("skips a blank section rather than leaving stray whitespace", () => {
    const draft = toContractDraft(fakeProposal({ proposedApproach: "" }), null);
    expect(draft.scope).toBe("Homepage, product pages, contact flow.");
  });
});

describe("toSowDraft", () => {
  it("carries over client/company, links back to the source proposal, and combines notes", () => {
    const draft = toSowDraft(fakeProposal(), "client-1", "proposal-doc-1");
    expect(draft.clientName).toBe("Acme Studio");
    expect(draft.clientId).toBe("client-1");
    expect(draft.clientCompany).toBe("Acme Studio LLC");
    expect(draft.relatedProposalId).toBe("proposal-doc-1");
    expect(draft.overviewNotes).toBe("We'll redesign the site.\n\nThe site is slow and doesn't convert.");
    expect(draft.scopeNotes).toBe("Homepage, product pages, contact flow.\n\nThree phases: discovery, design, build.");
    expect(draft.budget).toBe(9000);
  });
});
