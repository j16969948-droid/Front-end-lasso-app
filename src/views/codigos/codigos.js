import React, { useState, useMemo } from 'react'
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
    CToaster,
    CToast,
    CToastHeader,
    CToastBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilClipboard, cilCheckCircle, cilWarning } from '@coreui/icons'
import { useCodigosQuery, useActualizarPlataforma } from '../../core/hooks/useCodigos'

// ── Badge helpers ─────────────────────────────────────────────────
const plataformaBadge = (plat) => {
    const lower = (plat || '').toLowerCase()
    const style = lower === 'netflix'
        ? { backgroundColor: '#e50914', color: '#fff' }
        : lower === 'disney'
            ? { backgroundColor: '#1a6ab1', color: '#fff' }
            : { backgroundColor: '#6c757d', color: '#fff' }
    return (
        <span
            className="rounded-pill px-2 py-1 fw-semibold"
            style={{ ...style, fontSize: '0.72rem' }}
        >
            {plat}
        </span>
    )
}

const tipoBadge = (tipo) => (
    <span
        className="rounded-pill px-2 py-1 fw-semibold"
        style={{ backgroundColor: '#0dcaf0', color: '#fff', fontSize: '0.72rem' }}
    >
        {tipo || 'Código'}
    </span>
)

const estadoBadge = (estado) => {
    const lower = (estado || '').toLowerCase()
    let bg = '#6c757d'
    if (lower === 'pendiente') bg = '#ffc107'
    else if (lower === 'entregado') bg = '#198754'
    else if (lower === 'error') bg = '#dc3545'
    return (
        <span
            className="rounded-pill px-2 py-1 fw-semibold"
            style={{ backgroundColor: bg, color: lower === 'pendiente' ? '#000' : '#fff', fontSize: '0.72rem' }}
        >
            {estado}
        </span>
    )
}

