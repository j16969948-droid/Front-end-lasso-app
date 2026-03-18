import React, { useMemo, useState } from 'react'
import {
    CFormInput,
    CRow,
    CCol,
    CButton,
    CFormLabel,
    CSpinner,
    CAlert,
} from '@coreui/react'
import { usePagosTotales } from '../../core/hooks/usePagosTotales'
import { useValidarComprobante, useVincularPago } from '../../core/hooks/useValidarComprobante'
import { formatearMonto } from '../../utils/formatters'
import { LoadingState, ErrorState } from '../../components/TableFeedback'
import DataTable from '../../components/DataTable'

// ── Validador de comprobantes 
const ValidadorComprobante = () => {
    const [url, setUrl] = useState('')
    const { mutate: validar, data: resultado, isPending, error, reset } = useValidarComprobante()
    const { mutate: vincular, isPending: isVinculando, isSuccess: isVinculado, data: vincularData } = useVincularPago()

    const handleValidar = () => {
        if (!url.trim()) return
        reset()
        validar(url.trim())
    }

    const handleLimpiar = () => {
        setUrl('')
        reset()
    }

    const handleVincular = () => {
        if (!pagoExistente?.id || !emailMatch?.id) return
        vincular({
            pago_entrante_id: pagoExistente.id,
            pago_email_id: emailMatch.id
        })
    }

    const ocr = resultado?.datos_ocr || null
    const pagoExistente = resultado?.pago_existente || null
    const emailMatch = resultado?.pago_email || null

    const campos = [
        { label: 'HORA OCR', value: ocr?.hora_comprobante },
        { label: 'MONTO OCR', value: ocr ? formatearMonto(ocr.monto_pagado) : null },
        { label: 'REFERENCIA', value: ocr?.referencia_pago },
        { label: 'FECHA OCR', value: ocr?.fecha_comprobante },
    ]

    return (
        <div className="premium-card p-4 mb-4 border-0 shadow-lg fade-up">
            <div className="d-flex align-items-center gap-2 mb-1">
                <h5 className="section-title h5 mb-0">Validador</h5>
                <span className="badge-lasso badge-lasso-success small">OCR</span>
            </div>
            <p className="section-subtitle mb-4">
                Cruce automático de comprobantes con registros del sistema.
            </p>

            <div className="d-flex gap-3 mb-4">
                <CFormInput
                    type="text"
                    placeholder="Pega aquí el enlace del comprobante (URL)..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleValidar()}
                    className="lasso-input flex-grow-1"
                    disabled={isPending || isVinculando}
                />
                <CButton
                    onClick={handleValidar}
                    disabled={isPending || isVinculando || !url.trim()}
                    className="btn-lasso btn-lasso-primary px-4"
                >
                    {isPending ? <><CSpinner size="sm" className="me-2" /> Analizando...</> : 'Procesar'}
                </CButton>
                <CButton
                    onClick={handleLimpiar}
                    disabled={isPending || isVinculando}
                    className="btn-lasso btn-lasso-soft-secondary"
                >
                    Limpiar
                </CButton>
            </div>

            {error && (
                <CAlert color="danger" className="border-0 rounded-3 py-2 small mb-3">
                    <CIcon icon={cilCheckCircle} className="me-2" />
                    {error?.response?.data?.message || 'Error al analizar el comprobante.'}
                </CAlert>
            )}

            {isVinculado && (
                <CAlert color="success" className="border-0 rounded-3 py-2 small mb-3">
                    <CIcon icon={cilCheckCircle} className="me-2" />
                    {vincularData?.mensaje || 'Pago vinculado y aprobado correctamente.'}
                </CAlert>
            )}

            {ocr && (
                <CRow className="g-3">
                    <CCol md={4}>
                        <div className="p-3 bg-light rounded-4 border border-light-subtle h-100">
                            <div className="lasso-label mb-3" style={{ fontSize: '0.65rem' }}>📄 EXTRACCIÓN OCR</div>
                            {campos.map((c, i) => (
                                <div key={i} className="mb-2 d-flex justify-content-between border-bottom border-white pb-1">
                                    <span className="text-muted x-small">{c.label}</span>
                                    <span className="fw-bold small">{c.value || '-'}</span>
                                </div>
                            ))}
                        </div>
                    </CCol>

                    <CCol md={4}>
                        <div className={`p-3 rounded-4 border h-100 ${pagoExistente ? 'bg-success-subtle border-success' : 'bg-danger-subtle border-danger'}`} style={{ opacity: pagoExistente ? 1 : 0.7 }}>
                            <div className="lasso-label mb-3" style={{ fontSize: '0.65rem' }}>{pagoExistente ? '✅ REGISTRO ENCONTRADO' : '❌ SIN REGISTRO'}</div>
                            {pagoExistente ? (
                                <>
                                    <div className="mb-2 d-flex justify-content-between border-bottom border-white pb-1">
                                        <span className="text-muted x-small">ID PAGO</span>
                                        <span className="fw-bold small">#{pagoExistente.id}</span>
                                    </div>
                                    <div className="mb-2 d-flex justify-content-between border-bottom border-white pb-1">
                                        <span className="text-muted x-small">CLIENTE</span>
                                        <span className="fw-bold small">{pagoExistente.user_id || '-'}</span>
                                    </div>
                                    <span className={`badge-lasso badge-lasso-${pagoExistente.estado === 'aprobado' ? 'success' : 'warning'} mt-2`}>
                                        {String(pagoExistente.estado).toUpperCase()}
                                    </span>
                                </>
                            ) : (
                                <div className="text-muted small italic">No se halló el reporte del cliente.</div>
                            )}
                        </div>
                    </CCol>

                    <CCol md={4}>
                        <div className={`p-3 rounded-4 border h-100 ${emailMatch ? 'bg-info-subtle border-info' : 'bg-warning-subtle border-warning'}`} style={{ opacity: emailMatch ? 1 : 0.7 }}>
                            <div className="lasso-label mb-3" style={{ fontSize: '0.65rem' }}>{emailMatch ? '📩 CORREO DE BANCO' : '❓ SIN CORREO'}</div>
                            {emailMatch ? (
                                <>
                                    <div className="mb-2 d-flex justify-content-between border-bottom border-white pb-1">
                                        <span className="text-muted x-small">MONTO</span>
                                        <span className="fw-bold small">{formatearMonto(emailMatch.monto)}</span>
                                    </div>
                                    <div className="mb-2 d-flex justify-content-between border-bottom border-white pb-1">
                                        <span className="text-muted x-small">HORA</span>
                                        <span className="fw-bold small">{emailMatch.hora_pago}</span>
                                    </div>
                                    {pagoExistente && !pagoExistente.pago_email_id && (
                                        <CButton
                                            onClick={handleVincular}
                                            disabled={isVinculando || isVinculado}
                                            className="btn-lasso btn-lasso-primary w-100 mt-2 py-1 shadow-sm"
                                        >
                                            {isVinculando ? <CSpinner size="sm" /> : 'Vincular y Aprobar'}
                                        </CButton>
                                    )}
                                </>
                            ) : (
                                <div className="text-muted small italic">Sin coincidencia de email.</div>
                            )}
                        </div>
                    </CCol>
                </CRow>
            )}
        </div>
    )
}

