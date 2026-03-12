import React, { useMemo, useState } from 'react'
import {
    CFormInput,
    CRow,
    CCol,
    CButton,
    CBadge,
} from '@coreui/react'
import { usePagosTotales } from '../../core/hooks/usePagosTotales'
import { formatearMonto, formatearFecha, normalizarFecha } from '../../utils/formatters'
import { LoadingState, ErrorState } from '../../components/TableFeedback'
import DataTable from '../../components/DataTable'

const PagosEmail = () => {
    const { data: pagosTotales, isLoading, error } = usePagosTotales()

    const HOY_STRING = useMemo(() => normalizarFecha(new Date()), [])
    const AYER_STRING = useMemo(() => {
        const ayer = new Date()
        ayer.setDate(ayer.getDate() - 1)
        return normalizarFecha(ayer)
    }, [])

    const [fechaFiltro, setFechaFiltro] = useState(HOY_STRING)
    const data = useMemo(() => (Array.isArray(pagosTotales) ? pagosTotales : []), [pagosTotales])

    const filterFunction = useMemo(() => (pago) => {
        const fechaPago = normalizarFecha(pago?.fecha_pago)
        return !fechaFiltro || fechaPago === fechaFiltro
    }, [fechaFiltro])

    const searchFunction = useMemo(() => (pago, termino) => {
        return (
            String(pago?.id || '').toLowerCase().includes(termino) ||
            String(pago?.ordenante || '').toLowerCase().includes(termino) ||
            String(pago?.monto || '').toLowerCase().includes(termino) ||
            String(pago?.message_id || '').toLowerCase().includes(termino)
        )
    }, [])

    const totalMontoHoy = useMemo(() => {
        return data.filter(pago => normalizarFecha(pago?.fecha_pago) === HOY_STRING)
            .reduce((acc, pago) => acc + Number(pago?.monto || 0), 0)
    }, [data, HOY_STRING])

    const columns = [
        { header: 'ID', key: 'id', className: 'fw-semibold' },
        { header: 'Ordenante', key: 'ordenante', renderFunc: (item) => <div className="fw-semibold">{item.ordenante || '-'}</div> },
        { header: 'Monto', key: 'monto', className: 'fw-semibold', renderFunc: (item) => formatearMonto(item.monto) },
        { header: 'Fecha pago', key: 'fecha_pago', renderFunc: (item) => formatearFecha(item.fecha_pago) },
        { header: 'Hora pago', key: 'hora_pago' },
        { header: 'Registrado en sistema', key: 'registrado_en_sistema', renderFunc: (item) => item.registrado_en_sistema || item.registrado_sistema || '-' },
        { header: 'Message ID', key: 'message_id', className: 'text-break' },
    ]

    if (isLoading) return <LoadingState message="Cargando pagos email..." />
    if (error) return <ErrorState message="No se pudieron cargar los pagos" onRetry={() => window.location.reload()} />

    const totalFiltrado = data.filter(filterFunction).reduce((acc, pago) => acc + Number(pago?.monto || 0), 0)

    const filterControls = (
        <CRow className="g-2 align-items-end">
            <CCol md={5}>
                <CFormInput type="date" value={fechaFiltro} onChange={(e) => setFechaFiltro(e.target.value)} />
            </CCol>
            <CCol md={7}>
                <div className="d-flex flex-wrap gap-1">
                    <CButton color="primary" variant="outline" size="sm" onClick={() => setFechaFiltro(HOY_STRING)}>Hoy</CButton>
                    <CButton color="secondary" variant="outline" size="sm" onClick={() => setFechaFiltro(AYER_STRING)}>Ayer</CButton>
                    <CButton color="secondary" variant="outline" size="sm" onClick={() => setFechaFiltro('')}>Todos</CButton>
                </div>
            </CCol>
        </CRow>
    )

    const headerBadges = (
        <>
            <CBadge color="success" className="px-3 py-2 rounded-pill">Total filtrado: {formatearMonto(totalFiltrado)}</CBadge>
            <CBadge color="warning" className="px-3 py-2 rounded-pill text-dark">Total hoy: {formatearMonto(totalMontoHoy)}</CBadge>
        </>
    )

    return (
        <DataTable
            title="Pagos Email"
            subtitle="Consulta y filtra los pagos recibidos por correo"
            data={data}
            columns={columns}
            searchFunction={searchFunction}
            filterFunction={filterFunction}
            filterControls={filterControls}
            onClear={() => setFechaFiltro(HOY_STRING)}
            headerBadges={headerBadges}
            searchPlaceholder="ID, ordenante, monto o message ID"
        />
    )
}

export default PagosEmail