// PdfDocument.tsx
import React from "react";
import { Page, Text, View, Document, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 20,
  },
  section: {
    margin: 10,
    padding: 10,
    fontSize: 12,
    border: "1px solid #ddd",
  },
  header: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 12,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    fontSize: 12,
    flexDirection: "row",
  },
  tableCol: {
    width: "50%",
    borderStyle: "solid",
    borderBottomWidth: 1,
    borderRightWidth: 1,
    fontSize: 12,
    borderColor: "#ddd",
    padding: 5,
  },
  tableCell: {
    margin: "auto",
    fontSize: 10, // Smaller font size for data
    textAlign: "center",
  },
});

interface PdfDocumentProps {
  monthName: string;
  tableData: { date: string; sales: number }[];
}

const PdfDocument: React.FC<PdfDocumentProps> = ({ monthName, tableData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.header}>{monthName} Report</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Date</Text>
            </View>
            <View style={styles.tableCol}>
              <Text style={styles.tableCell}>Sales</Text>
            </View>
          </View>
          {tableData.map((row, index) => (
            <View key={index} style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{row.date}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>${row.sales.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

export default PdfDocument;