// ── Main Component ────────────────────────────────────────────────
const Codigos = () => {
    const [busqueda, setBusqueda] = useState('')
    const [lastUpdated, setLastUpdated] = useState(new Date())
    const [toast, setToast] = useState(null)

    // Using query for data fetching with filters
    const { data: codigos = [], isLoading, isError, refetch } = useCodigosQuery({
        correo: busqueda || undefined
    })

    const { mutate: actualizarPlataforma, isPending: isUpdating } = useActualizarPlataforma()

    const handleActualizarPlataforma = (plataforma) => {
        actualizarPlataforma(plataforma, {
            onSuccess: (data) => {
                setToast({
                    type: 'success',
                    title: 'Actualización exitosa',
                    body: data.message || `Se ha iniciado la actualización de ${plataforma}.`
                })
                setLastUpdated(new Date())
                refetch()
            },
            onError: (err) => {
                setToast({
                    type: 'danger',
                    title: 'Error de actualización',
                    body: err.response?.data?.message || `No se pudo actualizar ${plataforma}.`
                })
            }
        })
    }

    const handleCopiar = (texto) => {
        navigator.clipboard.writeText(texto)
        setToast({
            type: 'info',
            title: 'Copiado',
            body: 'El código ha sido copiado al portapapeles.'
        })
    }

    const handleLimpiar = () => {
        setBusqueda('')
        refetch()
    }

    return (
        <div className="fade-in-up px-1">
            <CToaster push={toast} placement="top-end">
                {toast && (
                    <CToast autohide={true} visible={true} color={toast.type === 'danger' ? 'danger' : toast.type === 'success' ? 'success' : 'info'}>
                        <CToastHeader closeButton>
                            <CIcon icon={toast.type === 'danger' ? cilWarning : cilCheckCircle} className="me-2" />
                            <strong className="me-auto">{toast.title}</strong>
                        </CToastHeader>
                        <CToastBody>{toast.body}</CToastBody>
                    </CToast>
                )}
            </CToaster>

            {/* ── Header ── */}
            <div className="d-flex align-items-start justify-content-between mb-3 flex-wrap gap-2 px-2 pt-3">
                <div>
                    <div className="d-flex align-items-center gap-3 mb-1">
                        <h4 className="fw-bold mb-0">Códigos</h4>
                        <span
                            className="px-2 py-1 rounded-pill fw-semibold"
                            style={{ fontSize: '0.7rem', background: 'rgba(15,51,133,0.08)', color: 'var(--cui-body-color)' }}
                        >
                            Netflix + Disney
                        </span>
                    </div>
                    <p className="text-secondary small mb-0">
                        Busca por correo, actualiza Netflix o Disney por separado y copia códigos o enlaces.
                    </p>
                </div>

                {/* Timestamp badge */}
                <div
                    className="d-flex align-items-center gap-2 px-3 py-2 rounded-3"
                    style={{ background: 'var(--cui-tertiary-bg,#f8f9fa)', fontSize: '0.75rem', minWidth: '190px' }}
                >
                    <span
                        className="d-flex align-items-center justify-content-center rounded-circle fw-bold text-white"
                        style={{ width: 32, height: 32, background: '#1a1a2e', fontSize: '0.8rem', flexShrink: 0 }}
                    >
                        C
                    </span>
                    <div>
                        <div className="text-secondary" style={{ fontSize: '0.65rem' }}>Actualizado</div>
                        <div className="fw-semibold">{lastUpdated.toLocaleString('es-CO')}</div>
                    </div>
                    {isLoading && <CSpinner size="sm" className="ms-1" />}
                </div>
            </div>

            {/* ── Search / Actions Card ── */}
            <CCard className="border-0 mb-4 mx-2" style={{ borderRadius: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <CCardBody className="p-4">
                    <CRow className="g-2 mb-3">
                        <CCol xs={12}>
                            <label className="small fw-semibold text-secondary mb-1">Correo</label>
                        </CCol>
                        <CCol xs={12} md={6}>
                            <CFormInput
                                placeholder="Buscar por correo..."
                                value={busqueda}
                                onChange={e => setBusqueda(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && refetch()}
                                className="premium-input"
                            />
                        </CCol>
                        <CCol xs={6} md={3}>
                            <CButton
                                onClick={() => refetch()}
                                className="w-100 fw-semibold"
                                style={{ backgroundColor: '#1a1a2e', borderColor: '#1a1a2e', color: '#fff', borderRadius: '0.5rem' }}
                                disabled={isLoading}
                            >
                                {isLoading ? <CSpinner size="sm" /> : 'Buscar'}
                            </CButton>
                        </CCol>
                        <CCol xs={6} md={3}>
                            <CButton
                                onClick={handleLimpiar}
                                variant="outline"
                                color="secondary"
                                className="w-100 fw-semibold"
                                style={{ borderRadius: '0.5rem' }}
                            >
                                Limpiar
                            </CButton>
                        </CCol>
                    </CRow>

                    {/* Action buttons */}
                    <CRow className="g-2">
                        <CCol xs={12} md={6}>
                            <CButton
                                onClick={() => handleActualizarPlataforma('Netflix')}
                                className="w-100 fw-bold"
                                style={{ backgroundColor: '#e50914', borderColor: '#e50914', color: '#fff', borderRadius: '0.5rem', padding: '0.6rem' }}
                                disabled={isUpdating}
                            >
                                {isUpdating ? <CSpinner size="sm" /> : 'Actualizar Netflix'}
                            </CButton>
                        </CCol>
                        <CCol xs={12} md={6}>
                            <CButton
                                onClick={() => handleActualizarPlataforma('Disney')}
                                className="w-100 fw-bold"
                                style={{ backgroundColor: '#1a6ab1', borderColor: '#1a6ab1', color: '#fff', borderRadius: '0.5rem', padding: '0.6rem' }}
                                disabled={isUpdating}
                            >
                                {isUpdating ? <CSpinner size="sm" /> : 'Actualizar Disney'}
                            </CButton>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            {/* ── Codes Table ── */}
            <CCard className="border-0 mx-2" style={{ borderRadius: '1rem', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
                <CCardBody className="p-4">
                    <div className="mb-3">
                        <h6 className="fw-bold mb-0">Listado de códigos</h6>
                        <p className="text-secondary small mb-0">Total filtrado: {codigos.length}</p>
                    </div>

                    <div className="table-responsive">
                        <CTable hover small className="mb-0" style={{ fontSize: '0.85rem' }}>
                            <CTableHead style={{ backgroundColor: '#1a1a2e', color: '#fff' }}>
                                <CTableRow>
                                    {['N°', 'Fecha', 'Correo', 'Plataforma', 'Tipo', 'Asunto', 'Valor', 'Estado', 'Acciones'].map(h => (
                                        <CTableHeaderCell
                                            key={h}
                                            className="fw-semibold py-3"
                                            style={{ backgroundColor: '#1a1a2e', color: '#fff', whiteSpace: 'nowrap' }}
                                        >
                                            {h}
                                        </CTableHeaderCell>
                                    ))}
                                </CTableRow>
                            </CTableHead>
                            <CTableBody>
                                {isLoading ? (
                                    <CTableRow>
                                        <CTableDataCell colSpan={9} className="text-center py-5">
                                            <CSpinner color="primary" />
                                            <div className="mt-2 text-secondary">Cargando códigos...</div>
                                        </CTableDataCell>
                                    </CTableRow>
                                ) : isError ? (
                                    <CTableRow>
                                        <CTableDataCell colSpan={9} className="text-center py-5 text-danger">
                                            Error al cargar los códigos. Por favor, intenta de nuevo.
                                        </CTableDataCell>
                                    </CTableRow>
                                ) : codigos.length === 0 ? (
                                    <CTableRow>
                                        <CTableDataCell colSpan={9} className="text-center py-5 text-secondary">
                                            No se encontraron códigos
                                        </CTableDataCell>
                                    </CTableRow>
                                ) : (
                                    codigos.map((item, idx) => (
                                        <CTableRow key={item.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#fafbfc' }}>
                                            <CTableDataCell className="fw-semibold">{idx + 1}</CTableDataCell>
                                            <CTableDataCell className="text-secondary" style={{ whiteSpace: 'nowrap' }}>
                                                {item.creado_en ? new Date(item.creado_en).toLocaleString('es-CO') : (item.fecha_correo || '-')}
                                            </CTableDataCell>
                                            <CTableDataCell style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.correo}
                                            </CTableDataCell>
                                            <CTableDataCell>{plataformaBadge(item.plataforma)}</CTableDataCell>
                                            <CTableDataCell>{tipoBadge(item.origen)}</CTableDataCell>
                                            <CTableDataCell style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} className="text-secondary">
                                                {item.asunto}
                                            </CTableDataCell>
                                            <CTableDataCell className="fw-semibold">{item.codigo}</CTableDataCell>
                                            <CTableDataCell>{estadoBadge(item.estado)}</CTableDataCell>
                                            <CTableDataCell>
                                                <div className="d-flex gap-2">
                                                    <CButton
                                                        size="sm"
                                                        color="secondary"
                                                        variant="outline"
                                                        title="Copiar código"
                                                        style={{ padding: '0.2rem 0.45rem', borderRadius: '0.4rem' }}
                                                        onClick={() => handleCopiar(item.codigo)}
                                                    >
                                                        #
                                                    </CButton>
                                                    <CButton
                                                        size="sm"
                                                        color="success"
                                                        variant="outline"
                                                        title="Copiar enlace"
                                                        style={{ padding: '0.2rem 0.45rem', borderRadius: '0.4rem' }}
                                                        onClick={() => handleCopiar(item.asunto)}
                                                    >
                                                        <CIcon icon={cilClipboard} size="sm" />
                                                    </CButton>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))
                                )}
                            </CTableBody>
                        </CTable>
                    </div>
                </CCardBody>
            </CCard>
        </div>
    )
}

export default Codigos