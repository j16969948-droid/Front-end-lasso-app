import React, { useMemo, useState, useEffect } from 'react'
import {
    CCard,
    CCardBody,
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
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CFormLabel,
} from '@coreui/react'
import { useServicios } from '../../core/hooks/useServicios'

const ITEMS_PER_PAGE = 15

const ServiciosEnVenta = () => {
    const { data: serviciosData, isLoading, error } = useServicios()

    const [busqueda, setBusqueda] = useState('')
    const [paginaActual, setPaginaActual] = useState(1)

    const [servicios, setServicios] = useState([])

    const [modalCrearVisible, setModalCrearVisible] = useState(false)
    const [modalEditarVisible, setModalEditarVisible] = useState(false)
    const [modalEliminarVisible, setModalEliminarVisible] = useState(false)

    const [servicioSeleccionado, setServicioSeleccionado] = useState(null)

    const [formulario, setFormulario] = useState({
        nombre: '',
        slug: '',
        precio_usuario: '',
        precio_revendedor: '',
        estado: '',
        imagen: '',
        proveedor: '',
        telefono_proveedor: '',
    })

    useEffect(() => {
        setServicios(Array.isArray(serviciosData) ? serviciosData : [])
    }, [serviciosData])

    const datosFiltrados = useMemo(() => {
        const termino = busqueda.trim().toLowerCase()

        return servicios.filter((servicio) => {
            if (!termino) return true

            return (
                String(servicio?.id || '').toLowerCase().includes(termino) ||
                String(servicio?.nombre || '').toLowerCase().includes(termino) ||
                String(servicio?.slug || '').toLowerCase().includes(termino) ||
                String(servicio?.estado || '').toLowerCase().includes(termino) ||
                String(servicio?.proveedor || '').toLowerCase().includes(termino) ||
                String(servicio?.telefono_proveedor || '').toLowerCase().includes(termino)
            )
        })
    }, [servicios, busqueda])

    const totalPaginas = Math.max(1, Math.ceil(datosFiltrados.length / ITEMS_PER_PAGE))
    const paginaSegura = Math.min(paginaActual, totalPaginas)

    const datosPaginados = useMemo(() => {
        const inicio = (paginaSegura - 1) * ITEMS_PER_PAGE
        const fin = inicio + ITEMS_PER_PAGE
        return datosFiltrados.slice(inicio, fin)
    }, [datosFiltrados, paginaSegura])

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

    const cambiarBusqueda = (e) => {
        setBusqueda(e.target.value)
        setPaginaActual(1)
    }

    const limpiarBusqueda = () => {
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

    const resetFormulario = () => {
        setFormulario({
            nombre: '',
            slug: '',
            precio_usuario: '',
            precio_revendedor: '',
            estado: '',
            imagen: '',
            proveedor: '',
            telefono_proveedor: '',
        })
    }

    const handleChangeFormulario = (e) => {
        const { name, value } = e.target
        setFormulario((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const abrirModalCrear = () => {
        resetFormulario()
        setModalCrearVisible(true)
    }

    const cerrarModalCrear = () => {
        setModalCrearVisible(false)
        resetFormulario()
    }

    const abrirModalEditar = (servicio) => {
        setServicioSeleccionado(servicio)
        setFormulario({
            nombre: servicio?.nombre || '',
            slug: servicio?.slug || '',
            precio_usuario: servicio?.precio_usuario || '',
            precio_revendedor: servicio?.precio_revendedor || '',
            estado: servicio?.estado || '',
            imagen: servicio?.imagen || '',
            proveedor: servicio?.proveedor || '',
            telefono_proveedor: servicio?.telefono_proveedor || '',
        })
        setModalEditarVisible(true)
    }

    const cerrarModalEditar = () => {
        setModalEditarVisible(false)
        setServicioSeleccionado(null)
        resetFormulario()
    }

    const abrirModalEliminar = (servicio) => {
        setServicioSeleccionado(servicio)
        setModalEliminarVisible(true)
    }

    const cerrarModalEliminar = () => {
        setModalEliminarVisible(false)
        setServicioSeleccionado(null)
    }

    const handleCrearServicio = () => {
        const nuevoServicio = {
            id: servicios.length > 0 ? Math.max(...servicios.map((item) => Number(item.id) || 0)) + 1 : 1,
            ...formulario,
        }

        setServicios((prev) => [nuevoServicio, ...prev])
        cerrarModalCrear()
    }

    const handleEditarServicio = () => {
        if (!servicioSeleccionado) return

        setServicios((prev) =>
            prev.map((item) =>
                item.id === servicioSeleccionado.id
                    ? {
                        ...item,
                        ...formulario,
                    }
                    : item,
            ),
        )

        cerrarModalEditar()
    }

    const handleEliminarServicio = () => {
        if (!servicioSeleccionado) return

        setServicios((prev) => prev.filter((item) => item.id !== servicioSeleccionado.id))
        cerrarModalEliminar()
    }

    const formatearMonto = (valor) => {
        const numero = Number(valor)
        if (Number.isNaN(numero)) return valor || '-'

        return new Intl.NumberFormat('es-CO', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numero)
    }

    const getBadgeColorEstado = (estado) => {
        const valor = String(estado || '').toLowerCase().trim()

        if (
            valor.includes('activo') ||
            valor.includes('disponible') ||
            valor.includes('habilitado') ||
            valor.includes('publicado')
        ) {
            return 'success'
        }

        if (valor.includes('pendiente') || valor.includes('proceso')) {
            return 'warning'
        }

        if (
            valor.includes('inactivo') ||
            valor.includes('agotado') ||
            valor.includes('oculto') ||
            valor.includes('bloqueado')
        ) {
            return 'danger'
        }

        return 'secondary'
    }

    if (isLoading) {
        return (
            <div className="text-center py-5">
                <CSpinner color="primary" />
                <div className="mt-3 fw-semibold">Cargando servicios en venta...</div>
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
                    <div className="fs-5 fw-semibold mb-2">No se pudieron cargar los servicios</div>
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
                            <div className="fs-4 fw-bold">Servicios en Venta</div>
                            <div className="text-medium-emphasis small">
                                Gestiona, crea, edita y elimina los servicios disponibles
                            </div>
                        </div>

                        <div className="d-flex flex-wrap gap-2">
                            <CBadge color="primary" className="px-3 py-2 rounded-pill">
                                Registros: {datosFiltrados.length}
                            </CBadge>
                            <CBadge color="info" className="px-3 py-2 rounded-pill">
                                Página {paginaSegura} / {totalPaginas}
                            </CBadge>
                            <CButton color="primary" className="rounded-pill px-3" onClick={abrirModalCrear}>
                                + Agregar servicio
                            </CButton>
                        </div>
                    </div>
                </div>

                <CCardBody>
                    <div className="p-3 p-md-4 mb-4 rounded-4 border">
                        <CRow className="g-3 align-items-end">
                            <CCol md={10}>
                                <CFormLabel className="fw-semibold">Buscar</CFormLabel>
                                <CFormInput
                                    placeholder="ID, nombre, slug, estado, proveedor o teléfono"
                                    value={busqueda}
                                    onChange={cambiarBusqueda}
                                />
                            </CCol>

                            <CCol md={2}>
                                <CButton
                                    color="secondary"
                                    variant="outline"
                                    className="w-100"
                                    onClick={limpiarBusqueda}
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
                                    <CTableHeaderCell className="text-nowrap">Nombre</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Slug</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Precio usuario</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Precio revendedor</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Estado</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Imagen</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Proveedor</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Teléfono proveedor</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Acciones</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>

                            <CTableBody>
                                {datosPaginados.length > 0 ? (
                                    datosPaginados.map((servicio) => (
                                        <CTableRow key={servicio.id}>
                                            <CTableDataCell className="fw-semibold">{servicio.id}</CTableDataCell>

                                            <CTableDataCell>
                                                <div className="fw-semibold">{servicio.nombre || '-'}</div>
                                            </CTableDataCell>

                                            <CTableDataCell>{servicio.slug || '-'}</CTableDataCell>

                                            <CTableDataCell className="fw-semibold">
                                                {formatearMonto(servicio.precio_usuario)}
                                            </CTableDataCell>

                                            <CTableDataCell className="fw-semibold">
                                                {formatearMonto(servicio.precio_revendedor)}
                                            </CTableDataCell>

                                            <CTableDataCell>
                                                <CBadge
                                                    color={Number(servicio.estado) === 1 ? 'success' : 'danger'}
                                                    className="rounded-pill px-3 py-2 fw-semibold"
                                                >
                                                    {Number(servicio.estado) === 1 ? 'Disponible' : 'No disponible'}
                                                </CBadge>
                                            </CTableDataCell>

                                            <CTableDataCell>
                                                {servicio.imagen ? (
                                                    <img
                                                        src={servicio.imagen}
                                                        alt={servicio.nombre}
                                                        style={{
                                                            width: '50px',
                                                            height: '50px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px',
                                                        }}
                                                    />
                                                ) : (
                                                    '-'
                                                )}
                                            </CTableDataCell>

                                            <CTableDataCell>{servicio.proveedor || '-'}</CTableDataCell>

                                            <CTableDataCell>{servicio.telefono_proveedor || '-'}</CTableDataCell>

                                            <CTableDataCell>
                                                <div className="d-flex gap-2 flex-wrap">
                                                    <CButton
                                                        color="primary"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => abrirModalEditar(servicio)}
                                                    >
                                                        Editar
                                                    </CButton>

                                                    <CButton
                                                        color="danger"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => abrirModalEliminar(servicio)}
                                                    >
                                                        Eliminar
                                                    </CButton>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))
                                ) : (
                                    <CTableRow>
                                        <CTableDataCell colSpan={10} className="text-center py-5">
                                            <div className="fw-semibold fs-5 mb-1">No se encontraron registros</div>
                                            <div className="text-medium-emphasis mb-3">
                                                Ajusta la búsqueda o limpia el filtro para ver más resultados
                                            </div>
                                            <CButton color="primary" variant="outline" onClick={limpiarBusqueda}>
                                                Limpiar búsqueda
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
                            <strong>{datosFiltrados.length === 0 ? 0 : (paginaSegura - 1) * ITEMS_PER_PAGE + 1}</strong>{' '}
                            - <strong>{Math.min(paginaSegura * ITEMS_PER_PAGE, datosFiltrados.length)}</strong>{' '}
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

            <CModal visible={modalCrearVisible} onClose={cerrarModalCrear} alignment="center" size="lg">
                <CModalHeader onClose={cerrarModalCrear}>
                    <CModalTitle>Agregar servicio</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormLabel>Nombre</CFormLabel>
                            <CFormInput name="nombre" value={formulario.nombre} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Slug</CFormLabel>
                            <CFormInput name="slug" value={formulario.slug} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Precio usuario</CFormLabel>
                            <CFormInput
                                name="precio_usuario"
                                type="number"
                                value={formulario.precio_usuario}
                                onChange={handleChangeFormulario}
                            />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Precio revendedor</CFormLabel>
                            <CFormInput
                                name="precio_revendedor"
                                type="number"
                                value={formulario.precio_revendedor}
                                onChange={handleChangeFormulario}
                            />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Estado</CFormLabel>
                            <CFormInput name="estado" value={formulario.estado} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Imagen</CFormLabel>
                            <CFormInput name="imagen" value={formulario.imagen} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Proveedor</CFormLabel>
                            <CFormInput
                                name="proveedor"
                                value={formulario.proveedor}
                                onChange={handleChangeFormulario}
                            />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Teléfono proveedor</CFormLabel>
                            <CFormInput
                                name="telefono_proveedor"
                                value={formulario.telefono_proveedor}
                                onChange={handleChangeFormulario}
                            />
                        </CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={cerrarModalCrear}>
                        Cancelar
                    </CButton>
                    <CButton color="primary" onClick={handleCrearServicio}>
                        Guardar
                    </CButton>
                </CModalFooter>
            </CModal>

            <CModal visible={modalEditarVisible} onClose={cerrarModalEditar} alignment="center" size="lg">
                <CModalHeader onClose={cerrarModalEditar}>
                    <CModalTitle>
                        Editar servicio {servicioSeleccionado ? `- ID ${servicioSeleccionado.id}` : ''}
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormLabel>Nombre</CFormLabel>
                            <CFormInput name="nombre" value={formulario.nombre} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Slug</CFormLabel>
                            <CFormInput name="slug" value={formulario.slug} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Precio usuario</CFormLabel>
                            <CFormInput
                                name="precio_usuario"
                                type="number"
                                value={formulario.precio_usuario}
                                onChange={handleChangeFormulario}
                            />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Precio revendedor</CFormLabel>
                            <CFormInput
                                name="precio_revendedor"
                                type="number"
                                value={formulario.precio_revendedor}
                                onChange={handleChangeFormulario}
                            />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Estado</CFormLabel>
                            <CFormInput name="estado" value={formulario.estado} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Imagen</CFormLabel>
                            <CFormInput name="imagen" value={formulario.imagen} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Proveedor</CFormLabel>
                            <CFormInput
                                name="proveedor"
                                value={formulario.proveedor}
                                onChange={handleChangeFormulario}
                            />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Teléfono proveedor</CFormLabel>
                            <CFormInput
                                name="telefono_proveedor"
                                value={formulario.telefono_proveedor}
                                onChange={handleChangeFormulario}
                            />
                        </CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={cerrarModalEditar}>
                        Cancelar
                    </CButton>
                    <CButton color="primary" onClick={handleEditarServicio}>
                        Actualizar
                    </CButton>
                </CModalFooter>
            </CModal>

            <CModal visible={modalEliminarVisible} onClose={cerrarModalEliminar} alignment="center">
                <CModalHeader onClose={cerrarModalEliminar}>
                    <CModalTitle>Eliminar servicio</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {servicioSeleccionado ? (
                        <div>
                            ¿Seguro que deseas eliminar el servicio{' '}
                            <strong>{servicioSeleccionado.nombre || `ID ${servicioSeleccionado.id}`}</strong>?
                        </div>
                    ) : (
                        <div>No hay servicio seleccionado.</div>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={cerrarModalEliminar}>
                        Cancelar
                    </CButton>
                    <CButton color="danger" onClick={handleEliminarServicio}>
                        Eliminar
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default ServiciosEnVenta