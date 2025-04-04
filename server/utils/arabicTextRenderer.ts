import { createCanvas, registerFont } from 'canvas';

// Initialize canvas with proper RTL settings
function createRTLCanvas(width: number, height: number) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Set up canvas for RTL text
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  ctx.font = '14px Arial';

  return { canvas, ctx };
}

export function renderArabicSection(text: string[], options: {
  width?: number;
  fontSize?: number;
  backgroundColor?: string;
  textColor?: string;
} = {}): Buffer {
  // Default options
  const {
    width = 500,
    fontSize = 14,
    backgroundColor = '#ffffff',
    textColor = '#000000'
  } = options;

  const lineHeight = fontSize * 1.5;
  const padding = 20;

  // Calculate height needed
  const totalLines = text.reduce((acc, line) => {
    if (!line.trim()) return acc + 0.5; // Half line for empty lines
    const estimatedWidth = line.length * (fontSize * 0.6);
    const linesNeeded = Math.ceil(estimatedWidth / (width - (padding * 2)));
    return acc + linesNeeded;
  }, 0);

  const height = Math.ceil((totalLines * lineHeight) + (padding * 2));

  // Create canvas and set context
  const { canvas, ctx } = createRTLCanvas(width, height);

  // Fill background
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, width, height);

  // Draw text
  ctx.fillStyle = textColor;
  let currentY = padding;

  text.forEach(line => {
    if (!line.trim()) {
      currentY += lineHeight * 0.5;
      return;
    }

    // Word wrapping for RTL text
    const words = line.split(' ').reverse();
    let currentLine = '';
    let testLine = '';

    for (let i = 0; i < words.length; i++) {
      testLine = words[i] + (currentLine ? ' ' : '') + currentLine;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > width - (padding * 2) && i > 0) {
        ctx.fillText(currentLine, width - padding, currentY);
        currentLine = words[i];
        currentY += lineHeight;
      } else {
        currentLine = testLine;
      }
    }

    ctx.fillText(currentLine, width - padding, currentY);
    currentY += lineHeight;
  });

  return canvas.toBuffer('image/png');
}