import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";
import { DOC_TYPE_META } from "@/lib/document-display";
import type { DocType } from "@/lib/document-generation";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    const key = process.env.OPENAI_API_KEY;
    if (!key) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    client = new OpenAI({ apiKey: key });
  }
  return client;
}

// Configurable so escalating nano → mini (or beyond) later is an env change,
// not a code change — see project notes on the provider/model roadmap.
const MODEL = process.env.OPENAI_MODEL || "gpt-5.4-nano";

const documentSectionsSchema = z.object({
  partiesAndPurpose: z
    .string()
    .describe(
      "A short paragraph naming the client and an independent web consultant as the parties, and stating the purpose of this document for the named project."
    ),
  scopeOfWork: z
    .string()
    .describe(
      "A paragraph expanding the consultant's plain-language scope notes into formal, clause-ready language describing the work to be done."
    ),
});

export type DocumentSections = z.infer<typeof documentSectionsSchema>;

const proposalSectionsSchema = z.object({
  executiveSummary: z
    .string()
    .describe(
      "A few sentences stating the client's problem and the proposed solution — the reader should understand the pitch from this alone."
    ),
  understandingClientNeeds: z
    .string()
    .describe(
      "A paragraph restating what the consultant heard from the client (their notes on the client's situation and needs), showing the client they were listened to."
    ),
  proposedApproach: z
    .string()
    .describe(
      "A paragraph or two explaining how the consultant will solve the problem, expanding their approach notes into a phased, confident plan."
    ),
  whyUs: z
    .string()
    .describe(
      "A short paragraph making the case for this consultant/company specifically, expanding their credibility notes without generic hype."
    ),
});

export type ProposalSections = z.infer<typeof proposalSectionsSchema>;

const sowSectionsSchema = z.object({
  purpose: z
    .string()
    .describe(
      "One paragraph stating the purpose of this Scope of Work and tying it to the governing contract (or the agreement between the parties, if no contract number is given)."
    ),
  projectOverview: z
    .string()
    .describe("A paragraph explaining what's being built and why, for someone new to the project."),
  scopeOfWork: z
    .string()
    .describe(
      "A paragraph or two expanding the consultant's plain scope notes into formal, itemized, clause-ready language describing the work included."
    ),
});

export type SowSections = z.infer<typeof sowSectionsSchema>;

