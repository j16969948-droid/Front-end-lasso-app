// import React, { useState } from 'react'
// import { useLocation } from 'react-router-dom'
// import {
//     CCard,
//     CCardBody,
//     CFormInput,
//     CButton,
//     CRow,
//     CCol,
//     CFormLabel,
//     CBadge,
//     CAlert,
//     CSpinner,
// } from '@coreui/react'
// import { useValidarComprobante, useVincularPago } from '../../core/hooks/useValidarComprobante'
// import { formatearMonto } from '../../utils/formatters'

// const Validar = () => {
//     const location = useLocation()
//     const [urlComprobante, setUrlComprobante] = useState(location.state?.url || '')
//     const { mutate: validar, data: resultado, isPending, isError, error, reset } = useValidarComprobante()

//     const handleValidar = () => {
//         if (!urlComprobante.trim()) return
//         reset()
//         validar(urlComprobante.trim())
//     }

//     const ocr = resultado?.datos_ocr
//     const match = resultado?.pago_existente
//     const emailMatch = resultado?.pago_email

//     const { mutate: vincular, isPending: isVinculando, isSuccess: isVinculado, data: vincularData } = useVincularPago()

//     const handleVincular = () => {
//         if (!match?.id || !emailMatch?.id) return
//         vincular({
//             pago_entrante_id: match.id,
//             pago_email_id: emailMatch.id
//         })
//     }

//     const estadoColor = (estado) => {
//         const e = String(estado || '').toLowerCase()
//         if (e === 'aprobado' || e === 'validado') return 'success'
//         if (e === 'pendiente') return 'warning'
//         if (e === 'sin match' || e === 'rechazado') return 'danger'
//         return 'secondary'
//     }

//     return (
//         <div className="fade-in-up">
//             <CCard className="premium-card mb-4">
//                 <CCardBody className="p-4">
//                     <h4 className="fw-bold mb-3">Validar Comprobante</h4>
//                     <p className="text-secondary mb-4">
//                         Ingresa la URL del comprobante para verificar automáticamente los datos del pago y cruzarlos con el sistema.
//                     </p>
//                     <CRow className="g-3 align-items-end">
//                         <CCol md={9}>
//                             <CFormLabel className="fw-semibold small text-uppercase text-secondary">URL del Comprobante</CFormLabel>
//                             <CFormInput
//                                 type="text"
//                                 placeholder="https://ejemplo.com/comprobante.jpg"
//                                 value={urlComprobante}
//                                 onChange={(e) => setUrlComprobante(e.target.value)}
//                                 onKeyDown={(e) => e.key === 'Enter' && handleValidar()}
//                                 className="premium-input"
//                                 disabled={isPending || isVinculando}
//                             />
//                         </CCol>
//                         <CCol md={3}>
//                             <CButton
//                                 color="primary"
//                                 className="w-100 btn-premium btn-premium-primary"
//                                 onClick={handleValidar}
//                                 disabled={isPending || isVinculando || !urlComprobante.trim()}
//                             >
//                                 {isPending ? <><CSpinner size="sm" className="me-2" />Procesando...</> : 'Validar Ahora'}
//                             </CButton>
//                         </CCol>
//                     </CRow>
//                 </CCardBody>
//             </CCard>

//             {(isError || isVinculado) && (
//                 <CAlert color={isVinculado ? 'success' : 'danger'} className="mb-4">
//                     {isVinculado ? (
//                         <strong>{vincularData?.mensaje || 'Pago vinculado y aprobado correctamente.'}</strong>
//                     ) : (
//                         <><strong>Error:</strong> {error?.response?.data?.message || error?.message || 'Ocurrió un error al procesar'}</>
//                     )}
//                 </CAlert>
//             )}

//             {ocr && (
//                 <CRow className="g-4">
//                     {/* Sección OCR */}
//                     <CCol md={4}>
//                         <CCard className="premium-card h-100">
//                             <CCardBody className="p-4">
//                                 <h6 className="fw-bold mb-3 text-uppercase text-secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
//                                     📄 Datos extraídos (OCR)
//                                 </h6>
//                                 {[
//                                     { label: 'Monto', value: formatearMonto(ocr.monto_pagado) },
//                                     { label: 'Fecha', value: ocr.fecha_comprobante || '-' },
//                                     { label: 'Hora', value: ocr.hora_comprobante || '-' },
//                                     { label: 'Referencia', value: ocr.referencia_pago || '-' },
//                                     { label: 'Medio', value: ocr.medio_pago || '-' },
//                                 ].map(({ label, value }) => (
//                                     <div key={label} className="d-flex justify-content-between align-items-center py-2 border-bottom">
//                                         <span className="text-secondary small fw-semibold">{label}</span>
//                                         <span className="fw-semibold">{value}</span>
//                                     </div>
//                                 ))}
//                             </CCardBody>
//                         </CCard>
//                     </CCol>

