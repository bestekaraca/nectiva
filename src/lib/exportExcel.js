/**
 * columns: [{ header: "Firma", value: (row) => row.company, width: 22 }, ...]
 * rows: ham veri dizisi (leads gibi)
 */
export async function exportToExcel({ filename, reportTitle, columns, rows }) {
  // Büyük kütüphane olduğu için sadece dışa aktarma tıklandığında yüklenir,
  // uygulamanın normal açılış hızını etkilemez.
  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "Nectiva";
  wb.created = new Date();

  const ws = wb.addWorksheet("Rapor");
  const colCount = columns.length;

  const dateStr = new Date().toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Başlık satırı (rapor adı + çekilme tarihi)
  ws.mergeCells(1, 1, 1, colCount);
  const titleCell = ws.getCell(1, 1);
  titleCell.value = `${reportTitle}  —  Rapor Tarihi: ${dateStr}`;
  titleCell.font = { bold: true, size: 13, color: { argb: "FF4C1D95" } };
  titleCell.alignment = { vertical: "middle" };
  ws.getRow(1).height = 26;

  ws.mergeCells(2, 1, 2, colCount);
  const subCell = ws.getCell(2, 1);
  subCell.value = `Toplam ${rows.length} kayıt`;
  subCell.font = { italic: true, size: 10, color: { argb: "FF6B7280" } };

  // Başlık (header) satırı
  const headerRowIndex = 4;
  columns.forEach((col, i) => {
    const cell = ws.getCell(headerRowIndex, i + 1);
    cell.value = col.header;
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7C3AED" } };
    cell.alignment = { vertical: "middle", horizontal: "left" };
    cell.border = { bottom: { style: "thin", color: { argb: "FF5B21B6" } } };
  });
  ws.getRow(headerRowIndex).height = 22;

  // Veri satırları
  rows.forEach((row, rIdx) => {
    const excelRow = headerRowIndex + 1 + rIdx;
    columns.forEach((col, cIdx) => {
      const cell = ws.getCell(excelRow, cIdx + 1);
      cell.value = col.value(row) ?? "";
      cell.alignment = { vertical: "middle" };
    });
    if (rIdx % 2 === 1) {
      for (let c = 1; c <= colCount; c++) {
        ws.getCell(excelRow, c).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF5F3FF" },
        };
      }
    }
  });

  columns.forEach((col, i) => {
    ws.getColumn(i + 1).width = col.width || 18;
  });

  // Başlık satırını sabitle (aşağı kaydırınca hep görünsün)
  ws.views = [{ state: "frozen", ySplit: headerRowIndex }];

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
