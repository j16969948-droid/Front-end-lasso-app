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
    CAlert,
    CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCheckCircle, cilWarning, cilLink, cilSearch, cilArrowRight } from '@coreui/icons'
import { useValidarComprobante, useVincularPago } from '../../core/hooks/useValidarComprobante'
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
    const emailMatch = resultado?.pago_email

    const { mutate: vincular, isPending: isVinculando, isSuccess: isVinculado, data: vincularData } = useVincularPago()

    const handleVincular = () => {
        if (!match?.id || !emailMatch?.id) return
        vincular({
            pago_entrante_id: match.id,
            pago_email_id: emailMatch.id
        })
    }

    const getBadgeColorEstado = (estado) => {
        const e = String(estado || '').toLowerCase()
        if (e === 'aprobado' || e === 'validado' || e === 'completado') return 'success'
        if (e === 'pendiente') return 'warning'
        if (e === 'sin match' || e === 'rechazado' || e === 'vencido') return 'danger'
        return 'secondary'
    }

    return (
        <div className="fade-up">
            <CCard className="premium-card mb-5 border-0">
                <CCardBody className="p-4 p-md-5">
                    <div className="d-flex align-items-center gap-3 mb-4">
                        <div className="p-3 bg-primary bg-opacity-10 rounded-4">
                            <CIcon icon={cilLink} className="text-primary" size="xl" />
                        </div>
                        <div>
                            <h2 className="section-title mb-1">Validar Comprobante</h2>
                            <p className="section-subtitle mb-0">Sistema inteligente de verificación de pagos mediante OCR y cruce bancario.</p>
                        </div>
                    </div>

                    <CRow className="g-4 align-items-end bg-body-tertiary p-4 rounded-4 shadow-sm">
                        <CCol md={9}>
                            <CFormLabel className="fw-bold small text-uppercase text-muted mb-2 ps-1">URL del Comprobante (JPG/PNG/PDF)</CFormLabel>
                            <CFormInput
                                type="text"
                                placeholder="Pega aquí el enlace del comprobante..."
                                value={urlComprobante}
                                onChange={(e) => setUrlComprobante(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleValidar()}
                                className="lasso-input"
                                disabled={isPending || isVinculando}
                            />
                        </CCol>
                        <CCol md={3}>
                            <CButton
                                className="w-100 btn-lasso btn-lasso-primary py-2"
                                onClick={handleValidar}
                                disabled={isPending || isVinculando || !urlComprobante.trim()}
                            >
                                {isPending ? <><CSpinner size="sm" className="me-2" />Validando...</> : <><CIcon icon={cilSearch} className="me-2" />Procesar</>}
                            </CButton>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {(isError || isVinculado) && (
                <CAlert color={isVinculado ? 'success' : 'danger'} className="mb-4 border-0 shadow-sm rounded-4 p-4">
                    <div className="d-flex align-items-center gap-3">
                        <CIcon icon={isVinculado ? cilCheckCircle : cilWarning} size="xl" />
                        <div>
                            <strong className="d-block">{isVinculado ? '¡Éxito!' : 'Ha ocurrido un error'}</strong>
                            <span className="small">{isVinculado ? (vincularData?.mensaje || 'Pago vinculado y aprobado correctamente.') : (error?.response?.data?.message || error?.message || 'Error al procesar el comprobante.')}</span>
                        </div>
                    </div>
                </CAlert>
            )}

            {ocr && (
                <CRow className="g-4 fade-up">
                    {/* Sección OCR */}
                    <CCol lg={4}>
                        <CCard className="premium-card h-100 border-0">
                            <CCardBody className="p-4">
                                <h6 className="fw-bold mb-4 text-uppercase text-muted small border-bottom pb-2">
                                    📄 Datos extraídos (OCR)
                                </h6>
                                {[
                                    { label: 'Monto detectado', value: formatearMonto(ocr.monto_pagado), className: 'fw-bold text-primary fs-5' },
                                    { label: 'Fecha comprobante', value: ocr.fecha_comprobante || '-' },
                                    { label: 'Referencia/Operación', value: ocr.referencia_pago || '-' },
                                    { label: 'Medio de pago', value: ocr.medio_pago || '-' },
                                ].map(({ label, value, className }) => (
                                    <div key={label} className="mb-3">
                                        <div className="text-muted x-small text-uppercase fw-semibold">{label}</div>
                                        <div className={className || 'fw-medium'}>{value}</div>
                                    </div>
                                ))}
                            </CCardBody>
                        </CCard>
                    </CCol>

                    {/* Sección Pago Entrante (Manual/Sistema) */}
                    <CCol lg={4}>
                        <CCard className={`premium-card h-100 border-0 border-top border-4 ${match ? 'border-success' : 'border-danger'}`}>
                            <CCardBody className="p-4">
                                <h6 className="fw-bold mb-4 text-uppercase text-muted small pb-2 border-bottom">
                                    {match ? '✅ Registro en Sistema' : '❌ Sin Registro Manual'}
                                </h6>
                                {match ? (
                                    <>
                                        {[
                                            { label: 'ID del Pago', value: `#${match.id}` },
                                            { label: 'Usuario/Cliente', value: match.user_id || match.cliente_id || 'N/A' },
                                            { label: 'Monto registrado', value: formatearMonto(match.monto_pagado) },
                                            { label: 'Estado actual', value: <span className={`badge-lasso badge-lasso-${getBadgeColorEstado(match.estado)}`}>{match.estado}</span> },
                                        ].map(({ label, value }) => (
                                            <div key={label} className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="text-muted small fw-medium">{label}</span>
                                                <span className="fw-bold">{value}</span>
                                            </div>
                                        ))}
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <CIcon icon={cilWarning} size="3xl" className="text-danger opacity-25 mb-3" />
                                        <p className="text-muted small">No encontramos un registro manual que coincida con estos datos.</p>
                                    </div>
                                )}
                            </CCardBody>
                        </CCard>
                    </CCol>

                    {/* Sección Pago Email (Banco) */}
                    <CCol lg={4}>
                        <CCard className={`premium-card h-100 border-0 border-top border-4 ${emailMatch ? 'border-info' : 'border-warning'}`}>
                            <CCardBody className="p-4">
                                <h6 className="fw-bold mb-4 text-uppercase text-muted small pb-2 border-bottom">
                                    {emailMatch ? '📩 Email Detectado' : '❓ Sin Email de Banco'}
                                </h6>
                                {emailMatch ? (
                                    <>
                                        {[
                                            { label: 'ID Bancario', value: `#${emailMatch.id}` },
                                            { label: 'Ordenante', value: emailMatch.ordenante || 'Desconocido' },
                                            { label: 'Monto banco', value: formatearMonto(emailMatch.monto), className: 'text-info fw-bold' },
                                            { label: 'Fecha/Hora', value: `${emailMatch.fecha_pago || ''} ${emailMatch.hora_pago || ''}` },
                                        ].map(({ label, value, className }) => (
                                            <div key={label} className="d-flex justify-content-between align-items-center mb-3">
                                                <span className="text-muted small fw-medium">{label}</span>
                                                <span className={className || 'fw-bold'}>{value}</span>
                                            </div>
                                        ))}

                                        {match && !match.pago_email_id && (
                                            <div className="mt-4 pt-3 border-top">
                                                <CButton
                                                    className="w-100 btn-lasso btn-lasso-primary"
                                                    onClick={handleVincular}
                                                    disabled={isVinculando || isVinculado}
                                                >
                                                    {isVinculando ? <CSpinner size="sm" /> : <><CIcon icon={cilCheckCircle} className="me-2" />Vincular y Aprobar</>}
                                                </CButton>
                                                <p className="text-center text-muted x-small mt-2 mb-0">
                                                    Esto vinculará el email al pago y lo marcará como <strong>aprobado</strong>.
                                                </p>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center py-4">
                                        <CIcon icon={cilWarning} size="3xl" className="text-warning opacity-25 mb-3" />
                                        <p className="text-muted small">No se detectó un correo del banco que coincida plenamente con el comprobante.</p>
                                    </div>
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