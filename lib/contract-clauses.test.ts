import { describe, it, expect } from "vitest";
import {
  defaultClauseSelection,
  buildClauseSections,
  summarizeClauseSelection,
  type ClauseSelection,
} from "./contract-clauses";

function emptySelection(): ClauseSelection {
  return defaultClauseSelection("proposal"); // proposal's default is all-off
}

describe("defaultClauseSelection", () => {
  it("pre-checks the full standard set for a contract", () => {
    const selection = defaultClauseSelection("contract");
    expect(selection.ip).toBe(true);
    expect(selection.confidentiality).toBe(true);
    expect(selection.liability).toBe(true);
    expect(selection.termination).toBe(true);
    expect(selection.latePayment).toBe(true);
    expect(selection.warranty).toBe(true);
    expect(selection.revisions).toBe(true);
    expect(selection.governingLaw).toBe(true);
  });

  it("only pre-checks revisions for a SOW", () => {
    const selection = defaultClauseSelection("sow");
    expect(selection.revisions).toBe(true);
    expect(selection.ip).toBe(false);
    expect(selection.latePayment).toBe(false);
  });

  it("only pre-checks late payment for an invoice", () => {
    const selection = defaultClauseSelection("invoice");
    expect(selection.latePayment).toBe(true);
    expect(selection.revisions).toBe(false);
  });

  it("pre-checks nothing for a proposal", () => {
    const selection = defaultClauseSelection("proposal");
    expect(Object.values(selection).some((v) => v === true)).toBe(false);
  });
});

describe("buildClauseSections", () => {
  it("returns no sections when nothing is selected", () => {
    expect(buildClauseSections(emptySelection())).toEqual([]);
  });

  it("includes a section per opted-in clause, in a fixed order", () => {
    const selection: ClauseSelection = { ...emptySelection(), ip: true, warranty: true };
    const sections = buildClauseSections(selection);
    expect(sections.map((s) => s.title)).toEqual(["Intellectual Property", "Warranty Disclaimer"]);
  });

  it("interpolates the typed notice period into the termination clause", () => {
    const selection: ClauseSelection = {
      ...emptySelection(),
      termination: true,
      terminationNoticeDays: "30",
    };
    const sections = buildClauseSections(selection);
    expect(sections[0].body).toContain("30 days");
  });

  it("omits the governing-law clause when checked but no jurisdiction is typed", () => {
    const selection: ClauseSelection = {
      ...emptySelection(),
      governingLaw: true,
      governingLawJurisdiction: "",
    };
    expect(buildClauseSections(selection)).toEqual([]);
  });

  it("includes the governing-law clause with the typed jurisdiction once one is provided", () => {
    const selection: ClauseSelection = {
      ...emptySelection(),
      governingLaw: true,
      governingLawJurisdiction: "Germany",
    };
    const sections = buildClauseSections(selection);
    expect(sections).toHaveLength(1);
    expect(sections[0].body).toContain("Germany");
  });

  it("omits a custom clause checked with no text, includes it once text is provided", () => {
    const checkedNoText: ClauseSelection = {
      ...emptySelection(),
      customClause: true,
      customClauseText: "",
    };
    expect(buildClauseSections(checkedNoText)).toEqual([]);

    const withText: ClauseSelection = {
      ...emptySelection(),
      customClause: true,
      customClauseTitle: "Non-compete",
      customClauseText: "Neither party will poach the other's staff.",
    };
    const sections = buildClauseSections(withText);
    expect(sections).toEqual([
      { title: "Non-compete", body: "Neither party will poach the other's staff." },
    ]);
  });

  it("falls back to 'Additional Terms' when a custom clause has text but no title", () => {
    const selection: ClauseSelection = {
      ...emptySelection(),
      customClause: true,
      customClauseTitle: "",
      customClauseText: "Some term.",
    };
    expect(buildClauseSections(selection)[0].title).toBe("Additional Terms");
  });
});

describe("summarizeClauseSelection", () => {
  it("returns a label per opted-in standard clause", () => {
    const selection: ClauseSelection = { ...emptySelection(), ip: true, revisions: true };
    expect(summarizeClauseSelection(selection)).toEqual([
      "Intellectual property assignment",
      "Revisions & change requests",
    ]);
  });

  it("includes the custom clause's title only when it has text", () => {
    const withText: ClauseSelection = {
      ...emptySelection(),
      customClause: true,
      customClauseTitle: "Non-compete",
      customClauseText: "Some text",
    };
    expect(summarizeClauseSelection(withText)).toEqual(["Non-compete"]);

    const noText: ClauseSelection = { ...emptySelection(), customClause: true };
    expect(summarizeClauseSelection(noText)).toEqual([]);
  });
});
