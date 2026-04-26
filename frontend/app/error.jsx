'use client'
import { useEffect } from 'react'

export default function Error({ error, reset }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div style={{ background: '#040608', color: '#00ffe0', fontFamily: 'monospace', padding: '40px', minHeight: '100vh' }}>
      <h2>FANZOS MASTER BRAIN v5.0</h2>
      <p style={{ color: '#ff3b5c', marginTop: 16 }}>Error: {error?.message}</p>
      <p style={{ color: '#ff3b5c', fontSize: 12, marginTop: 8 }}>{error?.stack?.slice(0, 300)}</p>
      <button onClick={reset} style={{ background: '#00ffe022', border: '1px solid #00ffe0', color: '#00ffe0', padding: '10px 20px', cursor: 'pointer', marginTop: '20px' }}>
        RETRY
      </button>
    </div>
  )
}
