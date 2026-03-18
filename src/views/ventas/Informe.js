import React, { useMemo, useState } from 'react'
import {
    CCard,
    CCardBody,
    CRow,
    CCol,
    CButton,
    CFormInput,
    CSpinner,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCalendar, cilFilter, cilSync, cilCheckCircle, cilLayers, cilChartLine } from '@coreui/icons'
import { usePagosTotales } from '../../core/hooks/usePagosTotales'
import { usePagosEntrantes } from '../../core/hooks/usePagosEntrantes'
import { formatearMonto } from '../../utils/formatters'

// ─── Helpers ────────────────────────────────────────────────────────────────

const hoy = () => new Date().toISOString().split('T')[0]

const StatCard = ({ label, value, sub, accent = false, icon }) => (
    <div className={`premium-card p-4 h-100 border-0 shadow-sm position-relative overflow-hidden ${accent ? 'text-white' : ''}`}
        style={{
            background: accent ? 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)' : 'var(--lasso-card-bg)',
            backdropFilter: 'blur(10px)'
        }}>
        <div className="position-relative z-1">
            <div className={`text-uppercase fw-bold mb-1 opacity-75 ${accent ? '' : 'text-muted'}`} style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
                {label}
            </div>
            <h2 className={`fw-bold mb-1 ${!accent && label.toLowerCase().includes('total') ? 'text-success' : ''}`}>{value}</h2>
            {sub && <div className={`small opacity-75 ${accent ? '' : 'text-muted'}`}>{sub}</div>}
        </div>
        {icon && <CIcon icon={icon} size="xs" className="position-absolute opacity-10" style={{ right: '20px', bottom: '20px', transform: 'scale(2.5)' }} />}
    </div>
)

const MedioCard = ({ label, monto, pagos, accent = false }) => (
    <div className={`premium-card p-3 h-100 border-0 ${accent ? 'text-white shadow-sm' : 'shadow-none'}`}
        style={{
            background: accent ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' : 'var(--lasso-card-bg)',
            transition: 'transform 0.2s'
        }}>
        <div className="text-uppercase fw-bold mb-2 opacity-75 text-muted" style={{ fontSize: '0.65rem', letterSpacing: '0.1em' }}>
            {label}
        </div>
        <div className="fw-bold mb-1 text-success" style={{ fontSize: '1.2rem' }}>
            ${formatearMonto(monto)}
        </div>
        <div className="small opacity-50 fw-semibold text-muted">
            {pagos} {pagos === 1 ? 'Pago' : 'Pagos'}
        </div>
    </div>
)

const SectionCard = ({ title, subtitle, children, icon }) => (
    <CCard className="premium-card mb-4 border-0 shadow-sm">
        <CCardBody className="p-4 p-md-5">
            <div className="d-flex align-items-center gap-3 mb-4">
                {icon && <div className="p-2 bg-primary bg-opacity-10 rounded-3"><CIcon icon={icon} className="text-primary" /></div>}
                <div>
                    <h5 className="fw-bold mb-1">{title}</h5>
                    {subtitle && <p className="text-muted small mb-0">{subtitle}</p>}
                </div>
            </div>
            {children}
        </CCardBody>
    </CCard>
)

