import "server-only";

import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { INVOICE_LATE_FEE_NOTE, formatInvoiceAmount, formatInvoiceDate, type InvoiceContent } from "@/lib/invoice-generation";

/*
 * Same color/font conventions as lib/pdf/DocumentPdf.tsx (Helvetica, no
 * custom font registration) so an Invoice reads consistently with
 * Contract/SOW/Proposal even though the layout is entirely different —
 * an invoice is identification + parties + a charge, not sections of prose.
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
  docNumber: {
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
  tableRowSub: {
    fontSize: 8,
    color: COLORS.muted,
    marginTop: 1,
  },
  tableRowAmount: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: COLORS.ink,
  },
  totalsBlock: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  totalsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    paddingVertical: 4,
  },
  totalsLabel: {
    fontSize: 9.5,
    color: COLORS.muted,
  },
  totalsValue: {
    fontSize: 9.5,
    color: "#2b2d34",
  },
  totalsFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 220,
    marginTop: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.total,
    borderRadius: 6,
  },
  totalsFinalLabel: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#2b2d34",
  },
  totalsFinalValue: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: COLORS.badgeText,
  },
  progressNote: {
    marginTop: 10,
    fontSize: 9,
    color: COLORS.muted,
  },
  paymentBlock: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 14,
    marginTop: 4,
  },
  paymentLine: {
    fontSize: 9.5,
    color: COLORS.body,
    marginBottom: 4,
  },
  lateFeeNote: {
    marginTop: 10,
    fontSize: 8.5,
    color: COLORS.faint,
    lineHeight: 1.4,
  },
  thankYou: {
    marginTop: 16,
    fontSize: 10,
    fontStyle: "italic",
    color: COLORS.body,
  },
});

export function InvoicePdf({
  content,
  businessName,
  logoUrl,
}: {
  content: InvoiceContent;
  businessName?: string | null;
  logoUrl?: string | null;
}) {
  const invoiceDateLabel = formatInvoiceDate(content.invoiceDate);
  const dueDateLabel = formatInvoiceDate(content.dueDate);

  return (
    <Document title={`${content.projectName} — Invoice ${content.docNumber}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.docTypeLabel}>Invoice</Text>
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
          <View style={styles.partyBlock}>
            <Text style={styles.partyLabel}>From</Text>
            <Text style={styles.partyName}>{content.businessName || "Your business"}</Text>
            {content.businessAddress && <Text style={styles.partyLine}>{content.businessAddress}</Text>}
            {content.taxId && <Text style={styles.partyLine}>Tax/VAT ID: {content.taxId}</Text>}
            {content.companyRegistration && (
              <Text style={styles.partyLine}>Reg. no: {content.companyRegistration}</Text>
            )}

            <Text style={[styles.partyLabel, { marginTop: 12 }]}>Bill to</Text>
            <Text style={styles.partyName}>{content.clientName}</Text>
            {content.clientCompany && <Text style={styles.partyLine}>{content.clientCompany}</Text>}
            {content.clientBillingAddress && (
              <Text style={styles.partyLine}>{content.clientBillingAddress}</Text>
            )}
          </View>

          <View style={styles.metaFactsBlock}>
            <View style={styles.metaFactRow}>
              <Text style={styles.metaFactLabel}>Project</Text>
              <Text style={styles.metaFactValue}>{content.projectName}</Text>
            </View>
            <View style={styles.metaFactRow}>
              <Text style={styles.metaFactLabel}>Invoice date</Text>
              <Text style={styles.metaFactValue}>{invoiceDateLabel ?? "—"}</Text>
            </View>
            {dueDateLabel && (
              <View style={styles.metaFactRow}>
                <Text style={styles.metaFactLabel}>Due date</Text>
                <Text style={styles.metaFactValue}>{dueDateLabel}</Text>
              </View>
            )}
            <View style={styles.metaFactRow}>
              <Text style={styles.metaFactLabel}>Payment terms</Text>
              <Text style={styles.metaFactValue}>{content.paymentTermsLabel}</Text>
            </View>
            {content.relatedDocNumber && (
              <View style={styles.metaFactRow}>
                <Text style={styles.metaFactLabel}>Ref</Text>
                <Text style={styles.metaFactValue}>{content.relatedDocNumber}</Text>
              </View>
            )}
            {content.poNumber && (
              <View style={styles.metaFactRow}>
                <Text style={styles.metaFactLabel}>PO number</Text>
                <Text style={styles.metaFactValue}>{content.poNumber}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.section} wrap={false}>
          <View style={styles.scheduleHeaderRow}>
            <Text style={styles.sectionTitle}>Charges</Text>
            <Text style={styles.interestBadge}>0% interest</Text>
          </View>
          <View style={styles.table}>
            {content.lineItems.map((item, i) => (
              <View key={i} style={styles.tableRow}>
                <View style={{ maxWidth: "72%" }}>
                  <Text style={styles.tableRowLabel}>{item.description}</Text>
                  {item.milestoneLabel && (
                    <Text style={styles.tableRowSub}>{item.milestoneLabel}</Text>
                  )}
                </View>
                <Text style={styles.tableRowAmount}>
                  {formatInvoiceAmount(item.amount, content.currency)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalsBlock}>
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Subtotal</Text>
              <Text style={styles.totalsValue}>
                {formatInvoiceAmount(content.subtotal, content.currency)}
              </Text>
            </View>
            {content.taxRatePct > 0 && (
              <View style={styles.totalsRow}>
                <Text style={styles.totalsLabel}>Tax ({content.taxRatePct}%)</Text>
                <Text style={styles.totalsValue}>
                  {formatInvoiceAmount(content.taxAmount, content.currency)}
                </Text>
              </View>
            )}
            <View style={styles.totalsFinalRow}>
              <Text style={styles.totalsFinalLabel}>Total due</Text>
              <Text style={styles.totalsFinalValue}>
                {formatInvoiceAmount(content.total, content.currency)}
              </Text>
            </View>
          </View>

          {content.milestoneProgress && (
            <Text style={styles.progressNote}>
              Milestone {content.milestoneProgress.current} of {content.milestoneProgress.total}
              {" "}in this engagement.
            </Text>
          )}
        </View>

        <View style={styles.paymentBlock} wrap={false}>
          <Text style={styles.sectionTitle}>Payment</Text>
          {content.paymentInstructions ? (
            <Text style={styles.paymentLine}>{content.paymentInstructions}</Text>
          ) : (
            <Text style={styles.paymentLine}>Payment instructions to be provided separately.</Text>
          )}
          <Text style={styles.lateFeeNote}>{INVOICE_LATE_FEE_NOTE}</Text>
        </View>

        {content.thankYouNote && <Text style={styles.thankYou}>{content.thankYouNote}</Text>}
      </Page>
    </Document>
  );
}
