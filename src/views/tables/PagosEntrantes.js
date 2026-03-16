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

    const filterFunction = null // Filtering handled by backend

    const searchFunction = useMemo(() => (pago, termino) => {
        return (
            String(pago?.cliente_id || '').toLowerCase().includes(termino) ||
            String(pago?.monto_pagado || '').toLowerCase().includes(termino) ||
            String(pago?.referencia_pago || '').toLowerCase().includes(termino) ||
            String(pago?.combo_adquirido || '').toLowerCase().includes(termino) ||
            String(pago?.medio_pago || '').toLowerCase().includes(termino) ||
            String(pago?.user_id || '').toLowerCase().includes(termino)
        )
    }, [])

    const totalMontoFiltrado = useMemo(() => {
        return statistics?.monto_total_aprobados || 0
    }, [statistics])

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
                onSuccess: (data) => {
                    console.log(data.mensaje)
                },
                onError: (err) => {
                    alert('Error al validar el pago: ' + (err.response?.data?.error || err.message))
                }
            })
        }
    }
    const columns = [
        { header: 'ID', key: 'id', className: 'fw-semibold' },
        {
            header: 'Fecha',
            key: 'fecha_comprobante',
            renderFunc: (pago) => {
                const fecha = pago.fecha_comprobante || pago.fecha
                if (!fecha) return '-'
                // Extract YYYY-MM-DD using regex to be safe
                const match = String(fecha).match(/(\d{4})[-/](\d{2})[-/](\d{2})/)
                if (match) {
                    return `${match[1]}-${match[2]}-${match[3]}`
                }
                return String(fecha).split(/[ T]/)[0].replace(/\//g, '-')
            }
        },
        {
            header: 'Hora',
            key: 'hora_comprobante',
            renderFunc: (pago) => pago.hora_comprobante || '-'
        },
        {
            header: 'Cliente',
            key: 'cliente',
            renderFunc: (pago) => <div className="fw-semibold">{pago.cliente_id || '-'}</div>
        },
        {
            header: 'Combo',
            key: 'combo',
            renderFunc: (pago) => <div className="fw-semibold">{pago.combo_adquirido || '-'}</div>
        },
        {
            header: 'Monto',
            key: 'monto',
            className: 'fw-semibold',
            renderFunc: (pago) => formatearMonto(pago.monto_pagado)
        },
        {
            header: 'Medio',
            key: 'medio',
            renderFunc: (pago) => {
                const medio = String(pago.medio_pago || '').toLowerCase()
                let estiloExtra = {}

                if (medio.includes('bre b') || medio.includes('bre-b')) {
                    estiloExtra = { backgroundColor: '#E1306C', color: 'white' }
                } else if (medio.includes('nequi')) {
                    estiloExtra = { backgroundColor: '#733190', color: 'white' }
                }

                return (
                    <CBadge
                        className="rounded-pill px-3 py-2 fw-semibold"
                        style={{
                            ...estiloExtra,
                            border: 'none',
                            ...(Object.keys(estiloExtra).length === 0 ? { backgroundColor: '#6c757d', color: 'white' } : {})
                        }}
                    >
                        {pago.medio_pago || '-'}
                    </CBadge>
                )
            }
        },
        { header: 'Referencia', key: 'referencia_pago', className: 'text-break' },
        {
            header: 'Estado',
            key: 'estado',
            renderFunc: (pago) => {
                const estado = String(pago.estado || '').toLowerCase()
                let color = 'secondary'

                if (estado === 'aprobado') {
                    color = 'success'
                } else if (estado === 'pendiente') {
                    color = 'warning'
                } else if (estado === 'repetido') {
                    color = 'info'
                } else if (estado === 'sin match') {
                    color = 'danger'
                } else if (estado === 'pago ya reportado') {
                    color = 'secondary'
                }

                return (
                    <CBadge color={color} className="rounded-pill px-3 py-2 fw-semibold">
                        {pago.estado ? pago.estado : 'Sin definir'}
                    </CBadge>
                )
            }
        },
        {
            header: 'Acciones',
            key: 'acciones',
            renderFunc: (pago) => (
                <div className="d-flex gap-2">
                    <CButton
                        className="btn-premium-action btn-action-view"
                        onClick={() => handleVerComprobante(pago)}
                        disabled={!pago?.comprobante_url}
                    >
                        <CIcon icon={cilExternalLink} size="sm" className="me-1" />
                        Ver
                    </CButton>
                    <CButton
                        className="btn-premium-action btn-action-validate"
                        onClick={() => handleValidarManual(pago)}
                    >
                        <CIcon icon={cilCheckCircle} size="sm" className="me-1" />
                        Validar
                    </CButton>
                </div>
            )
        },
    ]

    const filterControls = (
        <CRow className="g-3">
            <CCol md={4}>
                <CFormLabel className="fw-semibold small text-uppercase text-secondary">Fecha</CFormLabel>
                <CFormInput
                    type="date"
                    className="premium-input"
                    size="sm"
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                />
            </CCol>
            <CCol md={4}>
                <CFormLabel className="fw-semibold small text-uppercase text-secondary">Estado</CFormLabel>
                <CFormSelect className="premium-input" size="sm" value={filtroEstadoPago} onChange={(e) => setFiltroEstadoPago(e.target.value)}>
                    <option value="">Todos los estados</option>
                    {opcionesEstadoPago.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                </CFormSelect>
            </CCol>
            <CCol md={4}>
                <CFormLabel className="fw-semibold small text-uppercase text-secondary">Medio de Pago</CFormLabel>
                <CFormSelect className="premium-input" size="sm" value={filtroMedioPago} onChange={(e) => setFiltroMedioPago(e.target.value)}>
                    <option value="">Todos los medios</option>
                    {opcionesMedioPago.map((medio) => <option key={medio} value={medio}>{medio}</option>)}
                </CFormSelect>
            </CCol>
        </CRow>
    )

    if (isLoading) return <LoadingState message="Cargando pagos entrantes..." />
    if (error) return <ErrorState message="No se pudieron cargar los pagos entrantes" onRetry={() => window.location.reload()} />

    return (
        <>
            {statistics && (
                <CRow className="mb-4 p-2">
                    <CCol sm={6} lg={3}>
                        <CWidgetStatsC
                            className="mb-3 premium-card h-100 shadow-sm border-0 border-start border-4 border-primary"
                            icon={<CIcon icon={cilCheckCircle} height={36} className="text-primary" />}
                            progress={{ color: 'primary', value: 100 }}
                            text="Total Pagos Hoy"
                            title="Pagos del Día"
                            value={statistics.total_pagos_dia || 0}
                        />
                    </CCol>
                    <CCol sm={6} lg={3}>
                        <CWidgetStatsC
                            className="mb-3 premium-card h-100 shadow-sm border-0 border-start border-4 border-success"
                            icon={<CIcon icon={cilCheckCircle} height={36} className="text-success" />}
                            progress={{ color: 'success', value: 100 }}
                            text="Pagos validados satisfactoriamente"
                            title="Aprobados"
                            value={statistics.total_aprobados || 0}
                        />
                    </CCol>
                    <CCol sm={6} lg={3}>
                        <CWidgetStatsC
                            className="mb-3 premium-card h-100 shadow-sm border-0 border-start border-4 border-warning"
                            icon={<CIcon icon={cilCheckCircle} height={36} className="text-warning" />}
                            progress={{ color: 'warning', value: 100 }}
                            text="Pagos que requieren revisión"
                            title="Pendientes"
                            value={statistics.total_pendientes || 0}
                        />
                    </CCol>
                    <CCol sm={6} lg={3}>
                        <CWidgetStatsC
                            className="mb-3 premium-card h-100 shadow-sm border-0 border-start border-4 border-info"
                            icon={<CIcon icon={cilCheckCircle} height={36} className="text-info" />}
                            progress={{ color: 'info', value: 100 }}
                            text="Monto total de pagos aprobados"
                            title="Monto Aprobado"
                            value={formatearMonto(statistics.monto_total_aprobados || 0)}
                        />
                    </CCol>
                </CRow>
            )}

            <DataTable
                title="Pagos Entrantes"
                subtitle="Gestiona, filtra y revisa el estado de los pagos recibidos"
                data={data}
                columns={columns}
                searchFunction={searchFunction}
                filterFunction={filterFunction}
                filterControls={filterControls}
                onClear={() => {
                    setFiltroEstadoPago('')
                    setFiltroMedioPago('')
                    setFiltroFecha('')
                }}
                searchPlaceholder="Cliente, referencia, servicio o medio"
            />

            <CModal visible={modalVisible} onClose={cerrarModal} size="xl" alignment="center" className="premium-modal">
                <CModalHeader onClose={cerrarModal} className="border-0 pb-0">
                    <div>
                        <CModalTitle className="fw-bold fs-5">Detalle del pago</CModalTitle>
                        <p className="text-secondary small mb-0">Información asociada al comprobante seleccionado.</p>
                    </div>
                </CModalHeader>

                <CModalBody className="p-4">
                    <CRow className="g-3">
                        {/* Imagen del comprobante */}
                        <CCol md={5}>
                            <div className="h-100 d-flex align-items-center justify-content-center rounded-4 overflow-hidden"
                                style={{ background: '#f0f0f0', minHeight: '320px' }}>
                                {imagenSeleccionada ? (
                                    <img
                                        src={imagenSeleccionada}
                                        alt="Comprobante"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain', maxHeight: '480px' }}
                                    />
                                ) : (
                                    <div className="text-center text-secondary py-5">
                                        <div className="fs-6 fw-semibold mb-1">Sin imagen</div>
                                        <div className="small">No hay comprobante disponible</div>
                                    </div>
                                )}
                            </div>
                        </CCol>

                        {/* Campos de detalle */}
                        <CCol md={7}>
                            <CRow className="g-2">
                                {[
                                    { label: 'ID', value: pagoSeleccionado?.id },
                                    { label: 'CLIENTE', value: pagoSeleccionado?.cliente_id },
                                    { label: 'COMBO', value: pagoSeleccionado?.combo_adquirido, full: true },
                                    { label: 'MONTO', value: formatearMonto(pagoSeleccionado?.monto_pagado) },
                                    { label: 'ESTADO', value: pagoSeleccionado?.estado },
                                    { label: 'FECHA', value: (() => {
                                        const f = pagoSeleccionado?.fecha_comprobante || pagoSeleccionado?.fecha
                                        if (!f) return '-'
                                        const m = String(f).match(/(\d{4})[-/](\d{2})[-/](\d{2})/)
                                        return m ? `${m[1]}-${m[2]}-${m[3]}` : String(f).split(/[ T]/)[0]
                                    })() },
                                    { label: 'HORA', value: pagoSeleccionado?.hora_comprobante },
                                    { label: 'MEDIO', value: pagoSeleccionado?.medio_pago },
                                    { label: 'RED', value: pagoSeleccionado?.medio_pago },
                                    { label: 'REFERENCIA', value: pagoSeleccionado?.referencia_pago, full: true },
                                    { label: 'PAGO EMAIL ID', value: pagoSeleccionado?.pago_email_id, full: true },
                                    { label: 'DIFERENCIA', value: pagoSeleccionado?.diferencia_minutos != null ? `${pagoSeleccionado.diferencia_minutos} min` : '-', full: true },
                                ].map(({ label, value, full }) => (
                                    <CCol key={label} xs={full ? 12 : 6}>
                                        <div className="rounded-3 p-3"
                                            style={{ background: 'var(--cui-tertiary-bg, #f8f9fa)', height: '100%' }}>
                                            <div className="fw-semibold text-secondary"
                                                style={{ fontSize: '0.65rem', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                                                {label}
                                            </div>
                                            <div className="fw-semibold mt-1" style={{ fontSize: '0.9rem' }}>
                                                {value || '-'}
                                            </div>
                                        </div>
                                    </CCol>
                                ))}
                            </CRow>
                        </CCol>
                    </CRow>
                </CModalBody>

                <CModalFooter className="border-0 pt-0 gap-2">
                    {imagenSeleccionada && (
                        <CButton
                            color="dark"
                            className="rounded-pill px-4 fw-semibold"
                            onClick={() => window.open(imagenSeleccionada, '_blank')}
                        >
                            Abrir imagen
                        </CButton>
                    )}
                    <CButton color="secondary" variant="ghost" onClick={cerrarModal} className="rounded-pill px-4">
                        Cerrar
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default PagosEntrantes