//                     {/* Sección Pago Entrante (Manual/Sistema) */}
//                     <CCol md={4}>
//                         <CCard className={`premium-card h-100 border-start border-4 ${match ? 'border-success' : 'border-danger'}`}>
//                             <CCardBody className="p-4">
//                                 <h6 className="fw-bold mb-3 text-uppercase text-secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
//                                     {match ? '✅ Registro en Sistema' : '❌ Sin Registro'}
//                                 </h6>
//                                 {match ? (
//                                     <>
//                                         {[
//                                             { label: 'ID Pago', value: match.id },
//                                             { label: 'Cliente/User', value: match.cliente_id || match.user_id || '-' },
//                                             { label: 'Monto Reg.', value: formatearMonto(match.monto_pagado) },
//                                             { label: 'Fecha Reg.', value: match.fecha_comprobante || '-' },
//                                             { label: 'Hora Reg.', value: match.hora_comprobante || '-' },
//                                         ].map(({ label, value }) => (
//                                             <div key={label} className="d-flex justify-content-between align-items-center py-2 border-bottom">
//                                                 <span className="text-secondary small fw-semibold">{label}</span>
//                                                 <span className="fw-semibold text-truncate ms-2" style={{ maxWidth: '120px' }}>{value}</span>
//                                             </div>
//                                         ))}
//                                         <div className="d-flex justify-content-between align-items-center pt-3">
//                                             <span className="text-secondary small fw-semibold">Estado</span>
//                                             <CBadge color={estadoColor(match.estado)} className="rounded-pill px-3 py-2">
//                                                 {match.estado || 'Sin definir'}
//                                             </CBadge>
//                                         </div>
//                                     </>
//                                 ) : (
//                                     <p className="text-secondary small mt-2 mb-0">No se encontró pago manual registrado con estos datos.</p>
//                                 )}
//                             </CCardBody>
//                         </CCard>
//                     </CCol>

//                     {/* Sección Pago Email (Banco) */}
//                     <CCol md={4}>
//                         <CCard className={`premium-card h-100 border-start border-4 ${emailMatch ? 'border-info' : 'border-warning'}`}>
//                             <CCardBody className="p-4">
//                                 <h6 className="fw-bold mb-3 text-uppercase text-secondary" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
//                                     {emailMatch ? '📩 Email de Banco' : '❓ Sin Email de Banco'}
//                                 </h6>
//                                 {emailMatch ? (
//                                     <>
//                                         {[
//                                             { label: 'ID Email', value: emailMatch.id },
//                                             { label: 'Ordenante', value: emailMatch.ordenante || '-' },
//                                             { label: 'Monto Email', value: formatearMonto(emailMatch.monto) },
//                                             { label: 'Fecha Email', value: emailMatch.fecha_pago || '-' },
//                                             { label: 'Hora Email', value: emailMatch.hora_pago || '-' },
//                                         ].map(({ label, value }) => (
//                                             <div key={label} className="d-flex justify-content-between align-items-center py-2 border-bottom">
//                                                 <span className="text-secondary small fw-semibold">{label}</span>
//                                                 <span className="fw-semibold text-truncate ms-2" style={{ maxWidth: '120px' }}>{value}</span>
//                                             </div>
//                                         ))}

//                                         {match && !match.pago_email_id && (
//                                             <div className="pt-3">
//                                                 <CButton
//                                                     color="success"
//                                                     size="sm"
//                                                     className="w-100 text-white fw-bold"
//                                                     onClick={handleVincular}
//                                                     disabled={isVinculando || isVinculado}
//                                                 >
//                                                     {isVinculando ? <CSpinner size="sm" /> : 'Vincular y Aprobar'}
//                                                 </CButton>
//                                                 <p className="text-center text-secondary x-small mt-2 mb-0" style={{ fontSize: '0.7rem' }}>
//                                                     Esto actualizará el ordenante y aprobará el pago.
//                                                 </p>
//                                             </div>
//                                         )}
//                                     </>
//                                 ) : (
//                                     <p className="text-secondary small mt-2 mb-0">No se encontró un correo del banco que coincida con el comprobante.</p>
//                                 )}
//                             </CCardBody>
//                         </CCard>
//                     </CCol>
//                 </CRow>
//             )}
//         </div>
//     )
// }

// export default Validar