import React, { useMemo, useState } from 'react'
import {
    CFormSelect,
    CRow,
    CCol,
    CButton,
    CBadge,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CFormLabel,
    CFormInput,
    CWidgetStatsC,
    CCard,
    CCardBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilExternalLink, cilCheckCircle } from '@coreui/icons'
import { usePagosEntrantes, useValidarPagoManual } from '../../core/hooks/usePagosEntrantes'
import { formatearMonto } from '../../utils/formatters'
import { LoadingState, ErrorState } from '../../components/TableFeedback'
import DataTable from '../../components/DataTable'

const PagosEntrantes = () => {
    const [filtroEstadoPago, setFiltroEstadoPago] = useState('')
    const [filtroMedioPago, setFiltroMedioPago] = useState('')
    const [filtroFecha, setFiltroFecha] = useState(() => new Date().toISOString().split('T')[0])

    const filters = useMemo(() => {
        return {
            estado: filtroEstadoPago || undefined,
            medio_pago: filtroMedioPago || undefined,
            fecha: filtroFecha || undefined,
            statistics: 1
        };
    }, [filtroEstadoPago, filtroMedioPago, filtroFecha])

    const { data: responseData, isLoading, error } = usePagosEntrantes(filters)
    const { mutate: validarManual } = useValidarPagoManual()
    const [modalVisible, setModalVisible] = useState(false)
    const [imagenSeleccionada, setImagenSeleccionada] = useState('')
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null)

    const pagosEntrantes = responseData?.data || []
    const statistics = responseData?.statistics || null

    const data = useMemo(() => (Array.isArray(pagosEntrantes) ? pagosEntrantes : []), [pagosEntrantes])

    const opcionesEstadoPago = useMemo(() => {
        return ['Aprobado', 'Pendiente', 'Repetido', 'Sin match', 'Pago ya reportado']
    }, [])

    const opcionesMedioPago = useMemo(() => {
        return [...new Set(data.map((item) => item?.medio_pago).filter(Boolean))]
    }, [data])

    const searchFunction = useMemo(() => (pago, termino) => {
        const t = (termino || '').toLowerCase()
        return (
            String(pago?.cliente_id || '').toLowerCase().includes(t) ||
            String(pago?.monto_pagado || '').toLowerCase().includes(t) ||
            String(pago?.referencia_pago || '').toLowerCase().includes(t) ||
            String(pago?.combo_adquirido || '').toLowerCase().includes(t) ||
            String(pago?.medio_pago || '').toLowerCase().includes(t) ||
            String(pago?.user_id || '').toLowerCase().includes(t)
        )
    }, [])

    const handleVerComprobante = (pago) => {
        if (!pago?.comprobante_url) return
        setImagenSeleccionada(pago.comprobante_url)
        setPagoSeleccionado(pago)
        setModalVisible(true)
    }

    const cerrarModal = () => {
        setModalVisible(false)
        setImagenSeleccionada('')
        setPagoSeleccionado(null)
    }

    const handleValidarManual = (pago) => {
        if (window.confirm(`¿Estás seguro de validar el pago #${pago.id} manualmente?`)) {
            validarManual(pago.id, {
                onSuccess: (data) => console.log(data.mensaje),
                onError: (err) => alert('Error al validar el pago: ' + (err.response?.data?.error || err.message))
            })
        }
    }

    const StatCard = ({ title, value, text, icon, color }) => (
        <CCol sm={6} lg={3}>
            <div className="premium-card p-4 h-100 position-relative border-0 shadow-lg">
                <div className={`position-absolute top-0 end-0 p-3 opacity-25 text-${color}`}>
                    <CIcon icon={icon} size="xl" />
                </div>
                <div className="section-subtitle text-uppercase fw-bold mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.05em' }}>{title}</div>
                <div className="section-title h2 mb-2">{value}</div>
                <div className="text-muted small">{text}</div>
            </div>
        </CCol>
    )

    const columns = [
        { header: 'ID', key: 'id', renderFunc: (p) => <span className="text-muted fw-bold">#{p.id}</span> },
        {
            header: 'Fecha / Hora',
            key: 'fecha',
            renderFunc: (p) => {
                const fecha = p.fecha_comprobante || p.fecha || '-'
                return (
                    <div>
                        <div className="fw-medium">{String(fecha).split(/[ T]/)[0]}</div>
                        <div className="text-muted x-small">{p.hora_comprobante || '-'}</div>
                    </div>
                )
            }
        },
        {
            header: 'Cliente',
            key: 'cliente',
            renderFunc: (p) => <span className="fw-bold">{p.user_id || '-'}</span>
        },
        {
            header: 'Combo',
            key: 'combo',
            renderFunc: (p) => <span className="text-muted small">{p.combo_adquirido || '-'}</span>
        },
        {
            header: 'Monto',
            key: 'monto',
            renderFunc: (p) => <span className="fw-bold text-success">{formatearMonto(p.monto_pagado)}</span>
        },
        {
            header: 'Medio',
            key: 'medio',
            renderFunc: (p) => {
                const medio = String(p.medio_pago || '').toLowerCase()
                let type = 'info'
                if (medio === 'nequi') type = 'purple'
                return (
                    <span className={`badge-lasso badge-lasso-${type}`}>
                        {p.medio_pago || '-'}
                    </span>
                )
            }
        },
        { header: 'Referencia', key: 'referencia_pago', className: 'x-small text-muted' },
        {
            header: 'Estado',
            key: 'estado',
            renderFunc: (p) => {
                const e = String(p.estado || '').toLowerCase()
                let type = 'secondary'
                if (e === 'aprobado') type = 'success'
                if (e === 'pendiente') type = 'warning'
                if (e === 'sin match') type = 'danger'
                return <span className={`badge-lasso badge-lasso-${type}`}>{p.estado || 'N/A'}</span>
            }
        },
        {
            header: 'Acciones',
            key: 'acciones',
            renderFunc: (p) => (
                <div className="d-flex gap-2">
                    <CButton className="btn-lasso btn-lasso-soft-primary" onClick={() => handleVerComprobante(p)} disabled={!p?.comprobante_url} title="Ver Comprobante">
                        <CIcon icon={cilExternalLink} size="sm" />
                    </CButton>
                    <CButton className="btn-lasso btn-lasso-success" onClick={() => handleValidarManual(p)} title="Validar Manualmente">
                        <CIcon icon={cilCheckCircle} size="sm" />
                    </CButton>
                </div>
            )
        },
    ]

    const filterControls = (
        <CRow className="g-3">
            <CCol md={4}>
                <CFormLabel className="lasso-label">Filtrar por Fecha</CFormLabel>
                <CFormInput type="date" className="lasso-input" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
            </CCol>
            <CCol md={4}>
                <CFormLabel className="lasso-label">Estado de Pago</CFormLabel>
                <CFormSelect className="lasso-input" value={filtroEstadoPago} onChange={(e) => setFiltroEstadoPago(e.target.value)}>
                    <option value="">Todos los estados</option>
                    {opcionesEstadoPago.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                </CFormSelect>
            </CCol>
            <CCol md={4}>
                <CFormLabel className="lasso-label">Medio de Pago</CFormLabel>
                <CFormSelect className="lasso-input" value={filtroMedioPago} onChange={(e) => setFiltroMedioPago(e.target.value)}>
                    <option value="">Todos los medios</option>
                    {opcionesMedioPago.map((medio) => <option key={medio} value={medio}>{medio}</option>)}
                </CFormSelect>
            </CCol>
        </CRow>
    )

    if (isLoading) return <LoadingState message="Cargando pagos entrantes..." />
    if (error) return <ErrorState message="No se pudieron cargar los pagos entrantes" onRetry={() => window.location.reload()} />

    return (
        <div className="fade-up">
            {statistics && (
                <CRow className="g-4 mb-4">
                    <StatCard title="Pagos del Día" value={statistics.total_pagos_dia || 0} text="Comprobantes recibidos hoy" icon={cilCheckCircle} color="primary" />
                    <StatCard title="Aprobados" value={statistics.total_aprobados || 0} text="Validados satisfactoriamente" icon={cilCheckCircle} color="success" />
                    <StatCard title="Pendientes" value={statistics.total_pendientes || 0} text="Requieren revisión manual" icon={cilCheckCircle} color="warning" />
                    <StatCard title="Monto Aprobado" value={formatearMonto(statistics.monto_total_aprobados || 0)} text="Recaudación total aprobada" icon={cilCheckCircle} color="info" />
                </CRow>
            )}

            <DataTable
                title="Pagos Entrantes"
                subtitle="Cruce de datos y validación de comprobantes recibidos."
                data={data}
                columns={columns}
                searchFunction={searchFunction}
                filterControls={filterControls}
                onClear={() => { setFiltroEstadoPago(''); setFiltroMedioPago(''); setFiltroFecha(''); }}
                searchPlaceholder="Cliente, referencia, combo..."
                itemsPerPage={50}
            />

            <CModal visible={modalVisible} onClose={cerrarModal} size="xl" alignment="center" className="lasso-modal">
                <CModalHeader className="border-0 pb-0">
                    <CModalTitle className="section-title h4">Detalle del Pago</CModalTitle>
                </CModalHeader>
                <CModalBody className="p-4">
                    <CRow className="g-4">
                        <CCol md={5}>
                            <div className="premium-card p-2 bg-light d-flex align-items-center justify-content-center overflow-hidden" style={{ minHeight: '400px' }}>
                                {imagenSeleccionada ? (
                                    <img src={imagenSeleccionada} alt="Comprobante" style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }} className="rounded-3 shadow-sm" />
                                ) : (
                                    <div className="text-muted">Sin comprobante</div>
                                )}
                            </div>
                        </CCol>
                        <CCol md={7}>
                            <CRow className="g-3">
                                {[
                                    { label: 'ID Transacción', value: pagoSeleccionado?.id },
                                    { label: 'Cliente', value: pagoSeleccionado?.user_id },
                                    { label: 'Monto', value: formatearMonto(pagoSeleccionado?.monto_pagado) },
                                    { label: 'Medio', value: pagoSeleccionado?.medio_pago },
                                    { label: 'Fecha/Hora', value: `${pagoSeleccionado?.fecha_comprobante} ${pagoSeleccionado?.hora_comprobante}` },
                                    { label: 'Referencia', value: pagoSeleccionado?.referencia_pago, full: true },
                                    { label: 'Combo', value: pagoSeleccionado?.combo_adquirido, full: true },
                                    { label: 'Email Match ID', value: pagoSeleccionado?.pago_email_id, full: true },
                                ].map((item, idx) => (
                                    <CCol key={idx} md={item.full ? 12 : 6}>
                                        <div className="p-3 bg-light rounded-3 border border-light-subtle">
                                            <div className="lasso-label mb-1" style={{ fontSize: '0.7rem' }}>{item.label}</div>
                                            <div className="fw-bold text-dark">{item.value || '-'}</div>
                                        </div>
                                    </CCol>
                                ))}
                            </CRow>
                        </CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter className="border-0 mt-2 gap-3">
                    <CButton onClick={cerrarModal} className="btn-lasso btn-lasso-soft-secondary py-2 px-4 border-0">Cerrar</CButton>
                    {imagenSeleccionada && (
                        <CButton onClick={() => window.open(imagenSeleccionada, '_blank')} className="btn-lasso btn-lasso-primary py-2 px-4 shadow-sm">
                            <CIcon icon={cilExternalLink} className="me-2" /> Abrir Imagen
                        </CButton>
                    )}
                </CModalFooter>
            </CModal>
        </div>
    )
}

export default PagosEntrantes