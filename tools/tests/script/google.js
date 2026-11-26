// Stand-in Google services for apps-script/Code.gs, kept in memory (P75).
//
// Only what Code.gs uses is here: check.js scans Code.gs and fails if it starts using a
// Google service or method this file doesn't stand in for. The real script runs unchanged.
//
// How the stand-in Sheet behaves like the real one (as far as Code.gs can tell):
//   - getValues() gives '' for empty cells, and copies (changing them changes nothing).
//   - setValues() must match the range's size, or it throws, as Google's does.
//   - A range needs at least one row and one column, or it throws.
//   - Text that looks like a number or TRUE/FALSE is stored as a number or true/false, as typing
//     it into a cell would be. Text over 50,000 characters is refused (the Sheets per-cell limit:
//     secondary sources and the error text users quote, checked 2026-11-13; Google's own page
//     not found). Text starting with = would become a formula: refused here, so a check sees it.
//   - getLastRow()/getLastColumn() are the last row/column holding anything (0 when empty).
//   - A tab has 1000 rows (Google's default for a new tab) unless its data is longer; a range
//     reaching below the last row throws, as Google's does. insertRowsBefore adds rows.
//   - Pivot tables, the Name filter (a slicer) and number formats are only recorded, for the
//     checks to read (P88). Inserting rows never stretches a pivot table's or slicer's range
//     here: the worst case, so the script's own fix for it (rebuilding the summary) is what's tested.

'use strict';

const CELL_LIMIT = 50000;
const isDate = (v) => Object.prototype.toString.call(v) === '[object Date]';
const copyValue = (v) => (isDate(v) ? new Date(v.getTime()) : v);

// What a cell holds after a value is written to it.
function stored(value) {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'string') return copyValue(value);
  if (value.length > CELL_LIMIT) {
    throw new Error('Your input contains more than the maximum of 50000 characters in a single cell.');
  }
  if (value.startsWith('=')) throw new Error('stand-in: a formula was written: ' + value.slice(0, 40));
  const t = value.trim();
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  if (/^(true|false)$/i.test(t)) return t.toUpperCase() === 'TRUE';
  return value;
}

class Range {
  constructor(sheet, row, col, nRows, nCols) {
    for (const [n, what] of [[row, 'row'], [col, 'column']]) {
      if (!Number.isInteger(n) || n < 1) throw new Error(`stand-in: bad starting ${what} ${n}`);
    }
    if (!Number.isInteger(nRows) || nRows < 1) throw new Error('The number of rows in the range must be at least 1.');
    if (!Number.isInteger(nCols) || nCols < 1) throw new Error('The number of columns in the range must be at least 1.');
    if (row + nRows - 1 > sheet.maxRows) throw new Error('The coordinates of the range are outside the dimensions of the sheet.');
    Object.assign(this, { sheet, row, col, nRows, nCols });
  }

  getLastRow() { return this.row + this.nRows - 1; }

  // Recorded per column: { <column>: [format, from row, to row] }.
  setNumberFormat(format) {
    for (let c = 0; c < this.nCols; c++) this.sheet.formats[this.col + c] = [format, this.row, this.getLastRow()];
    return this;
  }

  // Recorded per column, like formats: { <column>: [rule, from row, to row] }.
  setDataValidation(rule) {
    for (let c = 0; c < this.nCols; c++) this.sheet.validations[this.col + c] = [rule, this.row, this.getLastRow()];
    return this;
  }

  createPivotTable(source) {
    const t = new PivotTable(this.sheet, this, source);
    this.sheet.pivots.push(t);
    return t;
  }

  getValues() {
    const out = [];
    for (let r = 0; r < this.nRows; r++) {
      const line = this.sheet.cells[this.row - 1 + r] || [];
      const vals = [];
      for (let c = 0; c < this.nCols; c++) {
        const v = line[this.col - 1 + c];
        vals.push(v === undefined ? '' : copyValue(v));
      }
      out.push(vals);
    }
    return out;
  }

