import jsPDF from 'jspdf';

export interface ExportData {
  title: string;
  subtitle?: string;
  period?: string;
  statistics?: Array<{ label: string; value: string | number }>;
  tableHeaders: string[];
  tableData: Array<Array<string | number>>;
  chartData?: any;
}

export class ReportExporter {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 280;
  private margin: number = 20;

  constructor() {
    this.doc = new jsPDF();
  }

  private checkPageBreak(requiredHeight: number = 15) {
    if (this.currentY + requiredHeight > this.pageHeight) {
      this.doc.addPage();
      this.currentY = 20;
    }
  }

  private addTitle(title: string) {
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 15;
  }

  private addSubtitle(subtitle: string) {
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(subtitle, this.margin, this.currentY);
    this.currentY += 10;
  }

  private addStatistics(statistics: Array<{ label: string; value: string | number }>) {
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Estatísticas:', this.margin, this.currentY);
    this.currentY += 10;

    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    
    statistics.forEach(stat => {
      this.checkPageBreak();
      this.doc.text(`${stat.label}: ${stat.value}`, this.margin, this.currentY);
      this.currentY += 8;
    });
    
    this.currentY += 10;
  }

  private addTable(headers: string[], data: Array<Array<string | number>>) {
    this.checkPageBreak(30);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Dados:', this.margin, this.currentY);
    this.currentY += 15;

    // Headers
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    
    const colWidth = (this.doc.internal.pageSize.width - (this.margin * 2)) / headers.length;
    
    headers.forEach((header, index) => {
      this.doc.text(header, this.margin + (index * colWidth), this.currentY);
    });
    
    this.currentY += 8;

    // Data rows
    this.doc.setFont('helvetica', 'normal');
    
    data.slice(0, 30).forEach(row => { // Limit to 30 rows
      this.checkPageBreak();
      
      row.forEach((cell, index) => {
        const cellText = cell.toString().substring(0, 20); // Limit cell length
        this.doc.text(cellText, this.margin + (index * colWidth), this.currentY);
      });
      
      this.currentY += 8;
    });

    if (data.length > 30) {
      this.checkPageBreak();
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(`... e mais ${data.length - 30} registros`, this.margin, this.currentY);
      this.currentY += 10;
    }
  }

  exportPDF(data: ExportData, filename: string) {
    this.addTitle(data.title);
    
    if (data.subtitle) {
      this.addSubtitle(data.subtitle);
    }
    
    if (data.period) {
      this.addSubtitle(`Período: ${data.period}`);
    }
    
    this.currentY += 10;
    
    if (data.statistics) {
      this.addStatistics(data.statistics);
    }
    
    this.addTable(data.tableHeaders, data.tableData);
    
    // Footer
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleDateString('pt-BR')}`,
        this.margin,
        this.doc.internal.pageSize.height - 10
      );
    }
    
    this.doc.save(filename);
  }
}

export function exportToCSV(headers: string[], data: Array<Array<string | number>>, filename: string) {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      row.map(cell => {
        const cellStr = cell.toString();
        // Escape commas and quotes
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`;
        }
        return cellStr;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}

export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate).toLocaleDateString('pt-BR');
  const end = new Date(endDate).toLocaleDateString('pt-BR');
  return `${start} a ${end}`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getRiskLevel(frequency: number): { level: string; color: string } {
  if (frequency >= 90) return { level: 'Excelente', color: 'green' };
  if (frequency >= 75) return { level: 'Bom', color: 'blue' };
  if (frequency >= 50) return { level: 'Alerta', color: 'yellow' };
  return { level: 'Crítico', color: 'red' };
}