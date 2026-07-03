import "server-only";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

import { formatGuarani, formatNumber, formatDate } from "@/lib/format";

// A4 portrait, in PDF points.
const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const CONTENT_LEFT = MARGIN;
const CONTENT_RIGHT = PAGE_WIDTH - MARGIN;
const CONTENT_WIDTH = CONTENT_RIGHT - CONTENT_LEFT;
const FOOTER_LIMIT = 64; // don't draw table rows below this y

// Column layout for the line-items table (x = left edge of each column).
const COL = {
  item: CONTENT_LEFT,
  qty: CONTENT_LEFT + 34,
  unit: CONTENT_LEFT + 76,
  desc: CONTENT_LEFT + 118,
  unitPrice: CONTENT_LEFT + 340,
  total: CONTENT_LEFT + 425,
};
const COL_END = CONTENT_RIGHT; // right edge of the last column

const CELL_PAD = 5;
const ROW_FONT_SIZE = 9;
const LINE_HEIGHT = 12;

// Palette (neutral, professional). Adjust to match brand if desired.
const COLORS = {
  text: rgb(0.1, 0.12, 0.16),
  muted: rgb(0.45, 0.47, 0.52),
  headerBg: rgb(0.1, 0.14, 0.26),
  headerText: rgb(1, 1, 1),
  groupBg: rgb(0.92, 0.94, 0.97),
  border: rgb(0.78, 0.8, 0.84),
  totalBg: rgb(0.1, 0.14, 0.26),
};

const TYPE_LABELS = {
  service: "SERVICIOS",
  material: "MATERIALES",
};

/**
 * Strip characters the pdf-lib standard (WinAnsi/Latin-1) fonts can't encode,
 * so arbitrary user input never throws during drawing. Keeps ASCII printable +
 * Latin-1 accented letters (á, é, í, ó, ú, ñ, ç, ã, õ …) and whitespace.
 */
function safeText(value) {
  if (value == null) return "";
  return String(value)
    .replace(/[‘’‚‛]/g, "'")
    .replace(/[“”„]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, "");
}

/** Break text into lines that fit within maxWidth, hard-splitting long words. */
function wrapText(text, font, size, maxWidth) {
  const clean = safeText(text).replace(/\s+/g, " ").trim();
  if (!clean) return [""];

  const words = clean.split(" ");
  const lines = [];
  let current = "";

  const pushWord = (word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
      current = candidate;
      return;
    }
    if (current) {
      lines.push(current);
      current = "";
    }
    // Word alone is still too wide → hard-split by characters.
    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      current = word;
      return;
    }
    let chunk = "";
    for (const char of word) {
      if (font.widthOfTextAtSize(chunk + char, size) <= maxWidth) {
        chunk += char;
      } else {
        if (chunk) lines.push(chunk);
        chunk = char;
      }
    }
    current = chunk;
  };

  for (const word of words) pushWord(word);
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

/**
 * Drawing context that tracks the current page and vertical cursor, and creates
 * new pages (re-drawing the table header) when content runs off the bottom.
 */
function createRenderer(doc, font, fontBold) {
  const state = { page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]), y: PAGE_HEIGHT - MARGIN };

  const text = (str, x, y, { size = 10, bold = false, color = COLORS.text } = {}) => {
    state.page.drawText(safeText(str), { x, y, size, font: bold ? fontBold : font, color });
  };

  const textRight = (str, xRight, y, opts = {}) => {
    const value = safeText(str);
    const usedFont = opts.bold ? fontBold : font;
    const width = usedFont.widthOfTextAtSize(value, opts.size ?? 10);
    text(value, xRight - width, y, opts);
  };

  const rect = (x, y, w, h, opts = {}) => {
    state.page.drawRectangle({ x, y, width: w, height: h, ...opts });
  };

  const line = (x1, y1, x2, y2, thickness = 0.75, color = COLORS.border) => {
    state.page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness, color });
  };

  return { state, text, textRight, rect, line };
}

/** Draw the table's column header (used on the first page and after page breaks). */
function drawTableHeader(r) {
  const headerHeight = 20;
  const y = r.state.y - headerHeight;
  r.rect(CONTENT_LEFT, y, CONTENT_WIDTH, headerHeight, { color: COLORS.headerBg });

  const textY = y + 6;
  const opts = { size: 8, bold: true, color: COLORS.headerText };
  r.text("ITEM", COL.item + CELL_PAD, textY, opts);
  r.text("CANT.", COL.qty + CELL_PAD, textY, opts);
  r.text("UNID.", COL.unit + CELL_PAD, textY, opts);
  r.text("DISCRIMINACIÓN DE SERVICIOS y/o MATERIALES", COL.desc + CELL_PAD, textY, opts);
  r.textRight("P.UNIT. Gs", COL.total - CELL_PAD, textY, opts);
  r.textRight("P.TOTAL Gs", COL_END - CELL_PAD, textY, opts);

  r.state.y = y;
}

