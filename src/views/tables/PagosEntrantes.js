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
} from '@coreui/react'
import { usePagosEntrantes } from '../../core/hooks/usePagosEntrantes'
import { formatearMonto, formatearFecha, getBadgeColorEstado } from '../../utils/formatters'
import { LoadingState, ErrorState } from '../../components/TableFeedback'
import DataTable from '../../components/DataTable'

const PagosEntrantes = () => {
    const { data: pagosEntrantes, isLoading, error } = usePagosEntrantes()

    const [filtroEstadoPago, setFiltroEstadoPago] = useState('')
    const [filtroMatchEstado, setFiltroMatchEstado] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [imagenSeleccionada, setImagenSeleccionada] = useState('')
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null)

    const data = useMemo(() => (Array.isArray(pagosEntrantes) ? pagosEntrantes : []), [pagosEntrantes])

    const opcionesEstadoPago = useMemo(() => {
        return [...new Set(data.map((item) => item?.estado).filter(Boolean))]
    }, [data])

    const opcionesMatchEstado = useMemo(() => {
        return [...new Set(data.map((item) => item?.match_estado).filter(Boolean))]
    }, [data])

    const filterFunction = useMemo(() => (pago) => {
        const cumpleEstadoPago = !filtroEstadoPago || String(pago?.estado) === String(filtroEstadoPago)
        const cumpleMatchEstado = !filtroMatchEstado || String(pago?.match_estado) === String(filtroMatchEstado)
        return cumpleEstadoPago && cumpleMatchEstado
    }, [filtroEstadoPago, filtroMatchEstado])

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
        { header: 'Cliente', key: 'cliente', renderFunc: (pago) => <div className="fw-semibold">{pago.cliente_id || '-'}</div> },
        { header: 'Ordenante', key: 'ordenante', renderFunc: (pago) => <div className="fw-semibold">{pago.user_id || '-'}</div> },
        { header: 'Servicio', key: 'combo', renderFunc: (pago) => <div className="fw-semibold">{pago.combo_adquirido || '-'}</div> },
        { header: 'Monto', key: 'monto', className: 'fw-semibold', renderFunc: (pago) => formatearMonto(pago.monto_pagado) },
        { header: 'Medio', key: 'medio', renderFunc: (pago) => <div className="fw-semibold">{pago.medio_pago || '-'}</div> },
        {
            header: 'Estado Pago',
            key: 'estado',
            renderFunc: (pago) => (
                <CBadge color={getBadgeColorEstado(pago.estado)} className="rounded-pill px-3 py-2 fw-semibold">
                    {pago.estado || 'Sin estado'}
                </CBadge>
            )
        },
        {
            header: 'Match Estado',
            key: 'match_estado',
            renderFunc: (pago) => (
                <CBadge color={getBadgeColorEstado(pago.match_estado)} className="rounded-pill px-3 py-2 fw-semibold">
                    {pago.match_estado || 'Sin estado'}
                </CBadge>
            )
        },
        { header: 'Referencia', key: 'referencia_pago', className: 'text-break' },
        { header: 'Fecha Comprobante', key: 'fecha_comp', renderFunc: (pago) => formatearFecha(pago.fecha_comprobante) },
        {
            header: 'Comprobante',
            key: 'comprobante',
            renderFunc: (pago) => (
                <CButton color="primary" variant="outline" size="sm" onClick={() => handleVerComprobante(pago)} disabled={!pago?.comprobante_url}>
                    Ver
                </CButton>
            )
        },
    ]

    const filterControls = (
        <CRow className="g-2">
            <CCol md={6}>
                <CFormSelect size="sm" value={filtroEstadoPago} onChange={(e) => setFiltroEstadoPago(e.target.value)}>
                    <option value="">Estado Pago: Todos</option>
                    {opcionesEstadoPago.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
                </CFormSelect>
            </CCol>
            <CCol md={6}>
                <CFormSelect size="sm" value={filtroMatchEstado} onChange={(e) => setFiltroMatchEstado(e.target.value)}>
                    <option value="">Match: Todos</option>
                    {opcionesMatchEstado.map((estado) => <option key={estado} value={estado}>{estado}</option>)}
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
                    setFiltroMatchEstado('')
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