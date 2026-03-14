import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
} from '@coreui/react'
import { usePagosEntrantes } from '../../core/hooks/usePagosEntrantes'
import { formatearMonto, formatearFecha, getBadgeColorEstado } from '../../utils/formatters'
import { LoadingState, ErrorState } from '../../components/TableFeedback'
import DataTable from '../../components/DataTable'

const PagosEntrantes = () => {
    const navigate = useNavigate()
    const { data: pagosEntrantes, isLoading, error } = usePagosEntrantes()

    const [filtroEstadoPago, setFiltroEstadoPago] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [imagenSeleccionada, setImagenSeleccionada] = useState('')
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null)

    const data = useMemo(() => (Array.isArray(pagosEntrantes) ? pagosEntrantes : []), [pagosEntrantes])

    const opcionesEstadoPago = useMemo(() => {
        return [...new Set(data.map((item) => item?.estado).filter(Boolean))]
    }, [data])

    const filterFunction = useMemo(() => (pago) => {
        const cumpleEstadoPago = !filtroEstadoPago || String(pago?.estado) === String(filtroEstadoPago)
        return cumpleEstadoPago
    }, [filtroEstadoPago])

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
        return data.filter(filterFunction).reduce((acc, pago) => acc + Number(pago?.monto_pagado || 0), 0)
    }, [data, filterFunction])

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

    const columns = [
        { header: 'ID', key: 'id', className: 'fw-semibold' },
        {
            header: 'Fecha',
            key: 'fecha_comp',
            renderFunc: (pago) => formatearFecha(pago.fecha_comprobante)
        },
        {
            header: 'Hora',
            key: 'hora_comp',
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
                if (estado.includes('validado')) color = 'success'
                else if (estado.includes('pendiente')) color = 'warning'
                else if (estado.includes('rechazado')) color = 'danger'

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
                        color="primary"
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerComprobante(pago)}
                        disabled={!pago?.comprobante_url}
                    >
                        Ver
                    </CButton>
                    <CButton
                        color="success"
                        size="sm"
                        className="text-white fw-semibold"
                        onClick={() => navigate('/validar', { state: { url: pago.comprobante_url } })}
                    >
                        Validar
                    </CButton>
                </div>
            )
        },
    ]

    const filterControls = (
        <CRow className="g-2">
            <CCol md={12}>
                <CFormSelect size="sm" value={filtroEstadoPago} onChange={(e) => setFiltroEstadoPago(e.target.value)}>
                    <option value="">Estado Pago: Todos</option>
                    {opcionesEstadoPago.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                </CFormSelect>
            </CCol>
        </CRow>
    )

    if (isLoading) return <LoadingState message="Cargando pagos entrantes..." />
    if (error) return <ErrorState message="No se pudieron cargar los pagos entrantes" onRetry={() => window.location.reload()} />

    return (
        <>
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
                }}
                headerBadges={<CBadge color="success" className="px-3 py-2 rounded-pill">Total: {formatearMonto(totalMontoFiltrado)}</CBadge>}
                searchPlaceholder="Cliente, referencia, servicio o medio"
            />

            <CModal visible={modalVisible} onClose={cerrarModal} size="xl" alignment="center">
                <CModalHeader onClose={cerrarModal}>
                    <CModalTitle>
                        Comprobante
                        {pagoSeleccionado ? ` - ID ${pagoSeleccionado.id}${pagoSeleccionado.referencia_pago ? ` | Ref: ${pagoSeleccionado.referencia_pago}` : ''}` : ''}
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {imagenSeleccionada ? (
                        <div className="text-center">
                            <img src={imagenSeleccionada} alt="Comprobante" style={{ maxWidth: '100%', maxHeight: '75vh', objectFit: 'contain', borderRadius: '12px' }} />
                        </div>
                    ) : (
                        <div className="text-center text-medium-emphasis py-4">No hay comprobante disponible</div>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={cerrarModal}>Cerrar</CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default PagosEntrantes