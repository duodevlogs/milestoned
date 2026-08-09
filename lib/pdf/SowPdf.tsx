import "server-only";

import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { formatCurrency, formatDateLabel } from "@/lib/document-generation";
import type { SowContent } from "@/lib/sow-generation";

/*
 * Same color/font conventions as the other PDF templates (Helvetica, no
 * custom font registration) so a SOW reads consistently with the rest of
 * the document set. Structurally closer to DocumentPdf.tsx (numbered prose
 * sections + clause sections + signatures) than InvoicePdf/ProposalPdf,
 * since a SOW is the most clause-heavy, table-heavy of the four types.
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
    justifyContent: "space-between",
    marginBottom: 22,
  },
  partyBlock: {
    maxWidth: "48%",
  },
  partyLabel: {
    fontSize: 8,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: COLORS.faint,
    marginBottom: 4,
  },
  partyName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    marginBottom: 2,
  },
  partyLine: {
    fontSize: 9,
    color: COLORS.body,
    lineHeight: 1.4,
  },
  metaFactsBlock: {
    textAlign: "right",
  },
  metaFactRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginBottom: 3,
  },
  metaFactLabel: {
    fontSize: 9,
    color: COLORS.faint,
  },
  metaFactValue: {
    fontSize: 9,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.row,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  deliverableItem: {
    fontSize: 10,
    color: "#2b2d34",
    maxWidth: "48%",
  },
  deliverableCriteria: {
    fontSize: 9,
    color: COLORS.muted,
    maxWidth: "48%",
    textAlign: "right",
  },
  tableRowLabel: {
    fontSize: 10,
    color: "#2b2d34",
  },
  tableRowDate: {
    fontSize: 9,
    color: COLORS.muted,
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
});

export function SowPdf({
  content,
  businessName,
  logoUrl,
}: {
  content: SowContent;
  businessName?: string | null;
  logoUrl?: string | null;
}) {
  const proseSections = [
    { title: "Purpose", body: content.purpose },
    { title: "Project Overview", body: content.projectOverview },
    { title: "Scope of Work", body: content.scopeOfWork },
    { title: "Out of Scope", body: content.outOfScope },
  ];

  const trailingSections = [
    { title: "Client Responsibilities", body: content.clientResponsibilities },
    { title: "Assumptions", body: content.assumptions },
  ];

  return (
    <Document title={`${content.projectName} — SOW ${content.docNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.docTypeLabel}>Scope of Work</Text>
            <Text style={styles.projectName}>{content.projectName || "Untitled project"}</Text>
            <Text style={styles.docNumber}>
              {content.docNumber} · v{content.version}
            </Text>
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
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>Consultant</Text>
            <Text style={styles.partyName}>{content.businessName || "Your business"}</Text>
            {content.businessAddress && <Text style={styles.partyLine}>{content.businessAddress}</Text>}

            <Text style={[styles.partyLabel, { marginTop: 12 }]}>Client</Text>
            <Text style={styles.partyName}>{content.clientName}</Text>
            {content.clientCompany && <Text style={styles.partyLine}>{content.clientCompany}</Text>}
          </View>

          <View style={styles.metaFactsBlock}>
            {content.linkedProposalNumber && (
              <View style={styles.metaFactRow}>
                <Text style={styles.metaFactLabel}>Proposal ref</Text>
                <Text style={styles.metaFactValue}>{content.linkedProposalNumber}</Text>
              </View>
            )}
            {content.linkedContractNumber && (
              <View style={styles.metaFactRow}>
                <Text style={styles.metaFactLabel}>Contract ref</Text>
                <Text style={styles.metaFactValue}>{content.linkedContractNumber}</Text>
              </View>
            )}
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

        {content.deliverables.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Deliverables &amp; Acceptance Criteria</Text>
            <View style={styles.table}>
              {content.deliverables.map((d, i) => (
                <View
                  key={i}
                  style={[
                    styles.tableRow,
                    i === content.deliverables.length - 1 ? styles.tableRowLast : {},
                  ]}
                >
                  <Text style={styles.deliverableItem}>{d.item}</Text>
                  <Text style={styles.deliverableCriteria}>{d.acceptanceCriteria}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Timeline &amp; Milestones</Text>
          <View style={styles.table}>
            {content.milestones.map((m, i) => (
              <View
                key={i}
                style={[styles.tableRow, i === content.milestones.length - 1 ? styles.tableRowLast : {}]}
              >
                <Text style={styles.tableRowLabel}>
                  {i + 1}. {m.label}
                </Text>
                <Text style={styles.tableRowDate}>
                  {m.targetDate ? (formatDateLabel(m.targetDate) ?? "—") : "—"}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Payment Schedule</Text>
          <View style={styles.table}>
            {content.milestones.map((m, i) => (
              <View key={i} style={styles.tableRow}>
                <Text style={styles.tableRowLabel}>
                  {i + 1}. {m.label}
                </Text>
                <View style={{ flexDirection: "row", alignItems: "baseline" }}>
                  <Text style={styles.tableRowPct}>{m.pct}%</Text>
                  <Text style={styles.tableRowAmount}>{formatCurrency(m.amount)}</Text>
                </View>
              </View>
            ))}
            <View style={styles.tableTotalRow}>
              <Text style={styles.tableTotalLabel}>Total project value</Text>
              <Text style={styles.tableTotalAmount}>{formatCurrency(content.budget)}</Text>
            </View>
          </View>
        </View>

        {trailingSections.map(
          (section) =>
            section.body.trim() && (
              <View key={section.title} style={styles.section} wrap={false}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionBody}>{section.body}</Text>
              </View>
            )
        )}

        {content.clauseSections.map((section) => (
          <View key={section.title} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Governing Terms</Text>
          <Text style={styles.sectionBody}>{content.governingTermsNote}</Text>
        </View>

        <View style={styles.signatureRow} wrap={false}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Client signature</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Consultant signature</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