/** Ensure at least `needed` vertical points remain; otherwise start a new page. */
function ensureSpace(r, needed) {
  if (r.state.y - needed >= FOOTER_LIMIT) return;
  r.state.page = r.state.page.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  r.state.y = PAGE_HEIGHT - MARGIN;
  drawTableHeader(r);
}

/** Draw one product row; returns nothing but advances the cursor. */
function drawItemRow(r, { index, product, font }) {
  const descLines = wrapText(
    product.description ? `${product.name} — ${product.description}` : product.name,
    font,
    ROW_FONT_SIZE,
    COL.unitPrice - COL.desc - CELL_PAD * 2
  );
  const rowHeight = Math.max(LINE_HEIGHT + 6, descLines.length * LINE_HEIGHT + 6);

  ensureSpace(r, rowHeight);

  const top = r.state.y;
  const bottom = top - rowHeight;
  const firstLineY = top - LINE_HEIGHT;

  const quantity = Number(product.quantity) || 0;
  const total = Number(product.total) || 0;
  const unitPrice = quantity > 0 ? total / quantity : total;

  r.text(String(index), COL.item + CELL_PAD, firstLineY, { size: ROW_FONT_SIZE });
  r.text(formatNumber(quantity), COL.qty + CELL_PAD, firstLineY, { size: ROW_FONT_SIZE });
  r.text(product.unit ?? "", COL.unit + CELL_PAD, firstLineY, { size: ROW_FONT_SIZE });
  descLines.forEach((lineText, i) => {
    r.text(lineText, COL.desc + CELL_PAD, firstLineY - i * LINE_HEIGHT, { size: ROW_FONT_SIZE });
  });
  r.textRight(formatNumber(unitPrice), COL.total - CELL_PAD, firstLineY, { size: ROW_FONT_SIZE });
  r.textRight(formatNumber(total), COL_END - CELL_PAD, firstLineY, { size: ROW_FONT_SIZE });

  r.line(CONTENT_LEFT, bottom, COL_END, bottom, 0.5);
  r.state.y = bottom;
}

/** Draw a group header row (e.g. "SERVICIOS"). */
function drawGroupRow(r, label) {
  const height = 16;
  ensureSpace(r, height);
  const y = r.state.y - height;
  r.rect(CONTENT_LEFT, y, CONTENT_WIDTH, height, { color: COLORS.groupBg });
  r.text(label, COL.item + CELL_PAD, y + 4, { size: 8.5, bold: true });
  r.state.y = y;
}

/**
 * Build a quote PDF (Formighieri-style presupuesto) from a resolved quote.
 *
 * @param {object} quote - Resolved quote with `client`, `work`, `products[]`,
 *   `total`, `name`, `description`, `createdAt` and `_id`.
 * @param {object} options - `{ companyName }` shown as the issuer header.
 * @returns {Promise<Uint8Array>} the PDF bytes.
 */
