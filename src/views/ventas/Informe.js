import React, { useMemo, useState } from 'react'
import {
    CCard,
    CCardBody,
    CRow,
    CCol,
    CButton,
    CFormInput,
    CSpinner,
} from '@coreui/react'
import { usePagosTotales } from '../../core/hooks/usePagosTotales'
import { usePagosEntrantes } from '../../core/hooks/usePagosEntrantes'
import { formatearMonto } from '../../utils/formatters'

// ─── Helpers ────────────────────────────────────────────────────────────────

const hoy = () => new Date().toISOString().split('T')[0]

const StatCard = ({ label, value, sub, accent = false }) => (
    <CCard
        className="border-0 h-100"
        style={{
            background: accent
                ? 'linear-gradient(135deg, #0f172a 60%, #1e293b)'
                : 'var(--cui-card-bg, #fff)',
            borderRadius: '1rem',
            boxShadow: accent
                ? '0 8px 32px rgba(15,23,42,0.25)'
                : '0 2px 12px rgba(0,0,0,0.06)',
        }}
    >
        <CCardBody className="p-4">
            <p className="mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.08em', fontWeight: 600, color: accent ? 'rgba(255,255,255,0.55)' : 'var(--cui-secondary-color)', textTransform: 'uppercase' }}>
                {label}
            </p>
            <div className="fw-bold" style={{ fontSize: accent ? '1.9rem' : '1.7rem', color: accent ? '#fff' : 'var(--cui-body-color)', lineHeight: 1.1 }}>
                {value}
            </div>
            {sub && (
                <p className="mb-0 mt-1" style={{ fontSize: '0.75rem', color: accent ? 'rgba(255,255,255,0.45)' : 'var(--cui-secondary-color)' }}>
                    {sub}
                </p>
            )}
        </CCardBody>
    </CCard>
)

const MedioCard = ({ label, monto, pagos, accent = false }) => (
    <div
        className="rounded-4 p-3 h-100"
        style={{
            background: accent ? 'linear-gradient(135deg,#0f172a,#1e293b)' : 'var(--cui-tertiary-bg,#f8f9fa)',
            border: accent ? 'none' : '1px solid var(--cui-border-color)',
        }}
    >
        <p className="mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.08em', fontWeight: 700, color: accent ? 'rgba(255,255,255,0.5)' : 'var(--cui-secondary-color)', textTransform: 'uppercase' }}>
            {label}
        </p>
        <p className="fw-bold mb-0" style={{ fontSize: '1.25rem', color: accent ? '#fff' : 'var(--cui-body-color)' }}>
            ${formatearMonto(monto)}
        </p>
        <p className="mb-0 mt-1" style={{ fontSize: '0.7rem', color: accent ? 'rgba(255,255,255,0.4)' : 'var(--cui-secondary-color)' }}>
            Pagos: {pagos}
        </p>
    </div>
)

