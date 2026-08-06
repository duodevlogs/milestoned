import { describe, it, expect } from "vitest";
import { greetingForHour, displayNameFromEmail, initialsFromName } from "./user-display";

describe("greetingForHour", () => {
  it("greets morning before noon", () => {
    expect(greetingForHour(0)).toBe("Good morning");
    expect(greetingForHour(11)).toBe("Good morning");
  });

  it("greets afternoon from noon to before 6pm", () => {
    expect(greetingForHour(12)).toBe("Good afternoon");
    expect(greetingForHour(17)).toBe("Good afternoon");
  });

  it("greets evening from 6pm onward", () => {
    expect(greetingForHour(18)).toBe("Good evening");
    expect(greetingForHour(23)).toBe("Good evening");
  });
});

describe("displayNameFromEmail", () => {
  it("title-cases the local part of the email", () => {
    expect(displayNameFromEmail("test@milestoned.local")).toBe("Test");
  });

  it("splits on dots, underscores, and hyphens into separate words", () => {
    expect(displayNameFromEmail("jane.doe@example.com")).toBe("Jane Doe");
    expect(displayNameFromEmail("jane_doe@example.com")).toBe("Jane Doe");
    expect(displayNameFromEmail("jane-doe@example.com")).toBe("Jane Doe");
  });

  it("strips a plus-addressing suffix", () => {
    expect(displayNameFromEmail("jane+testing@example.com")).toBe("Jane");
  });
});

describe("initialsFromName", () => {
  it("takes the first letter of the first two words", () => {
    expect(initialsFromName("Jane Doe")).toBe("JD");
  });

  it("takes the first two letters of a single-word name", () => {
    expect(initialsFromName("Test")).toBe("TE");
  });

  it("falls back to '?' for an empty name", () => {
    expect(initialsFromName("")).toBe("?");
    expect(initialsFromName("   ")).toBe("?");
  });

  it("always uppercases the result", () => {
    expect(initialsFromName("jane doe")).toBe("JD");
  });
});
