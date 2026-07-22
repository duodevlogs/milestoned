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
};
