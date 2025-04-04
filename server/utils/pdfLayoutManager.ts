import PDFDocument from 'pdfkit';

interface ContentPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LayoutSection {
  id: string;
  content: string;
  position: ContentPosition;
  rendered: boolean;
}

export class PDFLayoutManager {
  private sections: LayoutSection[] = [];
  private doc: PDFDocument;
  private currentY: number;
  private pageHeight: number;
  private pageWidth: number;
  private margins: { top: number; right: number; bottom: number; left: number };

  constructor(doc: PDFDocument) {
    this.doc = doc;
    this.currentY = doc.y;
    this.pageHeight = doc.page.height;
    this.pageWidth = doc.page.width;
    this.margins = {
      top: 50,
      right: 50,
      bottom: 50,
      left: 50
    };
  }

  private isContentRendered(id: string): boolean {
    return this.sections.some(section => section.id === id && section.rendered);
  }

  addSection(id: string, content: string, height: number = 0): boolean {
    // Check if content was already rendered
    if (this.isContentRendered(id)) {
      console.log(`Section ${id} already rendered, skipping...`);
      return false;
    }

    // Check if we need a new page
    if (this.currentY + height > this.pageHeight - this.margins.bottom) {
      this.doc.addPage();
      this.currentY = this.margins.top;
    }

    const position = {
      x: this.margins.left,
      y: this.currentY,
      width: this.pageWidth - (this.margins.left + this.margins.right),
      height: height
    };

    this.sections.push({ 
      id, 
      content, 
      position,
      rendered: true 
    });

    this.currentY += height + 20;
    return true;
  }

  getNextY(): number {
    return this.currentY;
  }

  reset(): void {
    this.sections = [];
    this.currentY = this.margins.top;
  }

  getSectionPosition(id: string): ContentPosition | undefined {
    const section = this.sections.find(s => s.id === id);
    return section?.position;
  }
}