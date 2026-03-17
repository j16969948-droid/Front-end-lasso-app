import React, { useMemo, useState } from 'react'
import {
    CFormInput,
    CRow,
    CCol,
    CButton,
    CCard,
    CCardBody,
    CBadge,
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
        <CCard className="premium-card mb-4 shadow-sm border-0">
            <CCardBody className="p-4">
                <div className="d-flex align-items-center gap-2 mb-1">
                    <h5 className="fw-bold mb-0">Validador de comprobantes</h5>
                    <CBadge color="success" className="px-2 py-1 rounded-pill" style={{ fontSize: '0.7rem' }}>
                        Validación manual
                    </CBadge>
                </div>
                <p className="text-secondary small mb-3">
                    Pega la URL del comprobante para extraer datos OCR y cruzarlos con el sistema y correos del banco.
                </p>

                {/* Input + botones */}
                <div className="d-flex gap-2 mb-3">
                    <CFormInput
                        type="text"
                        placeholder="Pega aquí el enlace del comprobante..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleValidar()}
                        className="premium-input flex-grow-1"
                        disabled={isPending || isVinculando}
                    />
                    <CButton
                        color="success"
                        className="btn-premium btn-premium-success text-white px-4"
                        onClick={handleValidar}
                        disabled={isPending || isVinculando || !url.trim()}
                        style={{ whiteSpace: 'nowrap' }}
                    >
                        {isPending ? <><CSpinner size="sm" className="me-1" />Analizando...</> : 'Validar'}
                    </CButton>
                    <CButton
                        color="secondary"
                        variant="outline"
                        className="btn-premium"
                        onClick={handleLimpiar}
                        disabled={isPending || isVinculando}
                    >
                        Limpiar
                    </CButton>
                </div>

                {/* Alertas */}
                {error && (
                    <CAlert color="danger" className="py-2 small border-0">
                        ❌ {error?.response?.data?.message || 'Error al analizar el comprobante.'}
                    </CAlert>
                )}
                
                {isVinculado && (
                    <CAlert color="success" className="py-2 small border-0">
                        ✅ {vincularData?.mensaje || 'Pago vinculado y aprobado correctamente.'}
                    </CAlert>
                )}

                {/* Resultados de Cruce */}
                {ocr && (
                    <CRow className="g-3 mt-1">
                        {/* OCR DATA */}
                        <CCol md={4}>
                            <div className="p-3 rounded-3 bg-light h-100 border border-light-subtle">
                                <h6 className="fw-bold small text-secondary text-uppercase mb-3" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                                    📄 Datos OCR
                                </h6>
                                {campos.map(c => (
                                    <div key={c.label} className="mb-2 d-flex justify-content-between align-items-center border-bottom border-white pb-1">
                                        <span className="text-secondary" style={{ fontSize: '0.7rem' }}>{c.label}</span>
                                        <span className="fw-bold small">{c.value || '-'}</span>
                                    </div>
                                ))}
                            </div>
                        </CCol>

                        {/* SISTEMA MATCH */}
                        <CCol md={4}>
                            <div className={`p-3 rounded-3 h-100 border ${pagoExistente ? 'bg-success-subtle border-success-subtle' : 'bg-danger-subtle border-danger-subtle'}`}>
                                <h6 className="fw-bold small text-secondary text-uppercase mb-3" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                                    {pagoExistente ? '✅ Registro Sistema' : '❌ Sin Registro'}
                                </h6>
                                {pagoExistente ? (
                                    <>
                                        <div className="mb-2 d-flex justify-content-between border-bottom border-white pb-1">
                                            <span className="text-secondary small">ID Pago</span>
                                            <span className="fw-bold small">#{pagoExistente.id}</span>
                                        </div>
                                        <div className="mb-2 d-flex justify-content-between border-bottom border-white pb-1">
                                            <span className="text-secondary small">Cliente</span>
                                            <span className="fw-bold small text-truncate" style={{ maxWidth: '100px' }}>{pagoExistente.user_id || pagoExistente.cliente_id || '-'}</span>
                                        </div>
                                        <div className="mb-0 d-flex justify-content-between align-items-center">
                                            <span className="text-secondary small">Estado</span>
                                            <CBadge color={pagoExistente.estado === 'aprobado' ? 'success' : 'warning'} className="rounded-pill">
                                                {pagoExistente.estado}
                                            </CBadge>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-secondary small">No se encontró pago manual registrado.</div>
                                )}
                            </div>
                        </CCol>

                        {/* EMAIL MATCH */}
                        <CCol md={4}>
                            <div className={`p-3 rounded-3 h-100 border ${emailMatch ? 'bg-info-subtle border-info-subtle' : 'bg-warning-subtle border-warning-subtle'}`}>
                                <h6 className="fw-bold small text-secondary text-uppercase mb-3" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>
                                    {emailMatch ? '📩 Email Banco' : '❓ Sin Email'}
                                </h6>
                                {emailMatch ? (
                                    <>
                                        <div className="mb-2 d-flex justify-content-between border-bottom border-white pb-1">
                                            <span className="text-secondary small">Monto Email</span>
                                            <span className="fw-bold small">{formatearMonto(emailMatch.monto)}</span>
                                        </div>
                                        <div className="mb-2 d-flex justify-content-between border-bottom border-white pb-1">
                                            <span className="text-secondary small">Hora Email</span>
                                            <span className="fw-bold small">{emailMatch.hora_pago}</span>
                                        </div>
                                        {pagoExistente && !pagoExistente.pago_email_id && (
                                            <CButton 
                                                color="success" 
                                                size="sm" 
                                                className="w-100 mt-2 text-white fw-bold shadow-sm"
                                                onClick={handleVincular}
                                                disabled={isVinculando || isVinculado}
                                            >
                                                {isVinculando ? <CSpinner size="sm" /> : 'Vincular y Aprobar'}
                                            </CButton>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-secondary small">No se encontró correo de banco coincidente.</div>
                                )}
                            </div>
                        </CCol>
                    </CRow>
                )}
            </CCardBody>
        </CCard>
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

    const totalMonto = useMemo(() =>
        data.reduce((acc, p) => acc + Number(p?.monto || 0), 0), [data])

    const searchFunction = useMemo(() => (pago, termino) => {
        return (
            String(pago?.id || '').toLowerCase().includes(termino) ||
            String(pago?.ordenante || '').toLowerCase().includes(termino) ||
            String(pago?.monto || '').toLowerCase().includes(termino) ||
            String(pago?.user_id || '').toLowerCase().includes(termino)
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
        {
            header: 'Usuario',
            key: 'user_id',
            renderFunc: (item) => item.user_id
                ? <span className="fw-semibold text-primary">#{item.user_id}</span>
                : <span className="text-secondary small">Sin vincular</span>
        },
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
                <div className="d-flex flex-wrap gap-2">
                    <CButton color="primary" size="sm" className="btn-premium btn-premium-primary py-1 px-3"
                        onClick={() => setFechaFiltro(new Date().toISOString().split('T')[0])}>
                        Hoy
                    </CButton>
                    <CButton color="secondary" size="sm" className="btn-premium btn-premium-secondary py-1 px-3"
                        onClick={() => {
                            const ayer = new Date()
                            ayer.setDate(ayer.getDate() - 1)
                            setFechaFiltro(ayer.toISOString().split('T')[0])
                        }}>
                        Ayer
                    </CButton>
                    <CButton color="secondary" size="sm" className="btn-premium btn-premium-secondary py-1 px-3"
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
                searchPlaceholder="ID, ordenante, monto o message ID"
                itemsPerPage={50}
            />
        </div>
    )
}

export default PagosEmail