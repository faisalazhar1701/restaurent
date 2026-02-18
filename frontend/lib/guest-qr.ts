import type { GuestQrContext, GuestQrSource } from '@/lib/session'

export type ParsedQrParams = {
  source: GuestQrSource
  tableId?: string
  zoneId?: string
  sessionId?: string
}

/**
 * Parse and validate guest entry URL params.
 * source=entry -> no table. source=table -> requires tableId and zoneId.
 */
export function parseGuestQrParams(searchParams: URLSearchParams): ParsedQrParams | null {
  const source = searchParams.get('source')
  if (source === 'entry') {
    return {
      source: 'entry',
      sessionId: searchParams.get('sessionId') ?? undefined,
    }
  }
  if (source === 'table') {
    const tableId = searchParams.get('tableId') ?? undefined
    const zoneId = searchParams.get('zoneId') ?? undefined
    if (tableId != null && tableId !== '' && zoneId != null && zoneId !== '') {
      const num = Number(tableId)
      if (Number.isInteger(num) && num >= 1) {
        return {
          source: 'table',
          tableId,
          zoneId,
          sessionId: searchParams.get('sessionId') ?? undefined,
        }
      }
    }
    return null
  }
  return { source: 'entry' }
}

/**
 * Build a valid GuestQrContext from parsed params.
 * For source=table, tableId and zoneId are required; otherwise treated as entry.
 */
export function paramsToQrContext(params: ParsedQrParams | null): GuestQrContext {
  if (!params) return { source: 'entry' }
  if (params.source === 'table' && params.tableId && params.zoneId) {
    return { source: 'table', tableId: params.tableId, zoneId: params.zoneId }
  }
  return { source: 'entry' }
}
