import ExcelJS from 'exceljs'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export type ExportColumn = {
  key: string
  header: string
  width?: number
}

export type ExcelExportOptions = {
  /** Column key to sum for a Grand Total footer row (e.g. totalAmount) */
  grandTotalKey?: string
  grandTotalLabel?: string
  /** Report title line 1 (default: GBB Fashion Online Orders) */
  brandTitle?: string
  /** Report title line 2 (default: www.gbbfashion.com) */
  brandSubtitle?: string
  /** Optional logo URL override */
  logoUrl?: string
}

const BRAND_TITLE = 'GBB Fashion Online Orders'
const BRAND_SUBTITLE = 'www.gbbfashion.com'
const DEFAULT_LOGO_CANDIDATES = ['/uploads/logo.png', '/logo.svg', '/logo.png']

function stamp() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function blobToBase64(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer()
  let binary = ''
  const bytes = new Uint8Array(buffer)
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

async function resolveLogoUrl(explicit?: string): Promise<string | null> {
  if (explicit?.trim()) return explicit.trim()
  try {
    const res = await fetch('/api/settings', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      if (typeof data?.logoUrl === 'string' && data.logoUrl.trim()) {
        return data.logoUrl.trim()
      }
    }
  } catch {
    // fall through
  }
  return DEFAULT_LOGO_CANDIDATES[0]
}

type LogoPayload = {
  base64: string
  extension: 'png' | 'jpeg' | 'gif'
  dataUrl: string
}

async function loadLogo(explicit?: string): Promise<LogoPayload | null> {
  const candidates = [
    ...(explicit ? [explicit] : []),
    ...(await resolveLogoUrl(explicit).then((u) => (u ? [u] : []))),
    ...DEFAULT_LOGO_CANDIDATES,
  ]
  const tried = new Set<string>()

  for (const url of candidates) {
    const clean = url.trim()
    if (!clean || tried.has(clean)) continue
    tried.add(clean)
    try {
      const res = await fetch(clean, { cache: 'no-store' })
      if (!res.ok) continue
      const blob = await res.blob()
      if (!blob.size) continue
      const mime = blob.type || 'image/png'
      // ExcelJS image embedding works best with raster formats
      if (mime.includes('svg')) continue
      const extension: LogoPayload['extension'] = mime.includes('jpeg') || mime.includes('jpg')
        ? 'jpeg'
        : mime.includes('gif')
          ? 'gif'
          : 'png'
      const base64 = await blobToBase64(blob)
      return {
        base64,
        extension,
        dataUrl: `data:${mime};base64,${base64}`,
      }
    } catch {
      // try next
    }
  }
  return null
}

function brandCopy(options: ExcelExportOptions) {
  return {
    title: options.brandTitle || BRAND_TITLE,
    subtitle: options.brandSubtitle || BRAND_SUBTITLE,
  }
}

/** Download an .xlsx workbook with brand header, logo, bold columns, optional grand total. */
export async function exportToExcel(
  filenamePrefix: string,
  sheetName: string,
  columns: ExportColumn[],
  rows: Record<string, string | number | null | undefined>[],
  options: ExcelExportOptions = {}
) {
  if (!rows.length) {
    throw new Error('Nothing to export')
  }

  const { title, subtitle } = brandCopy(options)
  const logo = await loadLogo(options.logoUrl)
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'GBB Fashion'
  workbook.created = new Date()

  const sheet = workbook.addWorksheet(sheetName.slice(0, 31), {
    views: [{ showGridLines: false }],
  })

  const colCount = Math.max(columns.length, 4)
  const titleCol = logo ? 2 : 1

  // Brand header block (rows 1–2), table starts at row 4
  sheet.mergeCells(1, titleCol, 1, colCount)
  sheet.mergeCells(2, titleCol, 2, colCount)

  const titleCell = sheet.getCell(1, titleCol)
  titleCell.value = title
  titleCell.font = { bold: true, size: 16, color: { argb: 'FF000000' }, name: 'Calibri' }
  titleCell.alignment = { vertical: 'middle', horizontal: 'left' }

  const subtitleCell = sheet.getCell(2, titleCol)
  subtitleCell.value = subtitle
  subtitleCell.font = { bold: true, size: 11, color: { argb: 'FF334155' }, name: 'Calibri' }
  subtitleCell.alignment = { vertical: 'middle', horizontal: 'left' }

  sheet.getRow(1).height = 26
  sheet.getRow(2).height = 20
  sheet.getRow(3).height = 10

  if (logo) {
    const imageId = workbook.addImage({
      base64: logo.base64,
      extension: logo.extension,
    })
    sheet.addImage(imageId, {
      tl: { col: 0, row: 0 },
      ext: { width: 72, height: 48 },
      editAs: 'oneCell',
    })
    sheet.getColumn(1).width = 14
  }

  columns.forEach((col, index) => {
    sheet.getColumn(index + 1).width = Math.max(col.width ?? 12, col.header.length + 2)
  })

  const thinBorder: Partial<ExcelJS.Borders> = {
    top: { style: 'thin', color: { argb: 'FF000000' } },
    left: { style: 'thin', color: { argb: 'FF000000' } },
    bottom: { style: 'thin', color: { argb: 'FF000000' } },
    right: { style: 'thin', color: { argb: 'FF000000' } },
  }

  const headerRowIndex = 4
  const headerRow = sheet.getRow(headerRowIndex)
  columns.forEach((col, index) => {
    const cell = headerRow.getCell(index + 1)
    cell.value = col.header
    cell.font = { bold: true, size: 11, color: { argb: 'FF000000' }, name: 'Calibri' }
    cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
    cell.border = thinBorder
  })
  headerRow.height = 22

  rows.forEach((row, rowIndex) => {
    const excelRow = sheet.getRow(headerRowIndex + 1 + rowIndex)
    columns.forEach((col, colIndex) => {
      const cell = excelRow.getCell(colIndex + 1)
      const value = row[col.key]
      cell.value = value == null ? '' : value
      cell.font = {
        size: 10,
        color: { argb: 'FF0F172A' },
        name: 'Calibri',
      }
      cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true }
      cell.border = thinBorder
    })
  })

  if (options.grandTotalKey) {
    const grandTotal = rows.reduce((sum, row) => {
      const raw = row[options.grandTotalKey!]
      const n = typeof raw === 'number' ? raw : Number(raw)
      return sum + (Number.isFinite(n) ? n : 0)
    }, 0)
    const totalColIndex = columns.findIndex((c) => c.key === options.grandTotalKey)
    const footerRowIndex = headerRowIndex + 1 + rows.length
    const footerRow = sheet.getRow(footerRowIndex)

    columns.forEach((_, colIndex) => {
      const cell = footerRow.getCell(colIndex + 1)
      if (colIndex === 0) {
        cell.value = options.grandTotalLabel || 'Grand Total'
      } else if (colIndex === totalColIndex) {
        cell.value = Math.round(grandTotal)
      } else {
        cell.value = ''
      }
      cell.border = thinBorder
      cell.alignment = { vertical: 'middle', horizontal: 'left' }
      if (colIndex === 0 || colIndex === totalColIndex) {
        cell.font = { bold: true, size: 11, color: { argb: 'FF000000' }, name: 'Calibri' }
      } else {
        cell.font = { size: 10, color: { argb: 'FF0F172A' }, name: 'Calibri' }
      }
    })
    footerRow.height = 22
  }

  const buffer = await workbook.xlsx.writeBuffer()
  downloadBlob(
    new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    `${filenamePrefix}-${stamp()}.xlsx`
  )
}

