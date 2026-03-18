import React, { useMemo, useState } from 'react'
import {
    CFormInput,
    CRow,
    CCol,
    CButton,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CFormLabel,
    CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
import { useServicios, useCreateServicio, useUpdateServicio, useDeleteServicio } from '../../core/hooks/useServicios'
import { formatearMonto } from '../../utils/formatters'
import { LoadingState, ErrorState } from '../../components/TableFeedback'
import DataTable from '../../components/DataTable'

const ServiciosEnVenta = () => {
    const { data: serviciosData, isLoading, error } = useServicios()
    const createServicio = useCreateServicio()
    const updateServicio = useUpdateServicio()
    const deleteServicio = useDeleteServicio()

    const [modalCrearVisible, setModalCrearVisible] = useState(false)
    const [modalEditarVisible, setModalEditarVisible] = useState(false)
    const [modalEliminarVisible, setModalEliminarVisible] = useState(false)
    const [servicioSeleccionado, setServicioSeleccionado] = useState(null)

    const [formulario, setFormulario] = useState({
        nombre: '', slug: '', precio_usuario: '', precio_revendedor: '',
        estado: '', imagen: '', proveedor: '', telefono_proveedor: '',
    })

    const servicios = useMemo(() => Array.isArray(serviciosData) ? serviciosData : [], [serviciosData])

    const searchFunction = (servicio, termino) => {
        const t = (termino || '').toLowerCase()
        return (
            String(servicio?.id || '').toLowerCase().includes(t) ||
            String(servicio?.nombre || '').toLowerCase().includes(t) ||
            String(servicio?.slug || '').toLowerCase().includes(t) ||
            String(servicio?.proveedor || '').toLowerCase().includes(t)
        )
    }

    const resetFormulario = () => {
        setFormulario({
            nombre: '', slug: '', precio_usuario: '', precio_revendedor: '',
            estado: 1, imagen: '', proveedor: '', telefono_proveedor: '',
        })
    }

    const validarFormulario = () => {
        const camposObligatorios = [
            { field: 'nombre', label: 'Nombre' },
            { field: 'slug', label: 'Enlace' },
            { field: 'precio_usuario', label: 'Precio Cliente' },
            { field: 'precio_revendedor', label: 'Precio Revendedor' },
        ]

        const faltantes = camposObligatorios.filter(item => {
            const val = formulario[item.field]
            // Admitir 0 como valor válido
            return val === '' || val === null || val === undefined
        })

        if (faltantes.length > 0) {
            alert(`Por favor, completa: ${faltantes.map(f => f.label).join(', ')}`)
            return false
        }
        return true
    }

    const handleChangeFormulario = (e) => {
        const { name, value } = e.target
        setFormulario((prev) => ({ ...prev, [name]: value }))
    }

    const abrirModalCrear = () => { resetFormulario(); setModalCrearVisible(true); }
    const cerrarModalCrear = () => { setModalCrearVisible(false); resetFormulario(); }

    const abrirModalEditar = (servicio) => {
        setServicioSeleccionado(servicio)
        setFormulario({
            nombre: servicio?.nombre ?? '',
            slug: servicio?.slug ?? '',
            precio_usuario: servicio?.precio_usuario ?? '',
            precio_revendedor: servicio?.precio_revendedor ?? '',
            estado: servicio?.estado ?? 1,
            imagen: servicio?.imagen ?? '',
            proveedor: servicio?.proveedor ?? '',
            telefono_proveedor: servicio?.telefono_proveedor ?? '',
        })
        setModalEditarVisible(true)
    }

    const cerrarModalEditar = () => { setModalEditarVisible(false); setServicioSeleccionado(null); resetFormulario(); }

    const abrirModalEliminar = (servicio) => { setServicioSeleccionado(servicio); setModalEliminarVisible(true); }
    const cerrarModalEliminar = () => { setModalEliminarVisible(false); setServicioSeleccionado(null); }

    const handleCrearServicio = () => {
        if (!validarFormulario()) return
        
        const dataSanitada = {
            nombre: String(formulario.nombre),
            slug: String(formulario.slug),
            precio_usuario: Number(formulario.precio_usuario),
            precio_revendedor: Number(formulario.precio_revendedor),
            estado: 1,
            imagen: formulario.imagen || null,
            proveedor: formulario.proveedor || null,
            telefono_proveedor: formulario.telefono_proveedor || null,
        }

        console.log('Enviando datos (Crear):', dataSanitada)
        
        createServicio.mutate(dataSanitada, {
            onSuccess: () => cerrarModalCrear(),
            onError: (err) => {
                const msg = err.response?.data?.message || err.message
                alert('Error al crear: ' + msg)
            }
        })
    }

    const handleEditarServicio = () => {
        if (!servicioSeleccionado || !validarFormulario()) return
        
        const dataSanitada = {
            nombre: String(formulario.nombre),
            slug: String(formulario.slug),
            precio_usuario: Number(formulario.precio_usuario),
            precio_revendedor: Number(formulario.precio_revendedor),
            estado: Number(formulario.estado),
            imagen: formulario.imagen || null,
            proveedor: formulario.proveedor || null,
            telefono_proveedor: formulario.telefono_proveedor || null,
        }

        console.log('Enviando datos (Editar):', dataSanitada)

        updateServicio.mutate({ id: servicioSeleccionado.id, data: dataSanitada }, {
            onSuccess: () => cerrarModalEditar()
        })
    }

    const handleEliminarServicio = () => {
        if (!servicioSeleccionado) return
        deleteServicio.mutate(servicioSeleccionado.id, {
            onSuccess: () => cerrarModalEliminar()
        })
    }

    const columns = [
        { header: 'ID', key: 'id', renderFunc: (s) => <span className="text-muted fw-bold">#{s.id}</span> },
        {
            header: 'Servicio',
            key: 'nombre',
            renderFunc: (s) => (
                <div className="d-flex align-items-center gap-3">
                    {s.imagen && <img src={s.imagen} alt="" className="rounded-3 shadow-sm" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />}
                    <div>
                        <div className="fw-bold">{s.nombre}</div>
                        <div className="text-muted x-small">{s.slug}</div>
                    </div>
                </div>
            )
        },
        {
            header: 'Precios',
            key: 'precios',
            renderFunc: (s) => (
                <div>
                    <div className="fw-bold text-primary">{formatearMonto(s.precio_usuario)} <small className="text-muted fw-normal">(Cli)</small></div>
                    <div className="fw-semibold text-info small">{formatearMonto(s.precio_revendedor)} <small className="text-muted fw-normal">(Rev)</small></div>
                </div>
            )
        },
        {
            header: 'Estado',
            key: 'estado',
            renderFunc: (s) => (
                <span className={`badge-lasso badge-lasso-${Number(s.estado) === 1 ? 'success' : 'danger'} text-uppercase small`}>
                    {Number(s.estado) === 1 ? 'Activo' : 'Inactivo'}
                </span>
            )
        },
        {
            header: 'Proveedor',
            key: 'proveedor',
            renderFunc: (s) => (
                <div>
                    <div className="fw-medium small">{s.proveedor || 'N/A'}</div>
                    <div className="text-muted x-small">{s.telefono_proveedor}</div>
                </div>
            )
        },
        {
            header: 'Acciones',
            key: 'acciones',
            renderFunc: (s) => (
                <div className="d-flex gap-2">
                    <CButton className="btn-lasso btn-lasso-soft-primary" onClick={() => abrirModalEditar(s)} title="Editar">
                        <CIcon icon={cilPencil} size="sm" />
                    </CButton>
                    <CButton className="btn-lasso btn-lasso-soft-danger" onClick={() => abrirModalEliminar(s)} title="Eliminar">
                        <CIcon icon={cilTrash} size="sm" />
                    </CButton>
                </div>
            )
        },
    ]

    if (isLoading) return <LoadingState message="Cargando servicios en venta..." />
    if (error) return <ErrorState message="No se pudieron cargar los servicios" onRetry={() => window.location.reload()} />

    return (
        <div className="fade-up">
            <DataTable
                title="Catálogo de Servicios"
                subtitle="Administra la oferta de servicios, ajusta precios y gestiona la disponibilidad en tiempo real."
                data={servicios}
                columns={columns}
                searchFunction={searchFunction}
                onAddItem={abrirModalCrear}
                addItemLabel="Nuevo Servicio"
                searchPlaceholder="Buscar por nombre, slug o proveedor..."
            />

            {/* Modal Crear */}
            <CModal visible={modalCrearVisible} onClose={cerrarModalCrear} alignment="center" size="lg" className="lasso-modal">
                <CModalHeader className="border-0 pb-0">
                    <CModalTitle className="section-title h4">Agregar Servicio</CModalTitle>
                </CModalHeader>
                <CModalBody className="p-4">
                    <CRow className="g-4">
                        <CCol md={6}>
                            <CFormLabel className="lasso-label">Nombre del Servicio</CFormLabel>
                            <CFormInput name="nombre" value={formulario.nombre} onChange={handleChangeFormulario} className="lasso-input" placeholder="Ej: Netflix 1 Perfil" />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel className="lasso-label">Slug / Enlace</CFormLabel>
                            <CFormInput name="slug" value={formulario.slug} onChange={handleChangeFormulario} className="lasso-input" placeholder="ej-netflix-1" />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel className="lasso-label">Precio Cliente ($)</CFormLabel>
                            <CFormInput name="precio_usuario" type="number" value={formulario.precio_usuario} onChange={handleChangeFormulario} className="lasso-input" />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel className="lasso-label">Precio Revendedor ($)</CFormLabel>
                            <CFormInput name="precio_revendedor" type="number" value={formulario.precio_revendedor} onChange={handleChangeFormulario} className="lasso-input" />
                        </CCol>
                        <CCol md={12}>
                            <CFormLabel className="lasso-label">URL de la Imagen</CFormLabel>
                            <CFormInput name="imagen" value={formulario.imagen} onChange={handleChangeFormulario} className="lasso-input" placeholder="https://..." />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel className="lasso-label">Nombre Proveedor</CFormLabel>
                            <CFormInput name="proveedor" value={formulario.proveedor} onChange={handleChangeFormulario} className="lasso-input" />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel className="lasso-label">WhatsApp Proveedor</CFormLabel>
                            <CFormInput name="telefono_proveedor" value={formulario.telefono_proveedor} onChange={handleChangeFormulario} className="lasso-input" />
                        </CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter className="border-0 pt-0 gap-3">
                    <CButton onClick={cerrarModalCrear} className="btn-lasso btn-lasso-soft-secondary py-2 px-4 border-0">Cancelar</CButton>
                    <CButton onClick={handleCrearServicio} disabled={createServicio.isPending} className="btn-lasso btn-lasso-primary py-2 px-4 shadow-sm">
                        {createServicio.isPending ? 'Procesando...' : 'Crear Servicio'}
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Modal Editar */}
            <CModal visible={modalEditarVisible} onClose={cerrarModalEditar} alignment="center" size="lg" className="lasso-modal">
                <CModalHeader className="border-0 pb-0">
                    <CModalTitle className="section-title h4">Editar: {servicioSeleccionado?.nombre}</CModalTitle>
                </CModalHeader>
                <CModalBody className="p-4">
                    <CRow className="g-4">
                        <CCol md={6}>
                            <CFormLabel className="lasso-label">Nombre</CFormLabel>
                            <CFormInput name="nombre" value={formulario.nombre} onChange={handleChangeFormulario} className="lasso-input" />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel className="lasso-label">Slug</CFormLabel>
                            <CFormInput name="slug" value={formulario.slug} onChange={handleChangeFormulario} className="lasso-input" />
                        </CCol>
                        <CCol md={4}>
                            <CFormLabel className="lasso-label">Precio Cliente</CFormLabel>
                            <CFormInput name="precio_usuario" type="number" value={formulario.precio_usuario} onChange={handleChangeFormulario} className="lasso-input" />
                        </CCol>
                        <CCol md={4}>
                            <CFormLabel className="lasso-label">Precio Revendedor</CFormLabel>
                            <CFormInput name="precio_revendedor" type="number" value={formulario.precio_revendedor} onChange={handleChangeFormulario} className="lasso-input" />
                        </CCol>
                        <CCol md={4}>
                            <CFormLabel className="lasso-label">Estado</CFormLabel>
                            <CFormSelect name="estado" value={formulario.estado} onChange={handleChangeFormulario} className="lasso-input">
                                <option value={1}>Activo / Disponible</option>
                                <option value={0}>Inactivo / Pausado</option>
                            </CFormSelect>
                        </CCol>
                        <CCol md={12}>
                            <CFormLabel className="lasso-label">URL de Imagen</CFormLabel>
                            <CFormInput name="imagen" value={formulario.imagen} onChange={handleChangeFormulario} className="lasso-input" />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel className="lasso-label">Proveedor</CFormLabel>
                            <CFormInput name="proveedor" value={formulario.proveedor} onChange={handleChangeFormulario} className="lasso-input" />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel className="lasso-label">Teléfono</CFormLabel>
                            <CFormInput name="telefono_proveedor" value={formulario.telefono_proveedor} onChange={handleChangeFormulario} className="lasso-input" />
                        </CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter className="border-0 pt-0 gap-3">
                    <CButton onClick={cerrarModalEditar} className="btn-lasso btn-lasso-soft-secondary py-2 px-4 border-0">Cerrar</CButton>
                    <CButton onClick={handleEditarServicio} disabled={updateServicio.isPending} className="btn-lasso btn-lasso-primary py-2 px-4 shadow-sm">
                        {updateServicio.isPending ? 'Actualizando...' : 'Guardar Cambios'}
                    </CButton>
                </CModalFooter>
            </CModal>

            {/* Modal Eliminar */}
            <CModal visible={modalEliminarVisible} onClose={cerrarModalEliminar} alignment="center" className="lasso-modal">
                <CModalHeader className="border-0 pb-0">
                    <CModalTitle className="text-danger fw-bold">⚠️ ELIMINAR SERVICIO</CModalTitle>
                </CModalHeader>
                <CModalBody className="p-4 text-center">
                    <p className="fs-5">¿Estás seguro de que deseas eliminar permanentemente el servicio <br /><strong>{servicioSeleccionado?.nombre}</strong>?</p>
                    <p className="text-muted small">Esta acción no se puede deshacer y afectará al catálogo público.</p>
                </CModalBody>
                <CModalFooter className="border-0 pt-0 justify-content-center gap-3">
                    <CButton onClick={cerrarModalEliminar} className="btn-lasso btn-lasso-soft-secondary">No, Mantener</CButton>
                    <CButton onClick={handleEliminarServicio} className="btn-lasso btn-lasso-danger shadow-sm">Sí, Eliminar</CButton>
                </CModalFooter>
            </CModal>
        </div>
    )
}

export default ServiciosEnVenta