export async function buildQuotePdf(quote, { companyName } = {}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  doc.setTitle(safeText(quote?.name || "Presupuesto"));
  doc.setProducer("Nivello");

  const r = createRenderer(doc, font, fontBold);
  const client = quote.client || {};
  const work = quote.work || {};
  const products = Array.isArray(quote.products) ? quote.products : [];
  const quoteNumber = String(quote._id || "").slice(-6).toUpperCase();

  // --- Issuer header ------------------------------------------------------
  r.text(companyName || "Presupuesto", CONTENT_LEFT, r.state.y - 14, { size: 18, bold: true });
  r.textRight("PRESUPUESTO", CONTENT_RIGHT, r.state.y - 12, { size: 13, bold: true });
  r.textRight(`Nro. ${quoteNumber}`, CONTENT_RIGHT, r.state.y - 26, { size: 10, color: COLORS.muted });
  r.state.y -= 40;
  r.line(CONTENT_LEFT, r.state.y, CONTENT_RIGHT, r.state.y, 1, COLORS.text);
  r.state.y -= 18;

  // --- Client / date block ------------------------------------------------
  const labelColOpts = { size: 9, bold: true, color: COLORS.muted };
  const valueColOpts = { size: 10 };
  const rightColX = CONTENT_LEFT + CONTENT_WIDTH * 0.62;

  r.text("CLIENTE:", CONTENT_LEFT, r.state.y, labelColOpts);
  r.text(client.name || "-", CONTENT_LEFT + 58, r.state.y, valueColOpts);
  r.text("FECHA:", rightColX, r.state.y, labelColOpts);
  r.text(formatDate(quote.createdAt), rightColX + 48, r.state.y, valueColOpts);
  r.state.y -= 15;

  r.text("DOMICILIO:", CONTENT_LEFT, r.state.y, labelColOpts);
  r.text(client.address || "-", CONTENT_LEFT + 58, r.state.y, valueColOpts);
  r.text("TEL.:", rightColX, r.state.y, labelColOpts);
  r.text(client.cellphone || "-", rightColX + 48, r.state.y, valueColOpts);
  r.state.y -= 24;

  // --- Quote title band ---------------------------------------------------
  const bandHeight = 22;
  r.state.y -= bandHeight;
  r.rect(CONTENT_LEFT, r.state.y, CONTENT_WIDTH, bandHeight, { color: COLORS.groupBg });
  const title = safeText(quote.name || "Presupuesto").toUpperCase();
  const titleWidth = fontBold.widthOfTextAtSize(title, 11);
  r.text(title, CONTENT_LEFT + (CONTENT_WIDTH - titleWidth) / 2, r.state.y + 7, {
    size: 11,
    bold: true,
  });
  r.state.y -= 6;

  if (work.name) {
    const workLine = work.address ? `Obra: ${work.name} — ${work.address}` : `Obra: ${work.name}`;
    r.text(workLine, CONTENT_LEFT, r.state.y - 4, { size: 9, color: COLORS.muted });
    r.state.y -= 16;
  } else {
    r.state.y -= 4;
  }

  // --- Line items table ---------------------------------------------------
  drawTableHeader(r);

  const grouped = { service: [], material: [] };
  for (const product of products) {
    (grouped[product.type] || (grouped.material)).push(product);
  }

  let index = 1;
  const groupOrder = ["service", "material"];
  for (const type of groupOrder) {
    const items = grouped[type];
    if (!items.length) continue;
    // Only print the group header if both groups have items; otherwise it's noise.
    if (grouped.service.length && grouped.material.length) {
      drawGroupRow(r, TYPE_LABELS[type]);
    }
    for (const product of items) {
      drawItemRow(r, { index, product, font });
      index += 1;
    }
  }

  if (products.length === 0) {
    ensureSpace(r, 20);
    r.text("Sin ítems en este presupuesto.", COL.desc + CELL_PAD, r.state.y - 14, {
      size: ROW_FONT_SIZE,
      color: COLORS.muted,
    });
    r.state.y -= 20;
    r.line(CONTENT_LEFT, r.state.y, COL_END, r.state.y, 0.5);
  }

  // --- Total --------------------------------------------------------------
  const total = Number(quote.total) || products.reduce((sum, p) => sum + (Number(p.total) || 0), 0);
  const totalHeight = 24;
  ensureSpace(r, totalHeight);
  r.state.y -= totalHeight;
  r.rect(COL.unit, r.state.y, COL_END - COL.unit, totalHeight, { color: COLORS.totalBg });
  r.text("TOTAL IVA INCLUIDO", COL.unit + CELL_PAD, r.state.y + 8, {
    size: 10,
    bold: true,
    color: COLORS.headerText,
  });
  r.textRight(formatGuarani(total), COL_END - CELL_PAD, r.state.y + 8, {
    size: 11,
    bold: true,
    color: COLORS.headerText,
  });
  r.state.y -= 20;

  // --- Observations -------------------------------------------------------
  if (quote.description) {
    ensureSpace(r, 40);
    r.text("Obs.:", CONTENT_LEFT, r.state.y, { size: 9, bold: true, color: COLORS.muted });
    r.state.y -= 12;
    const lines = wrapText(quote.description, font, 9, CONTENT_WIDTH);
    for (const lineText of lines) {
      ensureSpace(r, LINE_HEIGHT);
      r.text(lineText, CONTENT_LEFT, r.state.y, { size: 9, color: COLORS.text });
      r.state.y -= LINE_HEIGHT;
    }
  }

  // --- Footer (bottom of the last page) -----------------------------------
  const footer = `Generado por ${safeText(companyName || "Nivello")} el ${formatDate(new Date())}`;
  r.text(footer, CONTENT_LEFT, 36, { size: 7.5, color: COLORS.muted });

  return doc.save();
}