const SectionCard = ({ title, subtitle, children }) => (
    <CCard className="border-0 mb-4" style={{ borderRadius: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <CCardBody className="p-4">
            <h6 className="fw-bold mb-0">{title}</h6>
            <p className="text-secondary small mb-3" style={{ fontSize: '0.78rem' }}>{subtitle}</p>
            {children}
        </CCardBody>
    </CCard>
)

const TablePremium = ({ headers, rows, emptyMsg = 'Sin datos' }) => (
    <div className="table-responsive">
        <table className="table table-hover mb-0" style={{ fontSize: '0.82rem' }}>
            <thead>
                <tr style={{ background: 'linear-gradient(90deg,#0f172a,#1e3a5f)', color: '#fff' }}>
                    {headers.map((h, i) => (
                        <th key={i} className="py-2 px-3 fw-semibold" style={{ color: '#fff', border: 'none', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.length === 0
                    ? <tr><td colSpan={headers.length} className="text-center text-secondary py-4">{emptyMsg}</td></tr>
                    : rows.map((row, i) => (
                        <tr key={i} style={{ transition: 'background 0.15s' }}>
                            {row.map((cell, j) => (
                                <td key={j} className="py-2 px-3 align-middle">{cell}</td>
                            ))}
                        </tr>
                    ))}
            </tbody>
        </table>
    </div>
)

// ─── Página Informe 

const Informe = () => {
    const [desde, setDesde] = useState(hoy)
    const [hasta, setHasta] = useState(hoy)
    const [filtersActivos, setFiltersActivos] = useState({ desde: hoy(), hasta: hoy() })
    const [lastUpdated, setLastUpdated] = useState(() => new Date())

    const handleFiltrar = () => {
        setFiltersActivos({ desde, hasta })
        setLastUpdated(new Date())
    }

    const handleLimpiar = () => {
        const t = hoy()
        setDesde(t)
        setHasta(t)
        setFiltersActivos({ desde: t, hasta: t })
        setLastUpdated(new Date())
    }

    // ── Pagos Totales 
    const filtersEmail = useMemo(() => {
        const f = { solo_aprobados: 1 }
        if (filtersActivos.desde) f.fecha_desde = filtersActivos.desde
        if (filtersActivos.hasta) f.fecha_hasta = filtersActivos.hasta
        return f
    }, [filtersActivos])

    const { data: rawEmail, isLoading: loadingEmail } = usePagosTotales(filtersEmail)

    // ── Pagos Entrantes 
    const filtersEntrantes = useMemo(() => {
        const f = { statistics: 1 }
        if (filtersActivos.desde) f.fecha_desde = filtersActivos.desde
        if (filtersActivos.hasta) f.fecha_hasta = filtersActivos.hasta
        return f
    }, [filtersActivos])

    const { data: rawEntrantes, isLoading: loadingEntrantes } = usePagosEntrantes(filtersEntrantes)

    // ── Data normalizada 
    const pagosEmail = useMemo(() => (Array.isArray(rawEmail) ? rawEmail : []), [rawEmail])
    const pagosEntrantes = useMemo(() => {
        const d = rawEntrantes?.data || rawEntrantes
        return Array.isArray(d) ? d : []
    }, [rawEntrantes])

    // ── Stats globales 
    const totalAprobadoMonto = useMemo(() => pagosEmail.reduce((s, p) => s + Number(p?.monto || 0), 0), [pagosEmail])
    const totalAprobadoCount = pagosEmail.length

    const totalEntrantesMonto = useMemo(() => pagosEntrantes.reduce((s, p) => s + Number(p?.monto_pagado || 0), 0), [pagosEntrantes])
    const totalEntrantesCount = pagosEntrantes.length

    // ── Medios de pago (pagos entrantes Breb) 
    const MEDIOS = ['Bre-B', 'Nequi', 'Bancolombia', 'Daviplata']
    const mediosData = useMemo(() => {
        const map = {}
        MEDIOS.forEach(m => { map[m] = { monto: 0, count: 0 } })
        pagosEntrantes.forEach(p => {
            const m = Object.keys(map).find(k => p?.medio_pago?.toLowerCase().includes(k.toLowerCase()))
            if (m) { map[m].monto += Number(p.monto_pagado || 0); map[m].count++ }
            else if (p?.medio_pago) {
                if (!map[p.medio_pago]) map[p.medio_pago] = { monto: 0, count: 0 }
                map[p.medio_pago].monto += Number(p.monto_pagado || 0)
                map[p.medio_pago].count++
            }
        })
        return map
    }, [pagosEntrantes])

    // ── Resumen por día (pagos entrantes Breb) 
    const resumenDia = useMemo(() => {
        const map = {}
        pagosEntrantes.forEach(p => {
            const fecha = (p.fecha_comprobante || p.fecha || '').split(/[T ]/)[0]
            if (!fecha) return
            if (!map[fecha]) map[fecha] = { count: 0, monto: 0 }
            map[fecha].count++
            map[fecha].monto += Number(p.monto_pagado || 0)
        })
        return Object.entries(map).sort((a, b) => b[0].localeCompare(a[0]))
    }, [pagosEntrantes])

    // ── Detalle por medio
    const detalleMedio = useMemo(() => {
        const map = {}
        pagosEntrantes.forEach(p => {
            const key = p?.medio_pago || 'Desconocido'
            if (!map[key]) map[key] = { count: 0, monto_pagado: 0 }
            map[key].count++
            map[key].monto_pagado += Number(p.monto_pagado || 0)
        })
        return Object.entries(map).sort((a, b) => b[1].monto_pagado - a[1].monto_pagado)
    }, [pagosEntrantes])

    const isLoading = loadingEmail || loadingEntrantes

    return (
        <div className="fade-in-up px-1">
            {/* Header */}
            <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-2 p-4">
                <div>
                    <div className="d-flex align-items-center gap-3 mb-1">
                        <h4 className="fw-bold mb-0">Informe</h4>
                        <span className="px-2 py-1 rounded-pill fw-semibold" style={{ fontSize: '0.7rem', background: 'rgba(15,23,42,0.08)', color: 'var(--cui-body-color)' }}>
                            Solo aprobados
                        </span>
                    </div>
                    <p className="text-secondary small mb-0">Vista general de pagos aprobados y medios de pago</p>
                </div>
                <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-3" style={{ background: 'var(--cui-tertiary-bg,#f8f9fa)', fontSize: '0.75rem' }}>
                    {isLoading
                        ? <CSpinner size="sm" />
                        : <span className="fw-semibold text-secondary">Actualizado {lastUpdated.toLocaleTimeString('es-CO')}</span>
                    }
                </div>
            </div>

            {/* Stats superiores */}
            <CRow className="g-3 mb-4">
                <CCol xs={12} sm={4}>
                    <StatCard
                        label="Pagos aprobados"
                        value={isLoading ? '—' : totalAprobadoCount}
                        sub={`Monto: $${formatearMonto(totalAprobadoMonto)}`}
                    />
                </CCol>
                <CCol xs={12} sm={4}>
                    <StatCard
                        label="Pagos Breb detectados"
                        value={isLoading ? '—' : totalEntrantesCount}
                        sub={`Monto: $${formatearMonto(totalEntrantesMonto)}`}
                    />
                </CCol>
                <CCol xs={12} sm={4}>
                    <StatCard
                        accent
                        label="Total aprobado"
                        value={isLoading ? '—' : `$${formatearMonto(totalAprobadoMonto)}`}
                        sub={`Pagos: ${totalAprobadoCount}`}
                    />
                </CCol>
            </CRow>

            {/* Filtros de fecha */}
            <SectionCard title="" subtitle="">
                <CRow className="g-2 align-items-end">
                    <CCol xs={12} sm={4}>
                        <label className="form-label fw-semibold" style={{ fontSize: '0.75rem' }}>Desde</label>
                        <CFormInput type="date" value={desde} onChange={e => setDesde(e.target.value)} className="premium-input" />
                    </CCol>
                    <CCol xs={12} sm={4}>
                        <label className="form-label fw-semibold" style={{ fontSize: '0.75rem' }}>Hasta</label>
                        <CFormInput type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="premium-input" />
                    </CCol>
                    <CCol xs={12} sm={4} className="d-flex gap-2">
                        <CButton className="btn-premium btn-premium-primary flex-fill" onClick={handleFiltrar} disabled={isLoading}>
                            {isLoading ? <CSpinner size="sm" /> : 'Filtrar'}
                        </CButton>
                        <CButton className="btn-premium btn-premium-secondary flex-fill" onClick={handleLimpiar} disabled={isLoading}>
                            Limpiar
                        </CButton>
                    </CCol>
                </CRow>
            </SectionCard>

            {/* Medios de pago */}
            <SectionCard title="Medios de pago" subtitle="Resumen consolidado del rango seleccionado.">
                <CRow className="g-3">
                    {MEDIOS.map(m => (
                        <CCol key={m} xs={6} sm={3}>
                            <MedioCard
                                label={m}
                                monto={mediosData[m]?.monto || 0}
                                pagos={mediosData[m]?.count || 0}
                            />
                        </CCol>
                    ))}
                    <CCol xs={12} sm={12} className="mt-2">
                        <div className="d-flex justify-content-end">
                            <MedioCard
                                accent
                                label="Total"
                                monto={totalAprobadoMonto}
                                pagos={totalAprobadoCount}
                            />
                        </div>
                    </CCol>
                </CRow>
            </SectionCard>

            {/* Resumen por día */}
            <SectionCard title="Resumen por día" subtitle="Cantidad y monto de pagos aprobados por fecha.">
                {isLoading
                    ? <div className="text-center py-4"><CSpinner /></div>
                    : <TablePremium
                        headers={['Fecha', 'Total pagos', 'Monto']}
                        rows={resumenDia.map(([fecha, d]) => [
                            <span className="text-primary fw-semibold">{fecha}</span>,
                            <span className="text-warning fw-bold">{d.count}</span>,
                            <span className="text-primary fw-bold">${formatearMonto(d.monto)}</span>,
                        ])}
                        emptyMsg="Sin datos para el rango seleccionado"
                    />
                }
            </SectionCard>

            {/* Detalle por medio */}
            <SectionCard title="Detalle por medio de pago" subtitle="Distribución agrupada por tipo de medio.">
                {isLoading
                    ? <div className="text-center py-4"><CSpinner /></div>
                    : <TablePremium
                        headers={['Medio', 'Cantidad', 'Monto total']}
                        rows={detalleMedio.map(([medio, d]) => [
                            <span className="fw-semibold">{medio}</span>,
                            d.count,
                            <span className="fw-bold">${formatearMonto(d.monto_pagado)}</span>,
                        ])}
                        emptyMsg="Sin pagos registrados"
                    />
                }
            </SectionCard>
        </div>
    )
}

export default Informe
