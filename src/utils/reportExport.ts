import jsPDF from 'jspdf';
import { format } from 'date-fns';
// Locale import available but not currently used
// import { fr } from 'date-fns/locale';
import ExcelJS from 'exceljs';
import type { InterventionReport } from '../store/reportStore';

export function generatePDF(report: InterventionReport): Blob {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // Helper function for text wrapping
  const addWrappedText = (text: string, x: number, y: number, maxWidth: number) => {
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return y + (lines.length * 7);
  };

  // Header
  doc.setFontSize(20);
  doc.text('E.S.T.T.M & Co', margin, y);
  y += 10;

  doc.setFontSize(16);
  doc.text('Rapport d\'Intervention', margin, y);
  y += 10;

  doc.setFontSize(12);
  doc.text(`Gabon (Libreville)`, margin, y);
  y += 15;

  // Report details
  doc.setFontSize(10);
  doc.text(`N° Rapport: ${report.id}`, margin, y);
  doc.text(`Date: ${format(new Date(report.date), 'dd MMMM yyyy')}`, pageWidth - 80, y);
  y += 15;

  // Client information
  doc.setFontSize(12);
  doc.text('Identification Client', margin, y);
  y += 7;
  doc.setFontSize(10);
  y = addWrappedText(`Client: ${report.clientName}`, margin, y, pageWidth - 2 * margin);
  y += 7;

  // Equipment information
  doc.setFontSize(12);
  y += 10;
  doc.text('Équipement', margin, y);
  y += 7;
  doc.setFontSize(10);
  y = addWrappedText(`Type: ${report.equipmentType}`, margin, y, pageWidth - 2 * margin);
  y = addWrappedText(`Marque: ${report.brand}`, margin, y + 7, pageWidth - 2 * margin);
  y = addWrappedText(`N° série: ${report.serialNumber}`, margin, y + 7, pageWidth - 2 * margin);
  y += 15;

  // Intervention details
  doc.setFontSize(12);
  doc.text('Détails de l\'intervention', margin, y);
  y += 7;
  doc.setFontSize(10);
  y = addWrappedText(report.description, margin, y, pageWidth - 2 * margin);
  y += 10;

  // Actions taken
  if (report.findings.length > 0) {
    doc.setFontSize(12);
    doc.text('Actions réalisées', margin, y);
    y += 7;
    doc.setFontSize(10);
    report.findings.forEach(finding => {
      y = addWrappedText(`• ${finding}`, margin, y, pageWidth - 2 * margin);
      y += 5;
    });
    y += 5;
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    doc.setFontSize(12);
    doc.text('Recommandations', margin, y);
    y += 7;
    doc.setFontSize(10);
    report.recommendations.forEach(recommendation => {
      y = addWrappedText(`• ${recommendation}`, margin, y, pageWidth - 2 * margin);
      y += 5;
    });
  }

  // Next maintenance
  if (report.nextMaintenanceDate) {
    y += 10;
    doc.setFontSize(10);
    doc.text(
      `Prochaine maintenance prévue: ${format(new Date(report.nextMaintenanceDate), 'dd MMMM yyyy')}`,
      margin,
      y
    );
  }

  // Footer
  y = doc.internal.pageSize.getHeight() - 30;
  doc.setFontSize(8);
  doc.text('E.S.T.T.M & Co - Maintenance et Services', margin, y);
  doc.text('Libreville, Gabon', margin, y + 5);

  return doc.output('blob');
}

export async function generateExcel(reports: InterventionReport[]): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  
  // Main sheet
  const mainSheet = workbook.addWorksheet('Rapports');
  mainSheet.columns = [
    { header: 'N° Rapport', key: 'id', width: 15 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Client', key: 'clientName', width: 25 },
    { header: 'Équipement', key: 'equipmentType', width: 20 },
    { header: 'Marque', key: 'brand', width: 15 },
    { header: 'N° Série', key: 'serialNumber', width: 15 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Statut', key: 'status', width: 15 },
    { header: 'Prochaine Maintenance', key: 'nextMaintenanceDate', width: 20 }
  ];

  reports.forEach(report => {
    mainSheet.addRow({
      id: report.id,
      date: format(new Date(report.date), 'dd/MM/yyyy'),
      clientName: report.clientName,
      equipmentType: report.equipmentType,
      brand: report.brand,
      serialNumber: report.serialNumber,
      description: report.description,
      status: report.status,
      nextMaintenanceDate: report.nextMaintenanceDate ? 
        format(new Date(report.nextMaintenanceDate), 'dd/MM/yyyy') : 'N/A'
    });
  });

  // Details sheet
  const detailsSheet = workbook.addWorksheet('Détails');
  detailsSheet.columns = [
    { header: 'N° Rapport', key: 'id', width: 15 },
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Actions Réalisées', key: 'findings', width: 40 },
    { header: 'Recommandations', key: 'recommendations', width: 40 }
  ];

  reports.forEach(report => {
    detailsSheet.addRow({
      id: report.id,
      date: format(new Date(report.date), 'dd/MM/yyyy'),
      findings: report.findings.join('\n'),
      recommendations: report.recommendations.join('\n')
    });
  });

  // Generate the file
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}