  setValues(values) {
    if (!Array.isArray(values) || values.length !== this.nRows || values.some((v) => !Array.isArray(v) || v.length !== this.nCols)) {
      const got = Array.isArray(values) ? `${values.length} by ${(values[0] || []).length}` : typeof values;
      throw new Error(`The number of rows or columns in the data does not match the range (range ${this.nRows} by ${this.nCols}, data ${got}).`);
    }
    values.forEach((vals, r) => vals.forEach((v, c) => this.sheet.put(this.row + r, this.col + c, stored(v))));
    return this;
  }

  setValue(value) {
    return this.setValues(Array.from({ length: this.nRows }, () => Array(this.nCols).fill(value)));
  }

  clearContent() {
    for (let r = 0; r < this.nRows; r++) {
      for (let c = 0; c < this.nCols; c++) this.sheet.put(this.row + r, this.col + c, '');
    }
    return this;
  }

  setFontWeight(weight) {
    if (this.row === 1) this.sheet.boldHeader = weight === 'bold';
    return this;
  }

  // Looks only (P88): recorded by top-left cell.
  setFontColor(colour) { this.sheet.looks[`${this.row},${this.col}`] = { ...this.sheet.looks[`${this.row},${this.col}`], colour }; return this; }
  setFontSize(size) { this.sheet.looks[`${this.row},${this.col}`] = { ...this.sheet.looks[`${this.row},${this.col}`], size }; return this; }
}

class Sheet {
  constructor(name, cells = []) {
    this.name = name;
    this.cells = cells.map((line) => line.map(stored));
    this.frozenRows = 0;
    this.boldHeader = false;
    this.maxRows = Math.max(1000, this.cells.length);
    this.hidden = false;
    this.formats = {};
    this.validations = {};
    this.pivots = [];
    this.slicers = [];
    this.looks = {};
    this.widths = {};
    this.hiddenColumns = new Set();
    this.conditional = [];
  }

  clear() { this.cells = []; this.formats = {}; this.looks = {}; return this; }
  clearConditionalFormatRules() { this.conditional = []; }
  setConditionalFormatRules(rules) { this.conditional = rules.slice(); }
  getConditionalFormatRules() { return this.conditional.slice(); }
  setColumnWidth(col, width) { this.widths[col] = width; return this; }
  setColumnWidths(col, n, width) { for (let i = 0; i < n; i++) this.widths[col + i] = width; return this; }
  hideColumns(col, n = 1) { for (let i = 0; i < n; i++) this.hiddenColumns.add(col + i); }

  getMaxRows() { return this.maxRows; }

  insertRowsBefore(before, howMany) {
    if (before < 1 || before > this.maxRows) throw new Error('stand-in: insertRowsBefore out of range');
    if (this.cells.length >= before) this.cells.splice(before - 1, 0, ...Array.from({ length: howMany }, () => []));
    this.maxRows += howMany;
    return this;
  }

  hideSheet() { this.hidden = true; return this; }
  isSheetHidden() { return this.hidden; }
  getPivotTables() { return this.pivots.slice(); }
  getSlicers() { return this.slicers.slice(); }

  insertSlicer(range, anchorRowPos, anchorColPos) {
    const x = new Slicer(this, range, anchorRowPos, anchorColPos);
    this.slicers.push(x);
    return x;
  }

  put(row, col, value) {
    while (this.cells.length < row) this.cells.push([]);
    const line = this.cells[row - 1];
    while (line.length < col) line.push('');
    line[col - 1] = value;
  }

  getName() { return this.name; }

  getLastRow() {
    for (let r = this.cells.length; r > 0; r--) {
      if (this.cells[r - 1].some((v) => v !== '')) return r;
    }
    return 0;
  }

  getLastColumn() {
    let last = 0;
    this.cells.forEach((line) => line.forEach((v, c) => { if (v !== '') last = Math.max(last, c + 1); }));
    return last;
  }

  getRange(row, col, nRows = 1, nCols = 1) { return new Range(this, row, col, nRows, nCols); }

  // Google's data range is never smaller than A1, even on an empty tab.
  getDataRange() { return new Range(this, 1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); }