/** Download a PDF table with brand header + logo, optional grand total. */
export async function exportToPdf(
  title: string,
  filenamePrefix: string,
  columns: ExportColumn[],
  rows: Record<string, string | number | null | undefined>[],
  options: ExcelExportOptions = {}
) {
  if (!rows.length) {
    throw new Error('Nothing to export')
  }

  const { title: brandTitle, subtitle } = brandCopy(options)
  const logo = await loadLogo(options.logoUrl)

  const doc = new jsPDF({
    orientation: columns.length > 6 ? 'landscape' : 'portrait',
    unit: 'pt',
    format: 'a4',
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  let cursorY = 36

  if (logo) {
    try {
      doc.addImage(logo.dataUrl, logo.extension === 'jpeg' ? 'JPEG' : 'PNG', 28, 24, 52, 36)
    } catch {
      // ignore logo draw failures
    }
  }

  const textX = logo ? 92 : 28
  doc.setTextColor(0, 0, 0)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(brandTitle, textX, cursorY)
  cursorY += 18
  doc.setFontSize(11)
  doc.setTextColor(51, 65, 85)
  doc.text(subtitle, textX, cursorY)
  cursorY += 16
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(100, 116, 139)
  doc.text(`${title} · Exported ${new Date().toLocaleString()} · ${rows.length} row(s)`, textX, cursorY)

  // Divider under brand header
  cursorY += 12
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.8)
  doc.line(28, cursorY, pageWidth - 28, cursorY)

  const body = rows.map((row) =>
    columns.map((col) => {
      const value = row[col.key]
      return value == null ? '' : String(value)
    })
  )

  if (options.grandTotalKey) {
    const grandTotal = rows.reduce((sum, row) => {
      const raw = row[options.grandTotalKey!]
      const n = typeof raw === 'number' ? raw : Number(raw)
      return sum + (Number.isFinite(n) ? n : 0)
    }, 0)
    const totalColIndex = columns.findIndex((c) => c.key === options.grandTotalKey)
    const footer = columns.map((_, index) => {
      if (index === 0) return options.grandTotalLabel || 'Grand Total'
      if (index === totalColIndex) return String(Math.round(grandTotal))
      return ''
    })
    body.push(footer)
  }

  autoTable(doc, {
    startY: cursorY + 14,
    head: [columns.map((c) => c.header)],
    body,
    styles: {
      fontSize: 8,
      cellPadding: 4,
      overflow: 'linebreak',
      valign: 'middle',
      textColor: [0, 0, 0],
    },
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      lineWidth: 0.3,
      lineColor: [200, 200, 200],
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    didParseCell: (data) => {
      if (
        options.grandTotalKey &&
        data.section === 'body' &&
        data.row.index === body.length - 1
      ) {
        data.cell.styles.fontStyle = 'bold'
        data.cell.styles.textColor = [0, 0, 0]
      }
    },
    margin: { left: 28, right: 28 },
  })

  doc.save(`${filenamePrefix}-${stamp()}.pdf`)
}
