import React, { useMemo, useState } from 'react'
import {
    CCard,
    CCardBody,
    CCardHeader,
    CTable,
    CTableBody,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableDataCell,
    CFormInput,
    CRow,
    CCol,
    CButton,
    CSpinner,
    CBadge,
} from '@coreui/react'
import { usePagosTotales } from '../../core/hooks/usePagosTotales'

const ITEMS_PER_PAGE = 15

const PagosEmail = () => {
    const { data: pagosTotales, isLoading, error } = usePagosTotales()

    const formatearFechaInput = (fecha) => {
        const year = fecha.getFullYear()
        const month = String(fecha.getMonth() + 1).padStart(2, '0')
        const day = String(fecha.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const hoy = new Date()
    const ayerDate = new Date()
    ayerDate.setDate(hoy.getDate() - 1)

    const HOY_STRING = formatearFechaInput(hoy)
    const AYER_STRING = formatearFechaInput(ayerDate)

    const [busqueda, setBusqueda] = useState('')
    const [paginaActual, setPaginaActual] = useState(1)
    const [fechaFiltro, setFechaFiltro] = useState(HOY_STRING)

    const data = Array.isArray(pagosTotales) ? pagosTotales : []

    const normalizarFecha = (fecha) => {
        if (!fecha) return ''

        if (typeof fecha === 'string') {
            const soloFecha = fecha.includes('T') ? fecha.split('T')[0] : fecha.slice(0, 10)
            if (/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) return soloFecha

            const parsed = new Date(fecha)
            if (!Number.isNaN(parsed.getTime())) {
                return formatearFechaInput(parsed)
            }
        }

        const parsed = new Date(fecha)
        if (Number.isNaN(parsed.getTime())) return ''

        return formatearFechaInput(parsed)
    }

    const datosHoy = useMemo(() => {
        return data.filter((pago) => normalizarFecha(pago?.fecha_pago) === HOY_STRING)
    }, [data])

    const datosFiltrados = useMemo(() => {
        const termino = busqueda.trim().toLowerCase()

        return data.filter((pago) => {
            const fechaPago = normalizarFecha(pago?.fecha_pago)

            const cumpleFecha = !fechaFiltro || fechaPago === fechaFiltro

            const cumpleBusqueda =
                !termino ||
                String(pago?.id || '').toLowerCase().includes(termino) ||
                String(pago?.ordenante || '').toLowerCase().includes(termino) ||
                String(pago?.monto || '').toLowerCase().includes(termino) ||
                String(pago?.message_id || '').toLowerCase().includes(termino)

            return cumpleFecha && cumpleBusqueda
        })
    }, [data, busqueda, fechaFiltro])

    const totalPaginas = Math.max(1, Math.ceil(datosFiltrados.length / ITEMS_PER_PAGE))
    const paginaSegura = Math.min(paginaActual, totalPaginas)

    const datosPaginados = useMemo(() => {
        const inicio = (paginaSegura - 1) * ITEMS_PER_PAGE
        const fin = inicio + ITEMS_PER_PAGE
        return datosFiltrados.slice(inicio, fin)
    }, [datosFiltrados, paginaSegura])

    const totalMontoFiltrado = useMemo(() => {
        return datosFiltrados.reduce((acc, pago) => acc + Number(pago?.monto || 0), 0)
    }, [datosFiltrados])

    const totalMontoHoy = useMemo(() => {
        return datosHoy.reduce((acc, pago) => acc + Number(pago?.monto || 0), 0)
    }, [datosHoy])

    const cambiarBusqueda = (e) => {
        setBusqueda(e.target.value)
        setPaginaActual(1)
    }

    const cambiarFecha = (e) => {
        setFechaFiltro(e.target.value)
        setPaginaActual(1)
    }

    const filtrarHoy = () => {
        setFechaFiltro(HOY_STRING)
        setPaginaActual(1)
    }

    const filtrarAyer = () => {
        setFechaFiltro(AYER_STRING)
        setPaginaActual(1)
    }

    const limpiarFiltros = () => {
        setBusqueda('')
        setFechaFiltro('')
        setPaginaActual(1)
    }

    const irPaginaAnterior = () => {
        if (paginaSegura > 1) {
            setPaginaActual(paginaSegura - 1)
        }
    }

    const irPaginaSiguiente = () => {
        if (paginaSegura < totalPaginas) {
            setPaginaActual(paginaSegura + 1)
        }
    }

    const irAPagina = (pagina) => {
        setPaginaActual(pagina)
    }

    const formatearMonto = (valor) => {
        const numero = Number(valor)
        if (Number.isNaN(numero)) return valor || '-'

        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numero)
    }

    const formatearFecha = (fecha) => {
        if (!fecha) return '-'

        const date = new Date(fecha)
        if (Number.isNaN(date.getTime())) return fecha

        return new Intl.DateTimeFormat('es-CO', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
        }).format(date)
    }

    const formatearHora = (hora) => {
        if (!hora) return '-'
        return hora
    }

    const paginasVisibles = useMemo(() => {
        const total = totalPaginas
        const actual = paginaSegura
        const rango = []

        let inicio = Math.max(1, actual - 2)
        let fin = Math.min(total, actual + 2)

        if (actual <= 3) fin = Math.min(total, 5)
        if (actual >= total - 2) inicio = Math.max(1, total - 4)

        for (let i = inicio; i <= fin; i += 1) {
            rango.push(i)
        }

        return rango
    }, [paginaSegura, totalPaginas])

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <CSpinner color="primary" />
                <div className="mt-3 fw-semibold">Cargando pagos email...</div>
                <div className="text-medium-emphasis small">
                    Estamos preparando la información para ti
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <CCard className="border-0 shadow-sm">
                <CCardBody className="text-center py-5">
                    <div className="fs-5 fw-semibold mb-2">No se pudieron cargar los pagos</div>
                    <div className="text-medium-emphasis mb-3">
                        Ocurrió un error al consultar la información
                    </div>
                    <CButton color="primary" onClick={() => window.location.reload()}>
                        Reintentar
                    </CButton>
                </CCardBody>
            </CCard>
        )
    }

    return (
        <CCard className="border-0 shadow-sm">
            <CCardHeader className="border-bottom #4f46e5">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                        <div className="fs-4 fw-bold">Pagos Email</div>
                        <div className="text-medium-emphasis small">
                            Consulta y filtra los pagos recibidos por correo
                        </div>
                    </div>

                    <div className="d-flex flex-wrap gap-2">
                        <CBadge color="primary" className="px-3 py-2 rounded-pill">
                            Registros: {datosFiltrados.length}
                        </CBadge>
                        <CBadge color="info" className="px-3 py-2 rounded-pill">
                            Página {paginaSegura} / {totalPaginas}
                        </CBadge>
                        <CBadge color="success" className="px-3 py-2 rounded-pill">
                            Total filtrado: {formatearMonto(totalMontoFiltrado)}
                        </CBadge>
                        <CBadge color="warning" className="px-3 py-2 rounded-pill text-dark">
                            Total hoy: {formatearMonto(totalMontoHoy)}
                        </CBadge>
                    </div>
                </div>
            </CCardHeader>

            <CCardBody>
                <div className="p-3 p-md-4 mb-4 rounded-4 border #4f46e5">
                    <CRow className="g-3 align-items-end">
                        <CCol md={4}>
                            <label className="form-label fw-semibold">Buscar</label>
                            <CFormInput
                                placeholder="ID, ordenante, monto o message ID"
                                value={busqueda}
                                onChange={cambiarBusqueda}
                            />
                        </CCol>

                        <CCol md={3}>
                            <label className="form-label fw-semibold">Fecha de pago</label>
                            <CFormInput type="date" value={fechaFiltro} onChange={cambiarFecha} />
                        </CCol>

                        <CCol md={5}>
                            <div className="d-flex flex-wrap gap-2">
                                <CButton color="primary" variant="outline" onClick={filtrarHoy}>
                                    Hoy
                                </CButton>
                                <CButton color="secondary" variant="outline" onClick={filtrarAyer}>
                                    Ayer
                                </CButton>
                                <CButton color="secondary" variant="outline" onClick={limpiarFiltros}>
                                    Todos
                                </CButton>
                            </div>
                        </CCol>
                    </CRow>
                </div>

                <div
                    className="table-responsive rounded-4 overflow-hidden"
                    style={{
                        border: '1px solid #2f3a4f',
                        backgroundColor: '#1b2230',
                    }}
                >
                    <CTable
                        hover
                        align="middle"
                        className="mb-0"
                        style={{
                            color: '#f8f9fa',
                            marginBottom: 0,
                        }}
                    >
                        <CTableHead>
                            <CTableRow
                                style={{
                                    backgroundColor: '#f8f9fa',
                                    color: '#111827',
                                }}
                            >
                                <CTableHeaderCell className="text-nowrap">ID</CTableHeaderCell>
                                <CTableHeaderCell className="text-nowrap">Ordenante</CTableHeaderCell>
                                <CTableHeaderCell className="text-nowrap">Monto</CTableHeaderCell>
                                <CTableHeaderCell className="text-nowrap">Fecha pago</CTableHeaderCell>
                                <CTableHeaderCell className="text-nowrap">Hora pago</CTableHeaderCell>
                                <CTableHeaderCell className="text-nowrap">Registrado en sistema</CTableHeaderCell>
                                <CTableHeaderCell className="text-nowrap">Message ID</CTableHeaderCell>
                            </CTableRow>
                        </CTableHead>

                        <CTableBody>
                            {datosPaginados.length > 0 ? (
                                datosPaginados.map((pago, index) => (
                                    <CTableRow key={pago.id ?? `${pago.message_id}-${index}`}>
                                        <CTableDataCell className="fw-semibold">
                                            {pago.id || '-'}
                                        </CTableDataCell>

                                        <CTableDataCell>
                                            <div className="fw-semibold">{pago.ordenante || '-'}</div>
                                        </CTableDataCell>

                                        <CTableDataCell className="fw-semibold">
                                            {formatearMonto(pago.monto)}
                                        </CTableDataCell>

                                        <CTableDataCell>{formatearFecha(pago.fecha_pago)}</CTableDataCell>

                                        <CTableDataCell>{formatearHora(pago.hora_pago)}</CTableDataCell>

                                        <CTableDataCell>
                                            {pago.registrado_en_sistema || pago.registrado_sistema || '-'}
                                        </CTableDataCell>

                                        <CTableDataCell className="text-break">
                                            {pago.message_id || '-'}
                                        </CTableDataCell>
                                    </CTableRow>
                                ))
                            ) : (
                                <CTableRow>
                                    <CTableDataCell colSpan={7} className="text-center py-5">
                                        <div className="fw-semibold fs-5 mb-1">No se encontraron registros</div>
                                        <div className="text-medium-emphasis mb-3">
                                            Ajusta la fecha o limpia los filtros para ver más resultados
                                        </div>
                                        <CButton color="primary" variant="outline" onClick={limpiarFiltros}>
                                            Limpiar filtros
                                        </CButton>
                                    </CTableDataCell>
                                </CTableRow>
                            )}
                        </CTableBody>
                    </CTable>
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-4">
                    <div className="text-medium-emphasis small">
                        Mostrando{' '}
                        <strong>
                            {datosFiltrados.length === 0 ? 0 : (paginaSegura - 1) * ITEMS_PER_PAGE + 1}
                        </strong>{' '}
                        -{' '}
                        <strong>{Math.min(paginaSegura * ITEMS_PER_PAGE, datosFiltrados.length)}</strong>{' '}
                        de <strong>{datosFiltrados.length}</strong> registros
                    </div>

                    <div className="d-flex align-items-center gap-2 flex-wrap">
                        <CButton
                            color="secondary"
                            variant="outline"
                            onClick={irPaginaAnterior}
                            disabled={paginaSegura === 1}
                        >
                            Anterior
                        </CButton>

                        {paginasVisibles.map((pagina) => (
                            <CButton
                                key={pagina}
                                color={pagina === paginaSegura ? 'primary' : 'secondary'}
                                variant={pagina === paginaSegura ? undefined : 'outline'}
                                onClick={() => irAPagina(pagina)}
                            >
                                {pagina}
                            </CButton>
                        ))}

                        <CButton
                            color="primary"
                            variant="outline"
                            onClick={irPaginaSiguiente}
                            disabled={paginaSegura === totalPaginas}
                        >
                            Siguiente
                        </CButton>
                    </div>
                </div>
            </CCardBody>
        </CCard>
    )
}

export default PagosEmail