// ── Página principal 
const PagosEmail = () => {
    const [fechaFiltro, setFechaFiltro] = useState(() => new Date().toISOString().split('T')[0])

    const filters = useMemo(() => {
        const f = {}
        if (fechaFiltro) f.fecha_pago = fechaFiltro
        return f
    }, [fechaFiltro])

    const { data: pagosTotales, isLoading, error } = usePagosTotales(filters)

    const data = useMemo(() => (Array.isArray(pagosTotales) ? pagosTotales : []), [pagosTotales])

    const searchFunction = useMemo(() => (pago, termino) => {
        const t = (termino || '').toLowerCase()
        return (
            String(pago?.id || '').toLowerCase().includes(t) ||
            String(pago?.ordenante || '').toLowerCase().includes(t) ||
            String(pago?.monto || '').toLowerCase().includes(t) ||
            String(pago?.user_id || '').toLowerCase().includes(t)
        )
    }, [])

    const columns = [
        { header: 'ID', key: 'id', renderFunc: (p) => <span className="text-muted fw-bold">#{p.id}</span> },
        {
            header: 'Ordenante / Referencia', key: 'ordenante', renderFunc: (p) => (
                <div>
                    <div className="fw-bold">{p.ordenante || '-'}</div>
                    <div className="text-muted x-small text-truncate" style={{ maxWidth: '200px' }}>{p.referencia_pago}</div>
                </div>
            )
        },
        { header: 'Monto Recibido', key: 'monto', renderFunc: (p) => <span className="fw-bold text-success">{formatearMonto(p.monto)}</span> },
        {
            header: 'Fecha / Hora',
            key: 'fecha_pago',
            renderFunc: (p) => (
                <div>
                    <div className="fw-medium small">{String(p.fecha_pago).split(/[ T]/)[0]}</div>
                    <div className="text-muted x-small">{p.hora_pago}</div>
                </div>
            )
        },
        {
            header: 'Vínculo Usuario',
            key: 'user_id',
            renderFunc: (p) => p.user_id
                ? <span className="badge-lasso badge-lasso-primary">USUARIO #{p.user_id}</span>
                : <span className="badge-lasso badge-lasso-warning small opacity-75">SIN VINCULAR</span>
        },
    ]

    const filterControls = (
        <CRow className="g-3 align-items-end">
            <CCol md={6}>
                <CFormLabel className="lasso-label">Fecha de Notificación</CFormLabel>
                <CFormInput type="date" value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} className="lasso-input" />
            </CCol>
            <CCol md={6}>
                <div className="d-flex gap-2">
                    <CButton onClick={() => setFechaFiltro(new Date().toISOString().split('T')[0])} className="btn-lasso btn-lasso-soft-primary flex-grow-1">Hoy</CButton>
                    <CButton onClick={() => setFechaFiltro('')} className="btn-lasso btn-lasso-soft-secondary flex-grow-1">Todos</CButton>
                </div>
            </CCol>
        </CRow>
    )

    if (isLoading) return (
        <div className="fade-up">
            <ValidadorComprobante />
            <LoadingState message="Cargando reportes bancarios..." />
        </div>
    )

    if (error) return (
        <div className="fade-up">
            <ValidadorComprobante />
            <ErrorState message="No se pudieron cargar los registros bancarios" onRetry={() => window.location.reload()} />
        </div>
    )

    return (
        <div className="fade-up">
            <ValidadorComprobante />

            <DataTable
                title="Pagos bre-b"
                subtitle="Registro de pagos recibidos por correo"
                data={data}
                columns={columns}
                searchFunction={searchFunction}
                filterControls={filterControls}
                onClear={() => setFechaFiltro(new Date().toISOString().split('T')[0])}
                searchPlaceholder="Buscar por ordenante, monto o ID..."
                itemsPerPage={50}
            />
        </div>
    )
}

export default PagosEmail