import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPDF = (
    title: string,
    columns: { key: string; label: string }[],
    data: Record<string, unknown>[]
) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Fecha de exportación: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = columns.map((col) => col.label);
    const tableRows = [];

    for (const row of data) {
        const rowData = columns.map((col) => {
            const val = row[col.key];
            return val === null || val === undefined ? "" : String(val);
        });
        tableRows.push(rowData);
    }

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 35,
        theme: "grid",
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { fillColor: [66, 66, 66] },
    });

    doc.save(`${title.replace(/\s+/g, "_").toLowerCase()}_${new Date().toISOString().slice(0, 10)}.pdf`);
};