  setFrozenRows(n) { this.frozenRows = n; return this; }

  // For the checks: the tab's cells, trimmed to its data, as plain values.
  dump() { return this.getLastRow() ? this.getDataRange().getValues() : []; }
}

// ---- Pivot tables and the slicer (P88): recorded only ----

class PivotGroup {
  constructor(column) { Object.assign(this, { column, totals: null, order: 'asc', name: null }); }
  setDisplayName(name) { this.name = name; return this; }
  showTotals(on) { this.totals = on; return this; }
  sortDescending() { this.order = 'desc'; return this; }
  sortAscending() { this.order = 'asc'; return this; }
}

class PivotValue {
  constructor(column, fn) { Object.assign(this, { column, fn, name: null }); }
  setDisplayName(name) { this.name = name; return this; }
}

class PivotTable {
  constructor(sheet, anchor, source) {
    if (!(source instanceof Range)) throw new Error('stand-in: pivot source must be a range');
    Object.assign(this, { sheet, anchor, source, rows: [], columns: [], values: [], filters: [] });
  }
  addRowGroup(column) { const g = new PivotGroup(column); this.rows.push(g); return g; }
  addColumnGroup(column) { const g = new PivotGroup(column); this.columns.push(g); return g; }
  addPivotValue(column, fn) {
    if (!fn) throw new Error('stand-in: unknown summarize function');
    const v = new PivotValue(column, fn); this.values.push(v); return v;
  }
  addFilter(column, criteria) { this.filters.push({ column, criteria }); return this.filters[this.filters.length - 1]; }
  getSourceDataRange() { return this.source; }
  getAnchorCell() { return this.anchor; }
  remove() { this.sheet.pivots = this.sheet.pivots.filter((t) => t !== this); }
}

class Slicer {
  constructor(sheet, range, row, col) {
    Object.assign(this, { sheet, range, row, col, title: '', criteria: null, toPivots: null });
  }
  setTitle(t) { this.title = t; return this; }
  // As Google did on 18 Nov 2026: a null filter resets the slicer, column included, so it sits on
  // the range's first column (P88).
  setColumnFilterCriteria(column, criteria) { this.criteria = criteria === null ? { column: 1, criteria: null } : { column, criteria }; return this; }
  setApplyToPivotTables(on) { this.toPivots = on; return this; }
  getRange() { return this.range; }
  remove() { this.sheet.slicers = this.sheet.slicers.filter((x) => x !== this); }
}

function newConditionalFormatRule() {
  const r = { formula: null, ranges: [], background: null, font: null, bold: null };
  return {
    whenFormulaSatisfied(f) { r.formula = f; return this; },
    setRanges(ranges) { r.ranges = ranges; return this; },
    setBackground(c) { r.background = c; return this; },
    setFontColor(c) { r.font = c; return this; },
    setBold(b) { r.bold = b; return this; },
    build() { if (!r.formula || !r.ranges.length) throw new Error('stand-in: rule without formula or range'); return { ...r }; },
  };
}

function newFilterCriteria() {
  const c = { type: null };
  return {
    whenCellNotEmpty() { c.type = 'not-empty'; return this; },
    build() { if (!c.type) throw new Error('stand-in: empty filter criteria'); return { ...c }; },
  };
}

let nextId = 1;

class Spreadsheet {
  // tabs: { name: [[header...], [row...], ...] } in tab order.
  constructor(name = 'Family games', tabs = {}) {
    this.name = name;
    this.id = 'ss' + nextId++;
    this.sheets = Object.entries(tabs).map(([n, cells]) => new Sheet(n, cells));
    this.copies = [];
  }

  getName() { return this.name; }
  getUrl() { return `https://docs.google.com/spreadsheets/d/${this.id}/edit (stand-in)`; }
  getSpreadsheetTimeZone() { return 'Europe/London'; }
  getSheetByName(name) { return this.sheets.find((s) => s.name === name) || null; }