const TableLasso = ({ headers, rows, emptyMsg = 'Sin datos' }) => (
    <div className="table-lasso-container">
        <CTable align="middle" className="mb-0 table-lasso" responsive hover>
            <CTableHead>
                <CTableRow>
                    {headers.map((h, i) => (
                        <CTableHeaderCell key={i} className="text-uppercase small pt-3 pb-3" style={{ letterSpacing: '0.05em' }}>{h}</CTableHeaderCell>
                    ))}
                </CTableRow>
            </CTableHead>
            <CTableBody>
                {rows.length === 0
                    ? <CTableRow><CTableDataCell colSpan={headers.length} className="text-center text-muted py-5">{emptyMsg}</CTableDataCell></CTableRow>
                    : rows.map((row, i) => (
                        <CTableRow key={i}>
                            {row.map((cell, j) => (
                                <CTableDataCell key={j} className="py-3">{cell}</CTableDataCell>
                            ))}
                        </CTableRow>
                    ))}
            </CTableBody>
        </CTable>
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

    // ── Medios de pago 
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

    // ── Resumen por día 
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
        <div className="fade-up">|
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-4 p-4">
                <div>
                    <div className="d-flex align-items-center gap-3 mb-2">
                        <h1 className="section-title mb-0">Informe Financiero</h1>
                        <span className="badge-lasso badge-lasso-soft-secondary text-uppercase small" style={{ letterSpacing: '0.05em' }}>
                            Aprobados
                        </span>
                    </div>
                    <p className="section-subtitle mb-0">Análisis detallado de recaudación y distribución de medios de pago.</p>
                </div>
                <div className="d-flex align-items-center gap-2 px-3 py-2 bg-body-tertiary rounded-pill shadow-sm small border">
                    {isLoading
                        ? <><CSpinner size="sm" className="text-primary me-1" /> Actualizando...</>
                        : <><CIcon icon={cilSync} size="sm" className="text-muted" /> Sincronizado: {lastUpdated.toLocaleTimeString('es-CO')}</>
                    }
                </div>
            </div>

            {/* Stats superiores */}
            <CRow className="g-4 mb-5">
                <CCol xs={12} md={4}>
                    <StatCard
                        label="Pagos Aprobados"
                        value={isLoading ? '—' : totalAprobadoCount}
                        sub={`Recaudación: $${formatearMonto(totalAprobadoMonto)}`}
                        icon={cilCheckCircle}
                    />
                </CCol>
                <CCol xs={12} md={4}>
                    <StatCard
                        label="Pagos Bre-B"
                        value={isLoading ? '—' : totalEntrantesCount}
                        sub={`Detectados: $${formatearMonto(totalEntrantesMonto)}`}
                        icon={cilLayers}
                    />
                </CCol>
                <CCol xs={12} md={4}>
                    <StatCard
                        accent
                        label="Total Recaudado"
                        value={isLoading ? '—' : `$${formatearMonto(totalAprobadoMonto)}`}
                        sub={`${totalAprobadoCount} transacciones exitosas`}
                        icon={cilChartLine}
                    />
                </CCol>
            </CRow>

            {/* Filtros de fecha */}
            <CCard className="premium-card mb-5 border-0 shadow-sm bg-body-tertiary">
                <CCardBody className="p-4">
                    <CRow className="g-3 align-items-end">
                        <CCol xs={12} sm={4}>
                            <label className="fw-bold small text-uppercase text-muted mb-2 ps-1">Fecha Inicial</label>
                            <CFormInput type="date" value={desde} onChange={e => setDesde(e.target.value)} className="lasso-input" />
                        </CCol>
                        <CCol xs={12} sm={4}>
                            <label className="fw-bold small text-uppercase text-muted mb-2 ps-1">Fecha Final</label>
                            <CFormInput type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="lasso-input" />
                        </CCol>
                        <CCol xs={12} sm={4} className="d-flex gap-2">
                            <CButton className="btn-lasso btn-lasso-primary flex-fill py-2" onClick={handleFiltrar} disabled={isLoading}>
                                <CIcon icon={cilFilter} className="me-2" /> Filtrar
                            </CButton>
                            <CButton className="btn-lasso btn-lasso-soft-secondary flex-fill py-2" onClick={handleLimpiar} disabled={isLoading}>
                                Limpiar
                            </CButton>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {/* Medios de pago */}
            <SectionCard title="Distribución por Medios" subtitle="Consolidado por plataforma de pago en el rango seleccionado." icon={cilLayers}>
                <CRow className="g-3">
                    {MEDIOS.map(m => (
                        <CCol key={m} xs={6} md={3}>
                            <MedioCard
                                label={m}
                                monto={mediosData[m]?.monto || 0}
                                pagos={mediosData[m]?.count || 0}
                            />
                        </CCol>
                    ))}
                </CRow>
            </SectionCard>

            <CRow className="g-4">
                <CCol lg={6}>
                    <SectionCard title="Histórico Diario" subtitle="Tendencia de recaudación agrupada por día." icon={cilCalendar}>
                        {isLoading
                            ? <div className="text-center py-5"><CSpinner variant="grow" color="primary" /></div>
                            : <TableLasso
                                headers={['Fecha', 'Ventas', 'Monto']}
                                rows={resumenDia.map(([fecha, d]) => [
                                    <span className="fw-bold">{fecha}</span>,
                                    <span className="badge-lasso badge-lasso-soft-warning">{d.count}</span>,
                                    <span className="fw-bold text-success">${formatearMonto(d.monto)}</span>,
                                ])}
                                emptyMsg="Sin registros en estas fechas"
                            />
                        }
                    </SectionCard>
                </CCol>

                <CCol lg={6}>
                    <SectionCard title="Resumen General" subtitle="Desglose total por cada medio detectado." icon={cilChartLine}>
                        {isLoading
                            ? <div className="text-center py-5"><CSpinner variant="grow" color="primary" /></div>
                            : <TableLasso
                                headers={['Medio', 'Cantidad', 'Total Recaudado']}
                                rows={detalleMedio.map(([medio, d]) => [
                                    <span className="fw-semibold">{medio}</span>,
                                    <span className="fw-medium">{d.count}</span>,
                                    <span className="fw-bold text-success">${formatearMonto(d.monto_pagado)}</span>,
                                ])}
                                emptyMsg="No hay pagos que mostrar"
                            />
                        }
                    </SectionCard>
                </CCol>
            </CRow>
        </div>
    )
}

export default Informe
