import "server-only";

import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency, formatDateLabel } from "@/lib/document-generation";
import { computeAddOnsTotal, type ProposalContent } from "@/lib/proposal-generation";

/*
 * Same color/font conventions as lib/pdf/DocumentPdf.tsx and InvoicePdf.tsx
 * (Helvetica, no custom font registration) so a Proposal reads consistently
 * with the other document types even though the layout is entirely its
 * own — a proposal is a pitch (cover block + persuasive prose + an
 * investment summary), not a legal agreement with clauses.
 */
const COLORS = {
  ink: "#14151a",
  body: "#3d3f47",
  muted: "#8a8577",
  faint: "#a29d90",
  border: "#e6e2d8",
  row: "#efece4",
  badgeText: "#7a6a2f",
  total: "#f7f4ec",
  signatureLine: "#c9c4b6",
};

const styles = StyleSheet.create({
  page: {
    padding: "50pt 46pt",
    fontSize: 10,
    lineHeight: 1.5,
    color: COLORS.body,
    fontFamily: "Helvetica",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.ink,
    paddingBottom: 14,
    marginBottom: 18,
  },
  docTypeLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: COLORS.muted,
    marginBottom: 5,
  },
  projectName: {
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
  },
  docNumber: {
    fontSize: 9,
    color: COLORS.muted,
    marginTop: 2,
  },
  brand: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    textAlign: "right",
  },
  logo: {
    height: 26,
    maxWidth: 120,
    objectFit: "contain",
    marginLeft: "auto",
  },
  metaRow: {
    flexDirection: "row",
    gap: 32,
    marginBottom: 22,
  },
  metaLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: COLORS.faint,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: COLORS.ink,
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 10,
    lineHeight: 1.5,
    color: COLORS.body,
  },
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.row,
  },
  tableRowLabel: {
    fontSize: 10,
    color: "#2b2d34",
  },
  tableRowPct: {
    fontSize: 9,
    color: COLORS.muted,
    marginRight: 8,
  },
  tableRowAmount: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
  },
  addOnsLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: COLORS.faint,
    marginTop: 12,
    marginBottom: 6,
  },
  tableTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.total,
  },
  tableTotalLabel: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#2b2d34",
  },
  tableTotalAmount: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.badgeText,
  },
  investmentFootnote: {
    marginTop: 8,
    fontSize: 8.5,
    color: COLORS.faint,
  },
  signatureRow: {
    flexDirection: "row",
    gap: 36,
    marginTop: 28,
  },
  signatureBlock: {
    flex: 1,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.signatureLine,
    marginBottom: 6,
  },
  signatureLabel: {
    fontSize: 8,
    color: COLORS.faint,
  },
  signatureNote: {
    marginTop: 6,
    fontSize: 8,
    color: COLORS.faint,
  },
});

export function ProposalPdf({
  content,
  businessName,
  logoUrl,
}: {
  content: ProposalContent;
  businessName?: string | null;
  logoUrl?: string | null;
}) {
  const proseSections = [
    { title: "Executive Summary", body: content.executiveSummary },
    { title: "Understanding Your Needs", body: content.understandingClientNeeds },
    { title: "Proposed Approach", body: content.proposedApproach },
    { title: "Scope Overview", body: content.scopeOverview },
    { title: "Timeline Overview", body: content.timelineOverview },
    { title: "Why Us", body: content.whyUs },
  ];

  const addOnsTotal = computeAddOnsTotal(content.addOns);

  return (
    <Document title={`${content.projectName} — Proposal ${content.docNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.docTypeLabel}>Proposal</Text>
            <Text style={styles.projectName}>{content.projectName || "Untitled project"}</Text>
            <Text style={styles.docNumber}>{content.docNumber}</Text>
          </View>
          <View>
            {logoUrl ? (
              // react-pdf's Image is a PDF-embed primitive, not an HTML img
              // element — it has no alt prop, this isn't an a11y concern.
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={logoUrl} style={styles.logo} />
            ) : businessName || content.businessName ? (
              <Text style={styles.brand}>{businessName || content.businessName}</Text>
            ) : null}
          </View>
        </View>

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Prepared for</Text>
            <Text style={styles.metaValue}>{content.clientName || "Client name"}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Date issued</Text>
            <Text style={styles.metaValue}>{formatDateLabel(content.dateIssued) ?? "—"}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Valid until</Text>
            <Text style={styles.metaValue}>{formatDateLabel(content.validUntil) ?? "—"}</Text>
          </View>
        </View>

        {proseSections.map(
          (section) =>
            section.body.trim() && (
              <View key={section.title} style={styles.section} wrap={false}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            )
        )}

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Investment Summary</Text>
          <View style={styles.table}>
            {content.milestones.map((m, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableRowLabel}>
                  {i + 1}. {m.label || `Milestone ${i + 1}`}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={styles.tableRowPct}>{m.pct}%</Text>
                  <Text style={styles.tableRowAmount}>{formatCurrency(m.amount)}</Text>
                </View>
              </View>
            ))}
            <View style={styles.tableTotalRow}>
              <Text style={styles.tableTotalLabel}>Total project investment</Text>
              <Text style={styles.tableTotalAmount}>{formatCurrency(content.budget)}</Text>
            </View>
          </View>

          {content.addOns.length > 0 && (
            <>
              <Text style={styles.addOnsLabel}>Optional add-ons — priced separately</Text>
              <View style={styles.table}>
                {content.addOns.map((addOn, i) => (
                  <View key={i} style={styles.tableRow}>
                    <Text style={styles.tableRowLabel}>{addOn.label}</Text>
                    <Text style={styles.tableRowAmount}>{formatCurrency(addOn.amount)}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.investmentFootnote}>
                Add-ons total {formatCurrency(addOnsTotal)}, not included in the project investment above.
              </Text>
            </>
          )}

          <Text style={styles.investmentFootnote}>
            Payment terms: {content.paymentTermsLabel}. Pricing valid through{" "}
            {formatDateLabel(content.validUntil) ?? "the date above"}.
          </Text>
        </View>

        {content.assumptionsExclusions.trim() && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Assumptions &amp; Exclusions</Text>
            <Text style={styles.sectionBody}>{content.assumptionsExclusions}</Text>
          </View>
        )}

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <Text style={styles.sectionBody}>{content.nextSteps}</Text>
        </View>

        {content.includeAcceptanceSignature && (
          <View style={styles.signatureRow} wrap={false}>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>Client signature</Text>
              <Text style={styles.signatureNote}>
                Informal acknowledgement — not a binding contract.
              </Text>
            </View>
            <View style={styles.signatureBlock}>
              <View style={styles.signatureLine} />
              <Text style={styles.signatureLabel}>{content.businessName || "Consultant"} signature</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
