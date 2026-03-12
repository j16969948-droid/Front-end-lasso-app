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
    CFormTextarea,
} from '@coreui/react'
import { useInventario } from '../../core/hooks/useInventario'

const ITEMS_PER_PAGE = 15

const Inventario = () => {
    const { data: inventarioData, isLoading, error } = useInventario()

    const [busqueda, setBusqueda] = useState('')
    const [paginaActual, setPaginaActual] = useState(1)

    const [inventario, setInventario] = useState([])

    const [modalCrearVisible, setModalCrearVisible] = useState(false)
    const [modalEditarVisible, setModalEditarVisible] = useState(false)
    const [modalEliminarVisible, setModalEliminarVisible] = useState(false)

    const [registroSeleccionado, setRegistroSeleccionado] = useState(null)

    const [formulario, setFormulario] = useState({
        servicio_id: '',
        fecha_compra: '',
        correo: '',
        clave: '',
        perfil: '',
        pin: '',
        fecha_vencimiento: '',
        telefono_asignado: '',
        cliente_id_asignado: '',
        estado: '',
        texto: '',
        created_at: '',
        updated_at: '',
    })

    useEffect(() => {
        setInventario(Array.isArray(inventarioData) ? inventarioData : [])
    }, [inventarioData])

    const datosFiltrados = useMemo(() => {
        const termino = busqueda.trim().toLowerCase()

        return inventario.filter((item) => {
            if (!termino) return true

            return (
                String(item?.id || '').toLowerCase().includes(termino) ||
                String(item?.servicio_id || '').toLowerCase().includes(termino) ||
                String(item?.fecha_compra || '').toLowerCase().includes(termino) ||
                String(item?.correo || '').toLowerCase().includes(termino) ||
                String(item?.clave || '').toLowerCase().includes(termino) ||
                String(item?.perfil || '').toLowerCase().includes(termino) ||
                String(item?.pin || '').toLowerCase().includes(termino) ||
                String(item?.fecha_vencimiento || '').toLowerCase().includes(termino) ||
                String(item?.telefono_asignado || '').toLowerCase().includes(termino) ||
                String(item?.cliente_id_asignado || '').toLowerCase().includes(termino) ||
                String(item?.estado || '').toLowerCase().includes(termino) ||
                String(item?.texto || '').toLowerCase().includes(termino) ||
                String(item?.created_at || '').toLowerCase().includes(termino) ||
                String(item?.updated_at || '').toLowerCase().includes(termino)
            )
        })
    }, [inventario, busqueda])

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
            servicio_id: '',
            fecha_compra: '',
            correo: '',
            clave: '',
            perfil: '',
            pin: '',
            fecha_vencimiento: '',
            telefono_asignado: '',
            cliente_id_asignado: '',
            estado: '',
            texto: '',
            created_at: '',
            updated_at: '',
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

    const abrirModalEditar = (item) => {
        setRegistroSeleccionado(item)
        setFormulario({
            servicio_id: item?.servicio_id || '',
            fecha_compra: item?.fecha_compra || '',
            correo: item?.correo || '',
            clave: item?.clave || '',
            perfil: item?.perfil || '',
            pin: item?.pin || '',
            fecha_vencimiento: item?.fecha_vencimiento || '',
            telefono_asignado: item?.telefono_asignado || '',
            cliente_id_asignado: item?.cliente_id_asignado || '',
            estado: item?.estado || '',
            texto: item?.texto || '',
            created_at: item?.created_at || '',
            updated_at: item?.updated_at || '',
        })
        setModalEditarVisible(true)
    }

    const cerrarModalEditar = () => {
        setModalEditarVisible(false)
        setRegistroSeleccionado(null)
        resetFormulario()
    }

    const abrirModalEliminar = (item) => {
        setRegistroSeleccionado(item)
        setModalEliminarVisible(true)
    }

    const cerrarModalEliminar = () => {
        setModalEliminarVisible(false)
        setRegistroSeleccionado(null)
    }

    const handleCrearRegistro = () => {
        const nuevoRegistro = {
            id: inventario.length > 0 ? Math.max(...inventario.map((item) => Number(item.id) || 0)) + 1 : 1,
            ...formulario,
        }

        setInventario((prev) => [nuevoRegistro, ...prev])
        cerrarModalCrear()
    }

    const handleEditarRegistro = () => {
        if (!registroSeleccionado) return

        setInventario((prev) =>
            prev.map((item) =>
                item.id === registroSeleccionado.id
                    ? {
                        ...item,
                        ...formulario,
                    }
                    : item,
            ),
        )

        cerrarModalEditar()
    }

    const handleEliminarRegistro = () => {
        if (!registroSeleccionado) return

        setInventario((prev) => prev.filter((item) => item.id !== registroSeleccionado.id))
        cerrarModalEliminar()
    }

    const formatearFecha = (valor) => {
        if (!valor) return '-'
        return valor
    }

    const getBadgeColorEstado = (estado) => {
        const valor = String(estado || '').toLowerCase().trim()

        if (
            valor.includes('activo') ||
            valor.includes('disponible') ||
            valor === '1' ||
            valor.includes('vendido') ||
            valor.includes('asignado')
        ) {
            return 'success'
        }

        if (valor.includes('pendiente') || valor.includes('proceso')) {
            return 'warning'
        }

        if (
            valor.includes('inactivo') ||
            valor.includes('0') ||
            valor.includes('cancelado') ||
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
                <div className="mt-3 fw-semibold">Cargando inventario...</div>
                <div className="text-medium-emphasis small">Estamos preparando la información para ti</div>
            </div>
        )
    }

    if (error) {
        return (
            <CCard className="border-0 shadow-sm">
                <CCardBody className="text-center py-5">
                    <div className="fs-5 fw-semibold mb-2">No se pudo cargar el inventario</div>
                    <div className="text-medium-emphasis mb-3">Ocurrió un error al consultar la información</div>
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
                            <div className="fs-4 fw-bold">Inventario</div>
                            <div className="text-medium-emphasis small">
                                Gestiona, crea, edita y elimina registros del inventario
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
                                + Agregar registro
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
                                    placeholder="ID, servicio, correo, perfil, pin, teléfono, estado..."
                                    value={busqueda}
                                    onChange={cambiarBusqueda}
                                />
                            </CCol>

                            <CCol md={2}>
                                <CButton color="secondary" variant="outline" className="w-100" onClick={limpiarBusqueda}>
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
                                    <CTableHeaderCell className="text-nowrap">Servicio ID</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Fecha compra</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Correo</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Clave</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Perfil</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">PIN</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Fecha vencimiento</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Teléfono asignado</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Cliente ID asignado</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Estado</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Texto</CTableHeaderCell>
                                    <CTableHeaderCell className="text-nowrap">Acciones</CTableHeaderCell>
                                </CTableRow>
                            </CTableHead>

                            <CTableBody>
                                {datosPaginados.length > 0 ? (
                                    datosPaginados.map((item) => (
                                        <CTableRow key={item.id}>
                                            <CTableDataCell className="fw-semibold">{item.id}</CTableDataCell>
                                            <CTableDataCell>{item.servicio_id || '-'}</CTableDataCell>
                                            <CTableDataCell>{formatearFecha(item.fecha_compra)}</CTableDataCell>
                                            <CTableDataCell>{item.correo || '-'}</CTableDataCell>
                                            <CTableDataCell>{item.clave || '-'}</CTableDataCell>
                                            <CTableDataCell>{item.perfil || '-'}</CTableDataCell>
                                            <CTableDataCell>{item.pin || '-'}</CTableDataCell>
                                            <CTableDataCell>{formatearFecha(item.fecha_vencimiento)}</CTableDataCell>
                                            <CTableDataCell>{item.telefono_asignado || '-'}</CTableDataCell>
                                            <CTableDataCell>{item.cliente_id_asignado || '-'}</CTableDataCell>
                                            <CTableDataCell>
                                                <CBadge
                                                    color={getBadgeColorEstado(item.estado)}
                                                    className="rounded-pill px-3 py-2 fw-semibold"
                                                >
                                                    {item.estado || '-'}
                                                </CBadge>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <div
                                                    style={{
                                                        maxWidth: '220px',
                                                        whiteSpace: 'nowrap',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                    }}
                                                    title={item.texto || ''}
                                                >
                                                    {item.texto || '-'}
                                                </div>
                                            </CTableDataCell>
                                            <CTableDataCell>
                                                <div className="d-flex gap-2 flex-wrap">
                                                    <CButton
                                                        color="primary"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => abrirModalEditar(item)}
                                                    >
                                                        Editar
                                                    </CButton>

                                                    <CButton
                                                        color="danger"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => abrirModalEliminar(item)}
                                                    >
                                                        Eliminar
                                                    </CButton>
                                                </div>
                                            </CTableDataCell>
                                        </CTableRow>
                                    ))
                                ) : (
                                    <CTableRow>
                                        <CTableDataCell colSpan={15} className="text-center py-5">
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
                            Mostrando <strong>{datosFiltrados.length === 0 ? 0 : (paginaSegura - 1) * ITEMS_PER_PAGE + 1}</strong>{' '}
                            - <strong>{Math.min(paginaSegura * ITEMS_PER_PAGE, datosFiltrados.length)}</strong> de{' '}
                            <strong>{datosFiltrados.length}</strong> registros
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

            <CModal visible={modalCrearVisible} onClose={cerrarModalCrear} alignment="center" size="xl">
                <CModalHeader onClose={cerrarModalCrear}>
                    <CModalTitle>Agregar registro</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormLabel>Servicio ID</CFormLabel>
                            <CFormInput name="servicio_id" value={formulario.servicio_id} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Fecha compra</CFormLabel>
                            <CFormInput name="fecha_compra" value={formulario.fecha_compra} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Correo</CFormLabel>
                            <CFormInput name="correo" value={formulario.correo} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Clave</CFormLabel>
                            <CFormInput name="clave" value={formulario.clave} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Perfil</CFormLabel>
                            <CFormInput name="perfil" value={formulario.perfil} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>PIN</CFormLabel>
                            <CFormInput name="pin" value={formulario.pin} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Fecha vencimiento</CFormLabel>
                            <CFormInput
                                name="fecha_vencimiento"
                                value={formulario.fecha_vencimiento}
                                onChange={handleChangeFormulario}
                            />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Teléfono asignado</CFormLabel>
                            <CFormInput
                                name="telefono_asignado"
                                value={formulario.telefono_asignado}
                                onChange={handleChangeFormulario}
                            />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Cliente ID asignado</CFormLabel>
                            <CFormInput
                                name="cliente_id_asignado"
                                value={formulario.cliente_id_asignado}
                                onChange={handleChangeFormulario}
                            />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Estado</CFormLabel>
                            <CFormInput name="estado" value={formulario.estado} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={12}>
                            <CFormLabel>Texto</CFormLabel>
                            <CFormTextarea name="texto" rows={3} value={formulario.texto} onChange={handleChangeFormulario} />
                        </CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={cerrarModalCrear}>
                        Cancelar
                    </CButton>
                    <CButton color="primary" onClick={handleCrearRegistro}>
                        Guardar
                    </CButton>
                </CModalFooter>
            </CModal>

            <CModal visible={modalEditarVisible} onClose={cerrarModalEditar} alignment="center" size="xl">
                <CModalHeader onClose={cerrarModalEditar}>
                    <CModalTitle>
                        Editar registro {registroSeleccionado ? `- ID ${registroSeleccionado.id}` : ''}
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormLabel>Servicio ID</CFormLabel>
                            <CFormInput name="servicio_id" value={formulario.servicio_id} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Fecha compra</CFormLabel>
                            <CFormInput name="fecha_compra" value={formulario.fecha_compra} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Correo</CFormLabel>
                            <CFormInput name="correo" value={formulario.correo} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Clave</CFormLabel>
                            <CFormInput name="clave" value={formulario.clave} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Perfil</CFormLabel>
                            <CFormInput name="perfil" value={formulario.perfil} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>PIN</CFormLabel>
                            <CFormInput name="pin" value={formulario.pin} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Fecha vencimiento</CFormLabel>
                            <CFormInput
                                name="fecha_vencimiento"
                                value={formulario.fecha_vencimiento}
                                onChange={handleChangeFormulario}
                            />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Teléfono asignado</CFormLabel>
                            <CFormInput
                                name="telefono_asignado"
                                value={formulario.telefono_asignado}
                                onChange={handleChangeFormulario}
                            />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Cliente ID asignado</CFormLabel>
                            <CFormInput
                                name="cliente_id_asignado"
                                value={formulario.cliente_id_asignado}
                                onChange={handleChangeFormulario}
                            />
                        </CCol>

                        <CCol md={6}>
                            <CFormLabel>Estado</CFormLabel>
                            <CFormInput name="estado" value={formulario.estado} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={12}>
                            <CFormLabel>Texto</CFormLabel>
                            <CFormTextarea name="texto" rows={3} value={formulario.texto} onChange={handleChangeFormulario} />
                        </CCol>

                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={cerrarModalEditar}>
                        Cancelar
                    </CButton>
                    <CButton color="primary" onClick={handleEditarRegistro}>
                        Actualizar
                    </CButton>
                </CModalFooter>
            </CModal>

            <CModal visible={modalEliminarVisible} onClose={cerrarModalEliminar} alignment="center">
                <CModalHeader onClose={cerrarModalEliminar}>
                    <CModalTitle>Eliminar registro</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    {registroSeleccionado ? (
                        <div>
                            ¿Seguro que deseas eliminar el registro{' '}
                            <strong>{registroSeleccionado.correo || `ID ${registroSeleccionado.id}`}</strong>?
                        </div>
                    ) : (
                        <div>No hay registro seleccionado.</div>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={cerrarModalEliminar}>
                        Cancelar
                    </CButton>
                    <CButton color="danger" onClick={handleEliminarRegistro}>
                        Eliminar
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default Inventario