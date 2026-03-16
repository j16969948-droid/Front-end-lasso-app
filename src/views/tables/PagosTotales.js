import React, { useMemo, useState } from 'react'
import {
    CFormInput,
    CRow,
    CCol,
    CButton,
    CCard,
    CCardBody,
    CBadge,
} from '@coreui/react'
import { usePagosTotales } from '../../core/hooks/usePagosTotales'
import { formatearMonto } from '../../utils/formatters'
import { LoadingState, ErrorState } from '../../components/TableFeedback'
import DataTable from '../../components/DataTable'

// ── Validador de comprobantes ─────────────────────────────────────────────────
const ValidadorComprobante = () => {
    const [url, setUrl] = useState('')
    const [resultado, setResultado] = useState(null)

    const handleValidar = () => {
        if (!url.trim()) return
        // Lógica de OCR / validación futura
        console.log('Validando:', url)
        setResultado(null) // placeholder
    }

    const handleLimpiar = () => {
        setUrl('')
        setResultado(null)
    }

    const campos = [
        { label: 'HORA', value: resultado?.hora ?? '-' },
        { label: 'REFERENCIA', value: resultado?.referencia ?? '-' },
        { label: 'MONTO', value: resultado?.monto ?? '-' },
        { label: 'MEDIO', value: resultado?.medio ?? '-' },
        { label: 'CLIENTE', value: resultado?.cliente ?? '-' },
        { label: 'NÚMERO', value: resultado?.numero ?? '-' },
        { label: 'FECHA', value: resultado?.fecha ?? '-' },
    ]

    return (
        <CCard className="premium-card mb-4">
            <CCardBody className="p-4">
                <div className="d-flex align-items-center gap-2 mb-1">
                    <h5 className="fw-bold mb-0">Validador de comprobantes</h5>
                    <CBadge color="success" className="px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                        Validación manual
                    </CBadge>
                </div>
                <p className="text-secondary small mb-3">
                    Pega la URL del comprobante para analizar OCR, revisar coincidencias y registrar el pago.
                </p>

                {/* Input + botones */}
                <div className="d-flex gap-2 mb-3">
                    <CFormInput
                        type="text"
                        placeholder="Pega aquí el enlace del comprobante..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="premium-input"
                    />
                    <CButton
                        color="success"
                        className="px-4 fw-semibold rounded-pill"
                        onClick={handleValidar}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        Validar
                    </CButton>
                    <CButton
                        color="secondary"
                        variant="ghost"
                        className="px-3 rounded-pill"
                        onClick={handleLimpiar}
                    >
                        Limpiar
                    </CButton>
                </div>

                {/* Campos de resultado */}
                <CRow className="g-2">
                    {campos.map((c) => (
                        <CCol key={c.label} xs={6} sm={4} md={3} lg="auto" className="flex-grow-1">
                            <div
                                className="rounded-3 p-3 text-center"
                                style={{ background: 'var(--cui-tertiary-bg, #f8f9fa)', minWidth: '90px' }}
                            >
                                <div className="text-secondary fw-semibold" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                                    {c.label}
                                </div>
                                <div className="fw-bold mt-1" style={{ fontSize: '0.85rem' }}>
                                    {c.value}
                                </div>
                            </div>
                        </CCol>
                    ))}
                </CRow>
            </CCardBody>
        </CCard>
    )
}

// ── Página principal ──────────────────────────────────────────────────────────
const PagosEmail = () => {
    const [fechaFiltro, setFechaFiltro] = useState(() => new Date().toISOString().split('T')[0])

    const filters = useMemo(() => {
        const f = {}
        if (fechaFiltro) f.fecha_pago = fechaFiltro
        return f
    }, [fechaFiltro])

    const { data: pagosTotales, isLoading, error } = usePagosTotales(filters)

    const data = useMemo(() => (Array.isArray(pagosTotales) ? pagosTotales : []), [pagosTotales])

    const totalMonto = useMemo(() =>
        data.reduce((acc, p) => acc + Number(p?.monto || 0), 0), [data])

    const searchFunction = useMemo(() => (pago, termino) => {
        return (
            String(pago?.id || '').toLowerCase().includes(termino) ||
            String(pago?.ordenante || '').toLowerCase().includes(termino) ||
            String(pago?.monto || '').toLowerCase().includes(termino) ||
            String(pago?.message_id || '').toLowerCase().includes(termino)
        )
    }, [])

    const columns = [
        { header: 'ID', key: 'id', className: 'fw-semibold' },
        { header: 'Ordenante', key: 'ordenante', renderFunc: (item) => <div className="fw-semibold">{item.ordenante || '-'}</div> },
        { header: 'Monto', key: 'monto', renderFunc: (item) => formatearMonto(item.monto) },
        {
            header: 'Fecha pago', key: 'fecha_pago', renderFunc: (item) => {
                const f = item.fecha_pago
                if (!f) return '-'
                const m = String(f).match(/(\d{4})[-/](\d{2})[-/](\d{2})/)
                return m ? `${m[1]}-${m[2]}-${m[3]}` : String(f).split(/[ T]/)[0]
            }
        },
        { header: 'Hora pago', key: 'hora_pago' },
        { header: 'Registrado en', key: 'creado_en', renderFunc: (item) => item.creado_en || '-' },
        { header: 'Message ID', key: 'message_id', className: 'text-break' },
    ]

    const filterControls = (
        <CRow className="g-2 align-items-end">
            <CCol md={5}>
                <CFormInput
                    type="date"
                    value={fechaFiltro}
                    onChange={(e) => setFechaFiltro(e.target.value)}
                />
            </CCol>
            <CCol md={7}>
                <div className="d-flex flex-wrap gap-1">
                    <CButton color="primary" variant="outline" size="sm"
                        onClick={() => setFechaFiltro(new Date().toISOString().split('T')[0])}>
                        Hoy
                    </CButton>
                    <CButton color="secondary" variant="outline" size="sm"
                        onClick={() => {
                            const ayer = new Date()
                            ayer.setDate(ayer.getDate() - 1)
                            setFechaFiltro(ayer.toISOString().split('T')[0])
                        }}>
                        Ayer
                    </CButton>
                    <CButton color="secondary" variant="outline" size="sm"
                        onClick={() => setFechaFiltro('')}>
                        Todos
                    </CButton>
                </div>
            </CCol>
        </CRow>
    )

    if (isLoading) return (
        <div className="fade-in-up">
            <ValidadorComprobante />
            <LoadingState message="Cargando pagos email..." />
        </div>
    )

    if (error) return (
        <div className="fade-in-up">
            <ValidadorComprobante />
            <ErrorState message="No se pudieron cargar los pagos" onRetry={() => window.location.reload()} />
        </div>
    )

    return (
        <div className="fade-in-up">
            <ValidadorComprobante />

            <DataTable
                title="Pagos Email"
                subtitle="Consulta y filtra los pagos recibidos por correo"
                data={data}
                columns={columns}
                searchFunction={searchFunction}
                filterControls={filterControls}
                onClear={() => setFechaFiltro(new Date().toISOString().split('T')[0])}
                headerBadges={
                    <CBadge color="success" className="px-3 py-2 rounded-pill">
                        Total: {formatearMonto(totalMonto)}
                    </CBadge>
                }
                searchPlaceholder="ID, ordenante, monto o message ID"
            />
        </div>
    )
}

export default PagosEmail