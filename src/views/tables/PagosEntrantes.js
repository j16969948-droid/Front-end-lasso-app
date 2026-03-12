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
    CFormSelect,
    CFormInput,
    CRow,
    CCol,
    CButton,
    CSpinner,
    CBadge,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
} from '@coreui/react'
import { usePagosEntrantes } from '../../core/hooks/usePagosEntrantes'

const ITEMS_PER_PAGE = 15

const PagosEntrantes = () => {
    const { data: pagosEntrantes, isLoading, error } = usePagosEntrantes()

    const [filtroEstadoPago, setFiltroEstadoPago] = useState('')
    const [filtroMatchEstado, setFiltroMatchEstado] = useState('')
    const [busqueda, setBusqueda] = useState('')
    const [paginaActual, setPaginaActual] = useState(1)

    const [modalVisible, setModalVisible] = useState(false)
    const [imagenSeleccionada, setImagenSeleccionada] = useState('')
    const [pagoSeleccionado, setPagoSeleccionado] = useState(null)

    const data = Array.isArray(pagosEntrantes) ? pagosEntrantes : []

    const opcionesEstadoPago = useMemo(() => {
        const valores = data
            .map((item) => item?.estado)
            .filter((value) => value !== null && value !== undefined && value !== '')

        return [...new Set(valores)]
    }, [data])

    const opcionesMatchEstado = useMemo(() => {
        const valores = data
            .map((item) => item?.match_estado)
            .filter((value) => value !== null && value !== undefined && value !== '')

        return [...new Set(valores)]
    }, [data])

    const datosFiltrados = useMemo(() => {
        const termino = busqueda.trim().toLowerCase()

        return data.filter((pago) => {
            const cumpleEstadoPago =
                !filtroEstadoPago || String(pago?.estado) === String(filtroEstadoPago)

            const cumpleMatchEstado =
                !filtroMatchEstado || String(pago?.match_estado) === String(filtroMatchEstado)

            const cumpleBusqueda =
                !termino ||
                String(pago?.cliente || '').toLowerCase().includes(termino) ||
                String(pago?.referencia || '').toLowerCase().includes(termino) ||
                String(pago?.combo || '').toLowerCase().includes(termino) ||
                String(pago?.medio || '').toLowerCase().includes(termino) ||
                String(pago?.ordenante || '').toLowerCase().includes(termino)

            return cumpleEstadoPago && cumpleMatchEstado && cumpleBusqueda
        })
    }, [data, filtroEstadoPago, filtroMatchEstado, busqueda])

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

    const cambiarFiltroEstadoPago = (e) => {
        setFiltroEstadoPago(e.target.value)
        setPaginaActual(1)
    }

    const cambiarFiltroMatchEstado = (e) => {
        setFiltroMatchEstado(e.target.value)
        setPaginaActual(1)
    }

    const cambiarBusqueda = (e) => {
        setBusqueda(e.target.value)
        setPaginaActual(1)
    }

    const limpiarFiltros = () => {
        setFiltroEstadoPago('')
        setFiltroMatchEstado('')
        setBusqueda('')
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

    const handleVerComprobante = (pago) => {
        if (!pago?.comprobante) return

        setImagenSeleccionada(pago.comprobante)
        setPagoSeleccionado(pago)
        setModalVisible(true)
    }

    const cerrarModal = () => {
        setModalVisible(false)
        setImagenSeleccionada('')
        setPagoSeleccionado(null)
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

    const getBadgeColorEstadoPago = (estado) => {
        const valor = String(estado || '').toLowerCase()

        if (valor.includes('aprobado') || valor.includes('pagado') || valor.includes('completado')) {
            return 'success'
        }

        if (valor.includes('pendiente') || valor.includes('proceso')) {
            return 'warning'
        }

        if (valor.includes('rechazado') || valor.includes('fallido') || valor.includes('anulado')) {
            return 'danger'
        }

        return 'secondary'
    }

    const getBadgeColorMatchEstado = (estado) => {
        const valor = String(estado || '').toLowerCase().trim()

        if (valor.includes('encontrado') && !valor.includes('no encontrado')) {
            return 'success'
        }

        if (valor.includes('no encontrado') || valor.includes('sin match') || valor.includes('error')) {
            return 'danger'
        }

        if (valor.includes('pendiente') || valor.includes('revisión')) {
            return 'warning'
        }

        return 'secondary'
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
                <div className="mt-3 fw-semibold">Cargando pagos entrantes...</div>
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
                    <div className="fs-5 fw-semibold mb-2">No se pudieron cargar los pagos entrantes</div>
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
        <>
            <CCard className="border-0">
                <div className="border-bottom p-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                        <div>
                            <div className="fs-4 fw-bold">Pagos Entrantes</div>
                            <div className="text-medium-emphasis small">
                                Gestiona, filtra y revisa el estado de los pagos recibidos
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
                                Total: {formatearMonto(totalMontoFiltrado)}
                            </CBadge>
                        </div>
                    </div>
                </div>

                <CCardBody>
                    <div className="p-3 p-md-4 mb-4 rounded-4 border #4f46e5">
                        <CRow className="g-3 align-items-end">
                            <CCol md={4}>
                                <label className="form-label fw-semibold">Buscar</label>
                                <CFormInput
                                    placeholder="Cliente, referencia, servicio o medio"
                                    value={busqueda}
                                    onChange={cambiarBusqueda}
                                />
                            </CCol>

                            <CCol md={3}>
                                <label className="form-label fw-semibold">Estado de pago</label>
                                <CFormSelect value={filtroEstadoPago} onChange={cambiarFiltroEstadoPago}>
                                    <option value="">Todos</option>
                                    {opcionesEstadoPago.map((estado) => (
                                        <option key={estado} value={estado}>
                                            {estado}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                            <CCol md={3}>
                                <label className="form-label fw-semibold">Estado de match</label>
                                <CFormSelect value={filtroMatchEstado} onChange={cambiarFiltroMatchEstado}>
                                    <option value="">Todos</option>
                                    {opcionesMatchEstado.map((estado) => (
                                        <option key={estado} value={estado}>
                                            {estado}
                                        </option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                            <CCol md={2}>
                                <CButton
                                    color="secondary"
                                    variant="outline"
                                    className="w-100"
                                    onClick={limpiarFiltros}
                                >
                                    Limpiar
                                </CButton>
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
                                    <CTableHeaderCell className="text-nowrap">Cliente</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Ordenante</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Servicio</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Monto</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Medio</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Estado Pago</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Match Estado</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Referencia</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Fecha Comprobante</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Comprobante</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>

                            <CTableBody>
                                {datosPaginados.length > 0 ? (
                                    datosPaginados.map((pago) => (
                                        <CTableRow key={pago.id}>
                                            <CTableDataCell className="fw-semibold">{pago.id}</CTableDataCell>

                                            <CTableDataCell>
                                                <div className="fw-semibold">{pago.cliente || '-'}</div>
                                            </CTableDataCell>

                                            <CTableDataCell>{pago.ordenante || '-'}</CTableDataCell>

                                            <CTableDataCell>{pago.combo || '-'}</CTableDataCell>

                                            <CTableDataCell className="fw-semibold">
                                                {formatearMonto(pago.monto)}
                                            </CTableDataCell>

                                            <CTableDataCell>{pago.medio || '-'}</CTableDataCell>

                                            <CTableDataCell>
                                                <CBadge
                                                    color={getBadgeColorEstadoPago(pago.estado)}
                                                    className="rounded-pill px-3 py-2 fw-semibold"
                                                >
                                                    {pago.estado || 'Sin estado'}
                                                </CBadge>
                                            </CTableDataCell>

                                            <CTableDataCell>
                                                <CBadge
                                                    color={getBadgeColorMatchEstado(pago.match_estado)}
                                                    className="rounded-pill px-3 py-2 fw-semibold"
                                                >
                                                    {pago.match_estado || 'Sin estado'}
                                                </CBadge>
                                            </CTableDataCell>

                                            <CTableDataCell className="text-break">
                                                {pago.referencia || '-'}
                                            </CTableDataCell>

                                            <CTableDataCell>{formatearFecha(pago.fecha_comp)}</CTableDataCell>

                                            <CTableDataCell>
                                                <CButton
                                                    color="primary"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleVerComprobante(pago)}
                                                    disabled={!pago?.comprobante}
                                                >
                                                    Ver
                                                </CButton>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))
                                ) : (
                                    <CTableRow>
                                        <CTableDataCell colSpan={11} className="text-center py-5">
                                            <div className="fw-semibold fs-5 mb-1">No se encontraron registros</div>
                                            <div className="text-medium-emphasis mb-3">
                                                Ajusta los filtros o limpia la búsqueda para ver más resultados
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
                            <strong>
                                {Math.min(paginaSegura * ITEMS_PER_PAGE, datosFiltrados.length)}
                            </strong>{' '}
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

            <CModal
                visible={modalVisible}
                onClose={cerrarModal}
                size="xl"
                alignment="center"
            >
                <CModalHeader onClose={cerrarModal}>
                    <CModalTitle>
                        Comprobante
                        {pagoSeleccionado
                            ? ` - ID ${pagoSeleccionado.id}${pagoSeleccionado.referencia ? ` | Ref: ${pagoSeleccionado.referencia}` : ''}`
                            : ''}
                    </CModalTitle>
                </CModalHeader>

                <CModalBody>
                    {imagenSeleccionada ? (
                        <div className="text-center">
                            <img
                                src={imagenSeleccionada}
                                alt="Comprobante"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '75vh',
                                    objectFit: 'contain',
                                    borderRadius: '12px',
                                }}
                            />
                        </div>
                    ) : (
                        <div className="text-center text-medium-emphasis py-4">
                            No hay comprobante disponible
                        </div>
                    )}
                </CModalBody>

                <CModalFooter>
                    <CButton color="secondary" onClick={cerrarModal}>
                        Cerrar
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default PagosEntrantes