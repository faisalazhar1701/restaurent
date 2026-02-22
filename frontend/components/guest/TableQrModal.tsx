'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

type TableQrModalProps = {
  tableNumber: number
  zone: string | null
  onClose: () => void
}

export function TableQrModal({ tableNumber, zone, onClose }: TableQrModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  const zoneId = zone && zone.trim() ? zone.trim() : 'main'
  const qrUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/guest?source=table&tableId=${tableNumber}&zoneId=${encodeURIComponent(zoneId)}`
      : ''

  useEffect(() => {
    if (!qrUrl) return
    QRCode.toDataURL(qrUrl, { width: 256, margin: 2 })
      .then(setDataUrl)
      .catch(() => setDataUrl(null))
  }, [qrUrl])

  const handleDownload = () => {
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `table-qr-${zoneId}-${tableNumber}.png`
    a.click()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
    >
      <div className="max-h-[90vh] w-full max-w-sm overflow-auto rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="qr-modal-title" className="text-lg font-semibold text-venue-foreground">
            Table {zone ? `${zone}-` : ''}{tableNumber} QR
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-venue-muted hover:bg-venue-surface hover:text-venue-foreground"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="flex justify-center bg-white p-4">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt={`QR for Table ${zone ? `${zone}-` : ''}${tableNumber}`} width={256} height={256} />
          ) : (
            <canvas ref={canvasRef} width={256} height={256} className="bg-white" />
          )}
        </div>
        <p className="mb-4 break-all text-center text-xs text-venue-muted">{qrUrl}</p>
        <div className="flex gap-3">
          <button type="button" onClick={handleDownload} disabled={!dataUrl} className="btn-primary flex-1 disabled:opacity-50">
            Download QR
          </button>
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