  insertSheet(name) {
    if (this.getSheetByName(name)) throw new Error(`A sheet with the name "${name}" already exists. Please enter another name.`);
    const s = new Sheet(name);
    this.sheets.push(s);
    return s;
  }

  copy(name) {
    const c = new Spreadsheet(name, {});
    c.sheets = this.sheets.map((s) => new Sheet(s.name, s.dump()));
    this.copies.push(c);
    return c;
  }

  // For the checks: every tab as plain values, in tab order.
  dump() {
    const out = {};
    this.sheets.forEach((s) => { out[s.name] = s.dump(); });
    return out;
  }
}

// Formats a date in a time zone; only the patterns Code.gs uses.
function formatDate(date, timeZone, pattern) {
  const parts = {};
  new Intl.DateTimeFormat('en-GB', {
    timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).forEach((p) => { parts[p.type] = p.value; });
  const known = { yyyy: parts.year, MM: parts.month, dd: parts.day, HH: parts.hour, mm: parts.minute };
  const out = pattern.replace(/yyyy|MM|dd|HH|mm/g, (k) => known[k]);
  if (/[a-zA-Z]/.test(out.replace(/\s/g, ''))) throw new Error('stand-in: date pattern not covered: ' + pattern);
  return out;
}

// Builds one set of stand-ins around a spreadsheet: the globals Code.gs sees, plus what checks read.
function services({ spreadsheet = new Spreadsheet(), familyCode = 'test-code' } = {}) {
  const log = [];
  const lock = { held: false, waits: 0 };
  return {
    spreadsheet,
    log,
    lock,
    globals: {
      SpreadsheetApp: {
        getActiveSpreadsheet: () => spreadsheet,
        newFilterCriteria,
        newConditionalFormatRule,
        newDataValidation: () => {
          const rule = { range: null, allowInvalid: true, help: '' };
          const b = {
            requireValueInRange(range, showDropdown) { rule.range = range; rule.dropdown = showDropdown !== false; return b; },
            setAllowInvalid(v) { rule.allowInvalid = !!v; return b; },
            setHelpText(t) { rule.help = String(t); return b; },
            build: () => rule,
          };
          return b;
        },
        PivotTableSummarizeFunction: { COUNTA: 'COUNTA', SUM: 'SUM' },
      },
      PropertiesService: {
        getScriptProperties: () => ({ getProperty: (k) => (k === 'FAMILY_CODE' ? familyCode : null) }),
      },
      Utilities: {
        formatDate,
        getUuid: () => require('crypto').randomUUID(),
      },
      Logger: { log: (msg) => { log.push(String(msg)); } },
      LockService: {
        getScriptLock: () => ({
          waitLock() { if (lock.held) throw new Error('stand-in: lock already held'); lock.held = true; lock.waits++; },
          releaseLock() { lock.held = false; },
        }),
      },
      ContentService: {
        MimeType: { JSON: 'JSON' },
        createTextOutput: (text) => ({
          text,
          mime: null,
          setMimeType(m) { this.mime = m; return this; },
          getContent() { return this.text; },
        }),
      },
    },
  };
}

// Every method name the stand-ins answer, for check.js's scan of Code.gs.
function knownMethods() {
  const names = new Set();
  for (const proto of [Range.prototype, Sheet.prototype, Spreadsheet.prototype, PivotTable.prototype,
    PivotGroup.prototype, PivotValue.prototype, Slicer.prototype]) {
    Object.getOwnPropertyNames(proto).forEach((n) => names.add(n));
  }
  const g = services().globals;
  const walk = (o) => {
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      names.add(k);
      if (typeof v === 'function' && v.length === 0 && !/^(getUuid)$/.test(k)) {
        try { walk(v()); } catch { /* needs arguments */ }
      } else walk(v);
    }
  };
  walk(g);
  ['getContent', 'setMimeType', 'whenCellNotEmpty', 'build', 'whenFormulaSatisfied', 'setRanges', 'setBackground', 'setBold'].forEach((n) => names.add(n));
  return names;
}

module.exports = { Spreadsheet, Sheet, services, knownMethods, CELL_LIMIT };
