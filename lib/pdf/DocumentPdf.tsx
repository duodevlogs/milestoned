import "server-only";

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import {
  formatCurrency,
  formatTimelineLabel,
  type GeneratedDocumentContent,
} from "@/lib/document-generation";
import { LEGAL_DISCLAIMER } from "@/lib/contract-clauses";

/*
 * react-pdf's built-in Helvetica only supports WinAnsiEncoding (~cp1252), so
 * the "→" used in the on-screen timeline label (U+2192) renders as a broken
 * glyph here — swap it for an en dash, which cp1252 does include.
 */
function pdfSafeTimelineLabel(startDate: string | null, deliveryDate: string | null): string {
  return formatTimelineLabel(startDate, deliveryDate).replace(/→/g, "–");
}

/*
 * Uses react-pdf's built-in Helvetica (no font registration needed) rather
 * than the app's Space Grotesk/IBM Plex Sans webfonts — custom fonts require
 * bundling font files and registering them at render time, which isn't
 * needed for a clean, professional document. Colors mirror the --color-paper-*
 * tokens in app/globals.css so the PDF reads consistently with the on-screen
 * preview even though the font differs.
 */
const COLORS = {
  ink: "#14151a",
  body: "#3d3f47",
  muted: "#8a8577",
  faint: "#a29d90",
  border: "#e6e2d8",
  row: "#efece4",
  badge: "#f3ecd6",
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
  brand: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
    textAlign: "right",
  },
  brandDate: {
    fontSize: 8,
    color: COLORS.muted,
    textAlign: "right",
    marginTop: 2,
  },
  metaRow: {
    flexDirection: "row",
    gap: 32,
    marginBottom: 20,
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
    marginBottom: 18,
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
  deliverables: {
    fontSize: 9.5,
    color: COLORS.body,
    marginTop: 6,
  },
  deliverablesLabel: {
    color: COLORS.muted,
  },
  scheduleHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  interestBadge: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: COLORS.badgeText,
    backgroundColor: COLORS.badge,
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 8,
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
  disclaimer: {
    marginTop: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    fontSize: 8,
    lineHeight: 1.4,
    color: COLORS.faint,
  },
});

export function DocumentPdf({
  content,
  generatedAt,
}: {
  content: GeneratedDocumentContent;
  generatedAt: string;
}) {
  // sections is always [Parties & Purpose, Scope of Work, ...clauses,
  // Acceptance] — Acceptance is always appended last by the generation
  // service, so it's safe to split off here without title-matching.
  const mainSections = content.sections.slice(0, -1);
  const acceptance = content.sections[content.sections.length - 1];
  const dateLabel = new Date(generatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Document title={`${content.projectName} — ${content.docTypeLabel}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.docTypeLabel}>{content.docTypeLabel}</Text>
            <Text style={styles.projectName}>{content.projectName || "Untitled project"}</Text>
          </View>
          <View>
            <Text style={styles.brand}>Milestoned</Text>
            <Text style={styles.brandDate}>{dateLabel}</Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View>
            <Text style={styles.metaLabel}>Prepared for</Text>
            <Text style={styles.metaValue}>{content.clientName || "Client name"}</Text>
          </View>
          <View>
            <Text style={styles.metaLabel}>Timeline</Text>
            <Text style={styles.metaValue}>
              {pdfSafeTimelineLabel(content.startDate, content.deliveryDate)}
            </Text>
          </View>
        </View>

        {mainSections.map((section, i) => (
          // wrap={false}: every section moves to the next page as a whole
          // block rather than splitting a Text node mid-paragraph across a
          // page boundary — @react-pdf/renderer v4.5.1 silently drops the
          // rest of the document when a Text node has to reflow across a
          // page break (confirmed by direct testing), so this is a
          // correctness fix, not just an orphan-prevention nicety. Sections
          // are always short enough (a few sentences) to fit on one page.
          <View key={section.title} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>
              {i + 1} · {section.title}
            </Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
            {section.title === "Scope of Work" && content.deliverables.trim() && (
              <Text style={styles.deliverables}>
                <Text style={styles.deliverablesLabel}>Key deliverables — </Text>
                {content.deliverables}
              </Text>
            )}
          </View>
        ))}

        <View style={styles.section} wrap={false}>
          <View style={styles.scheduleHeaderRow}>
            <Text style={styles.sectionTitle}>{mainSections.length + 1} · Payment schedule</Text>
            <Text style={styles.interestBadge}>0% interest</Text>
          </View>
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
              <Text style={styles.tableTotalLabel}>Total project value</Text>
              <Text style={styles.tableTotalAmount}>{formatCurrency(content.budget)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>
            {mainSections.length + 2} · {acceptance.title}
          </Text>
          <Text style={styles.sectionBody}>{acceptance.body}</Text>
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

        <View style={styles.disclaimer} wrap={false}>
          <Text>{LEGAL_DISCLAIMER}</Text>
        </View>
      </Page>
    </Document>
  );
}