export const openaiService = {
  /**
   * Generates the two prose sections of a document (Parties & Purpose,
   * Scope of Work). The payment schedule and acceptance clause are computed/
   * templated elsewhere — not AI-generated — so there's nothing for the
   * model to get wrong about amounts or milestone math.
   */
  async generateDocumentSections(input: {
    docType: DocType;
    clientName: string;
    projectName: string;
    budget: number;
    scope: string;
    deliverables: string;
  }): Promise<DocumentSections> {
    const docTypeLabel = DOC_TYPE_META[input.docType].label;

    const promptLines = [
      `Document type: ${docTypeLabel}`,
      `Client: ${input.clientName}`,
      `Project: ${input.projectName}`,
      `Total project value: $${input.budget.toLocaleString("en-US")} USD`,
      `Scope notes from the consultant: ${input.scope}`,
      input.deliverables ? `Key deliverables: ${input.deliverables}` : null,
      "",
      "Write the two sections described in the schema, in plain English, using only the facts given above.",
    ].filter((line): line is string => line !== null);

    const response = await getClient().responses.parse({
      model: MODEL,
      instructions:
        "You write two clause-ready sections for client-facing web development documents (Scope of Work, Contract, Proposal, or Invoice) produced by Milestoned, a tool for freelance web developers and small dev consultancies. Voice: calm, direct, professional — no hype, no exclamation points, no filler. Turn the consultant's plain notes into formal but plain-English paragraphs. Do not invent deliverables, dates, or amounts beyond what is given to you.",
      input: promptLines.join("\n"),
      text: { format: zodTextFormat(documentSectionsSchema, "document_sections") },
    });

    const parsed = response.output_parsed;
    if (!parsed) {
      throw new Error("The AI did not return parseable structured output.");
    }
    return parsed;
  },

  /**
   * Proposal gets its own prompt/schema rather than reusing
   * generateDocumentSections — it's a sales document sent before any
   * agreement exists, so the voice is persuasive, not clause-ready, and it
   * needs four prose sections instead of two.
   */
  async generateProposalSections(input: {
    businessName: string | null;
    clientName: string;
    projectName: string;
    budget: number;
    problemNotes: string;
    approachNotes: string;
    whyUsNotes: string;
  }): Promise<ProposalSections> {
    const proposingParty = input.businessName?.trim() || "the consultant";
    const promptLines = [
      `Proposing party (speaks in first person as "we"): ${proposingParty}`,
      `Client: ${input.clientName}`,
      `Project: ${input.projectName}`,
      `Total project investment: $${input.budget.toLocaleString("en-US")} USD`,
      `${proposingParty}'s notes on the client's problem / discovery call: ${input.problemNotes}`,
      `${proposingParty}'s notes on their proposed approach: ${input.approachNotes}`,
      `${proposingParty}'s notes on why they're the right fit: ${input.whyUsNotes}`,
      "",
      "Write the four sections described in the schema, in plain English, using only the facts given above.",
    ];

    const response = await getClient().responses.parse({
      model: MODEL,
      instructions:
        "You write the persuasive prose sections of a business proposal, one business pitching a client project to a prospective client, before any contract exists. Milestoned is only the software generating this document — never name it, never refer to it as the proposing party, and never write as if Milestoned is doing the work. The proposing party is given to you explicitly in the input as \"Proposing party\" — write in first person (\"we\") as that party, using only the name given. Voice: confident and warm, not legal or hype-y — this document's job is to win the engagement, not lock in terms. No exclamation points, no generic sales filler like \"unparalleled\" or \"game-changing.\" Turn the notes into a compelling narrative. Do not invent facts, credentials, deliverables, or figures beyond what is given to you.",
      input: promptLines.join("\n"),
      text: { format: zodTextFormat(proposalSectionsSchema, "proposal_sections") },
    });

    const parsed = response.output_parsed;
    if (!parsed) {
      throw new Error("The AI did not return parseable structured output.");
    }
    return parsed;
  },

  /**
   * SOW gets its own prompt/schema too — it's the detailed, working
   * document that governs the engagement once a proposal's been accepted,
   * so the voice is formal and itemized (closer to Contract's), but it
   * needs three sections instead of two and has to reference the governing
   * contract by number when one is linked.
   */
  async generateSowSections(input: {
    businessName: string | null;
    clientName: string;
    projectName: string;
    linkedContractNumber: string | null;
    overviewNotes: string;
    scopeNotes: string;
  }): Promise<SowSections> {
    const consultingParty = input.businessName?.trim() || "the consultant";
    const promptLines = [
      `Consulting party (speaks in first person as "we"): ${consultingParty}`,
      `Client: ${input.clientName}`,
      `Project: ${input.projectName}`,
      input.linkedContractNumber
        ? `Governing contract number: ${input.linkedContractNumber}`
        : "No governing contract number was provided — refer to it generically as \"the agreement between the parties.\"",
      `${consultingParty}'s notes on what's being built and why: ${input.overviewNotes}`,
      `${consultingParty}'s scope notes: ${input.scopeNotes}`,
      "",
      "Write the three sections described in the schema, in plain English, using only the facts given above.",
    ];

    const response = await getClient().responses.parse({
      model: MODEL,
      instructions:
        "You write formal, clause-ready sections of a Scope of Work document — the detailed working document that governs a client engagement once a proposal has been accepted. Milestoned is only the software generating this document — never name it, never refer to it as a party to the agreement, and never write as if Milestoned is doing the work. The consulting party is given to you explicitly in the input as \"Consulting party\" — write in first person (\"we\") as that party, using only the name given. Voice: calm, direct, professional — no hype, no exclamation points, no filler. Turn the notes into formal but plain-English paragraphs. Do not invent deliverables, dates, or amounts beyond what is given to you.",
      input: promptLines.join("\n"),
      text: { format: zodTextFormat(sowSectionsSchema, "sow_sections") },
    });

    const parsed = response.output_parsed;
    if (!parsed) {
      throw new Error("The AI did not return parseable structured output.");
    }
    return parsed;
  },
};
