import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
    CCard,
    CCardBody,
    CFormInput,
    CButton,
    CRow,
    CCol,
    CFormLabel,
    CBadge,
    CAlert,
    CSpinner,
} from '@coreui/react'
import { useValidarComprobante } from '../../core/hooks/useValidarComprobante'
import { formatearMonto } from '../../utils/formatters'

const Validar = () => {
    const location = useLocation()
    const [urlComprobante, setUrlComprobante] = useState(location.state?.url || '')
    const { mutate: validar, data: resultado, isPending, isError, error, reset } = useValidarComprobante()

    const handleValidar = () => {
        if (!urlComprobante.trim()) return
        reset()
        validar(urlComprobante.trim())
    }

    const ocr = resultado?.datos_ocr
    const match = resultado?.pago_existente

    const estadoColor = (estado) => {
        const e = String(estado || '').toLowerCase()
        if (e === 'aprobado' || e === 'validado') return 'success'
        if (e === 'pendiente') return 'warning'
        if (e === 'sin match') return 'danger'
        return 'secondary'
    }

    return (
        <div className="fade-in-up">
            <CCard className="premium-card mb-4">
                <CCardBody className="p-4">
                    <h4 className="fw-bold mb-3">Validar Comprobante</h4>
                    <p className="text-secondary mb-4">
                        Ingresa la URL del comprobante para verificar automáticamente los datos del pago y cruzarlos con el sistema.
                    </p>
                    <CRow className="g-3 align-items-end">
                        <CCol md={9}>
                            <CFormLabel className="fw-semibold small text-uppercase text-secondary">URL del Comprobante</CFormLabel>
                            <CFormInput
                                type="text"
                                placeholder="https://ejemplo.com/comprobante.jpg"
                                value={urlComprobante}
                                onChange={(e) => setUrlComprobante(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleValidar()}
                                className="premium-input"
                                disabled={isPending}
                            />
                        </CCol>
                        <CCol md={3}>
                            <CButton
                                color="primary"
                                className="w-100 btn-premium btn-premium-primary"
                                onClick={handleValidar}
                                disabled={isPending || !urlComprobante.trim()}
                            >
                                {isPending ? <><CSpinner size="sm" className="me-2" />Procesando...</> : 'Validar Ahora'}
                            </CButton>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {isError && (
                <CAlert color="danger" className="mb-4">
                    <strong>Error:</strong> {error?.response?.data?.message || error?.message || 'Ocurrió un error al procesar el comprobante'}
                </CAlert>
            )}

            {ocr && (
                <CRow className="g-4">
                    <CCol md={6}>
                        <CCard className="premium-card h-100">
                            <CCardBody className="p-4">
                                <h6 className="fw-bold mb-3 text-uppercase text-secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                                    📄 Datos extraídos por OCR
                                </h6>
                                {[
                                    { label: 'Monto', value: formatearMonto(ocr.monto_pagado) },
                                    { label: 'Fecha', value: ocr.fecha_comprobante || '-' },
                                    { label: 'Hora', value: ocr.hora_comprobante || '-' },
                                    { label: 'Medio de pago', value: ocr.medio_pago || '-' },
                                    { label: 'Red de pago', value: ocr.red_pago || '-' },
                                    { label: 'Referencia', value: ocr.referencia_pago || '-' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                        <span className="text-secondary small fw-semibold">{label}</span>
                                        <span className="fw-semibold">{value}</span>
                                    </div>
                                ))}
                            </CCardBody>
                        </CCard>
                    </CCol>

                    <CCol md={6}>
                        <CCard className={`premium-card h-100 border-start border-4 ${match ? 'border-success' : 'border-danger'}`}>
                            <CCardBody className="p-4">
                                <h6 className="fw-bold mb-3 text-uppercase text-secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
                                    {match ? '✅ Pago encontrado en el sistema' : '❌ Sin coincidencia en el sistema'}
                                </h6>
                                {match ? (
                                    <>
                                        {[
                                            { label: 'ID Pago', value: match.id },
                                            { label: 'Cliente', value: match.cliente_id || match.user_id || '-' },
                                            { label: 'Monto registrado', value: formatearMonto(match.monto_pagado) },
                                            { label: 'Fecha comprobante', value: match.fecha_comprobante || '-' },
                                            { label: 'Hora comprobante', value: match.hora_comprobante || '-' },
                                            { label: 'Referencia', value: match.referencia_pago || '-' },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                                                <span className="text-secondary small fw-semibold">{label}</span>
                                                <span className="fw-semibold">{value}</span>
                                            </div>
                                        ))}
                                        <div className="d-flex justify-content-between align-items-center pt-3">
                                            <span className="text-secondary small fw-semibold">Estado</span>
                                            <CBadge color={estadoColor(match.estado)} className="rounded-pill px-3 py-2">
                                                {match.estado || 'Sin definir'}
                                            </CBadge>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-secondary small mt-2 mb-0">
                                        No se encontró ningún pago en <code>pagos_entrantes</code> que coincida con la fecha, hora y monto del comprobante.
                                    </p>
                                )}
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
            )}
        </div>
    )
}

export default Validar