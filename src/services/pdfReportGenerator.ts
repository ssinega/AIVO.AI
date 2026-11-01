import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Investigation } from '../types';

export function generateInvestigationPDF(inv: Investigation) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Header Banner
  doc.setFillColor(15, 23, 42); // Deep navy #0F172A
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('AIVOA.AI — PHARMACEUTICAL QUALITY INVESTIGATION REPORT', margin, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('ICH Q9 Quality Risk Management & ICH Q10 Pharmaceutical Quality System Standard', margin, 19);

  doc.setTextColor(56, 189, 248); // Sky blue #38BDF8
  doc.setFont('helvetica', 'bold');
  doc.text(`DEVIATION ID: ${inv.deviation_id}`, pageWidth - margin - 50, 19);

  let currentY = 36;

  // Section 1: Overview Table
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. DEVIATION & BATCH INFORMATION', margin, currentY);
  currentY += 4;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Field Parameter', 'Extracted Record Detail', 'Field Parameter', 'Extracted Record Detail']],
    body: [
      ['Deviation ID', inv.deviation_id, 'Severity Level', inv.severity],
      ['Incident Title', inv.title, 'Batch Number', inv.batch_number],
      ['API Product', inv.product_name, 'Department', inv.department],
      ['Manufacturing Stage', inv.manufacturing_stage, 'Equipment Involved', inv.equipment],
      ['Occurrence Date', inv.occurrence_date, 'Reported Date', inv.reported_date],
      ['Investigation Owner', inv.extracted_data?.investigation_owner || 'QA Lead', 'Investigation Status', inv.investigation_status]
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 2: Narrative & Containment
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. INCIDENT NARRATIVE & CONTAINMENT ACTION', margin, currentY);
  currentY += 4;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Category', 'Summary Description']],
    body: [
      ['Incident Description', inv.description || 'N/A'],
      ['Immediate Containment Action', inv.immediate_action || 'N/A'],
      ['Observed Quality Impact', inv.extracted_data?.observed_impact || 'Under assessment']
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    columnStyles: { 0: { cellWidth: 45, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 3: 5 Whys Analysis
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. STRUCTURED 5 WHYS CAUSAL CHAIN', margin, currentY);
  currentY += 4;

  const fiveWhysRows = (inv.five_whys || []).map(w => [
    `Why #${w.level}`,
    w.question,
    w.answer,
    w.supporting_evidence,
    w.confidence,
    w.is_verified ? 'Verified' : 'Pending'
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Level', 'Why Question', 'Causal Answer', 'Supporting Evidence', 'Confidence Level', 'Status']],
    body: fiveWhysRows.length > 0 ? fiveWhysRows : [['-', 'No 5 Whys steps recorded', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 16, fontStyle: 'bold' },
      1: { cellWidth: 45 },
      2: { cellWidth: 55 },
      3: { cellWidth: 35 },
      4: { cellWidth: 22 },
      5: { cellWidth: 16 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 4: Evidence Gaps
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('4. EVIDENCE GAP ANALYSIS CHECKLIST', margin, currentY);
  currentY += 4;

  const gapRows = (inv.evidence_gaps || []).map(g => [
    g.missing_evidence,
    g.evidence_category,
    g.reason_required,
    g.priority,
    g.status
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Required Document / Record', 'Category', 'Reason Required', 'Priority', 'Status']],
    body: gapRows.length > 0 ? gapRows : [['-', 'No evidence gaps flagged', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] }
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  // Section 5: CAPA Recommendations
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('5. CORRECTIVE AND PREVENTIVE ACTIONS (CAPA)', margin, currentY);
  currentY += 4;

  const capaRows = (inv.capas || []).map(c => [
    c.id,
    c.capa_type,
    c.description,
    `${c.owner} (${c.responsible_department})`,
    c.target_date,
    c.status
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['CAPA ID', 'Action Type', 'Description', 'Owner / Dept', 'Target Date', 'Status']],
    body: capaRows.length > 0 ? capaRows : [['-', 'No CAPAs formulated', '-', '-', '-', '-']],
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 8, textColor: [30, 41, 59] }
  });

  currentY = (doc as any).lastAutoTable.finalY + 12;

  // Footer & Sign-off Notice
  if (currentY + 25 > doc.internal.pageSize.getHeight()) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, currentY, pageWidth - margin * 2, 22, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, currentY, pageWidth - margin * 2, 22, 'S');

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('QUALITY ASSURANCE APPROVAL & COMPLIANCE SIGN-OFF', margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('This investigation report has been generated using AI-assisted GxP Root Cause Analysis.', margin + 4, currentY + 12);
  doc.text(`Digital Sign-Off Key: QA-SIG-${Math.floor(10000 + Math.random() * 90000)} | Generated on: ${new Date().toISOString().split('T')[0]}`, margin + 4, currentY + 17);

  // Save PDF
  doc.save(`AIVOA_RCA_Report_${inv.deviation_id}_${inv.batch_number}.pdf`);
}
