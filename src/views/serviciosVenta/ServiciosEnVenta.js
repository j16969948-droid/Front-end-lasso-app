import React, { useMemo, useState, useEffect } from 'react'
import {
    CFormInput,
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
    CFormSelect,
} from '@coreui/react'
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
        return (
            String(servicio?.id || '').toLowerCase().includes(termino) ||
            String(servicio?.nombre || '').toLowerCase().includes(termino) ||
            String(servicio?.slug || '').toLowerCase().includes(termino) ||
            String(servicio?.estado || '').toLowerCase().includes(termino) ||
            String(servicio?.proveedor || '').toLowerCase().includes(termino) ||
            String(servicio?.telefono_proveedor || '').toLowerCase().includes(termino)
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
            { field: 'slug', label: 'Slug' },
            { field: 'precio_usuario', label: 'Precio usuario' },
            { field: 'precio_revendedor', label: 'Precio revendedor' },
            { field: 'imagen', label: 'Imagen' },
        ]

        const faltantes = camposObligatorios.filter(item => !formulario[item.field])

        if (faltantes.length > 0) {
            alert(`Por favor, completa los siguientes campos obligatorios: ${faltantes.map(f => f.label).join(', ')}`)
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

    const cerrarModalEditar = () => { setModalEditarVisible(false); setServicioSeleccionado(null); resetFormulario(); }

    const abrirModalEliminar = (servicio) => { setServicioSeleccionado(servicio); setModalEliminarVisible(true); }
    const cerrarModalEliminar = () => { setModalEliminarVisible(false); setServicioSeleccionado(null); }

    const handleCrearServicio = () => {
        if (!validarFormulario()) return
        createServicio.mutate(formulario, {
            onSuccess: () => {
                cerrarModalCrear()
            }
        })
    }

    const handleEditarServicio = () => {
        if (!servicioSeleccionado) return
        if (!validarFormulario()) return
        updateServicio.mutate({ id: servicioSeleccionado.id, data: formulario }, {
            onSuccess: () => {
                cerrarModalEditar()
            }
        })
    }

    const handleEliminarServicio = () => {
        if (!servicioSeleccionado) return
        deleteServicio.mutate(servicioSeleccionado.id, {
            onSuccess: () => {
                cerrarModalEliminar()
            }
        })
    }

    const columns = [
        { header: 'ID', key: 'id', className: 'fw-semibold' },
        { header: 'Nombre', key: 'nombre', renderFunc: (s) => <div className="fw-semibold">{s.nombre || '-'}</div> },
        { header: 'Slug', key: 'slug' },
        { header: 'Precio usuario', key: 'precio_usuario', className: 'fw-semibold', renderFunc: (s) => formatearMonto(s.precio_usuario) },
        { header: 'Precio revendedor', key: 'precio_revendedor', className: 'fw-semibold', renderFunc: (s) => formatearMonto(s.precio_revendedor) },
        { 
            header: 'Estado', 
            key: 'estado', 
            renderFunc: (s) => (
                <CBadge color={Number(s.estado) === 1 ? 'success' : 'danger'} className="rounded-pill px-3 py-2 fw-semibold">
                    {Number(s.estado) === 1 ? 'Disponible' : 'No disponible'}
                </CBadge>
            ) 
        },
        { 
            header: 'Imagen', 
            key: 'imagen', 
            renderFunc: (s) => s.imagen ? <img src={s.imagen} alt={s.nombre} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '8px' }} /> : '-' 
        },
        { header: 'Proveedor', key: 'proveedor' },
        { header: 'Teléfono', key: 'telefono_proveedor' },
        { 
            header: 'Acciones', 
            key: 'acciones', 
            renderFunc: (s) => (
                <div className="d-flex gap-2">
                    <CButton color="primary" variant="outline" size="sm" onClick={() => abrirModalEditar(s)}>Editar</CButton>
                    <CButton color="danger" variant="outline" size="sm" onClick={() => abrirModalEliminar(s)}>Eliminar</CButton>
                </div>
            ) 
        },
    ]

    if (isLoading) return <LoadingState message="Cargando servicios en venta..." />
    if (error) return <ErrorState message="No se pudieron cargar los servicios" onRetry={() => window.location.reload()} />

    return (
        <>
            <DataTable 
                title="Servicios en Venta"
                subtitle="Gestiona, crea, edita y elimina los servicios disponibles"
                data={servicios}
                columns={columns}
                searchFunction={searchFunction}
                onAddItem={abrirModalCrear}
                addItemLabel="+ Agregar servicio"
                searchPlaceholder="ID, nombre, slug, estado, proveedor o teléfono"
            />

            <CModal visible={modalCrearVisible} onClose={cerrarModalCrear} alignment="center" size="lg">
                <CModalHeader onClose={cerrarModalCrear}><CModalTitle>Agregar servicio</CModalTitle></CModalHeader>
                <CModalBody>
                    <CRow className="g-3">
                        <CCol md={6}><CFormLabel>Nombre <span className="text-danger">*</span></CFormLabel><CFormInput name="nombre" value={formulario.nombre} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Slug <span className="text-danger">*</span></CFormLabel><CFormInput name="slug" value={formulario.slug} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Precio usuario <span className="text-danger">*</span></CFormLabel><CFormInput name="precio_usuario" type="number" value={formulario.precio_usuario} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Precio revendedor <span className="text-danger">*</span></CFormLabel><CFormInput name="precio_revendedor" type="number" value={formulario.precio_revendedor} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Imagen <span className="text-danger">*</span></CFormLabel><CFormInput name="imagen" value={formulario.imagen} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Proveedor</CFormLabel><CFormInput name="proveedor" value={formulario.proveedor} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Teléfono proveedor</CFormLabel><CFormInput name="telefono_proveedor" value={formulario.telefono_proveedor} onChange={handleChangeFormulario} /></CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={cerrarModalCrear}>Cancelar</CButton>
                    <CButton color="primary" onClick={handleCrearServicio} disabled={createServicio.isPending}>
                        {createServicio.isPending ? 'Guardando...' : 'Guardar'}
                    </CButton>
                </CModalFooter>
            </CModal>

            <CModal visible={modalEditarVisible} onClose={cerrarModalEditar} alignment="center" size="lg">
                <CModalHeader onClose={cerrarModalEditar}><CModalTitle>Editar servicio {servicioSeleccionado ? `- ID ${servicioSeleccionado.id}` : ''}</CModalTitle></CModalHeader>
                <CModalBody>
                    <CRow className="g-3">
                        <CCol md={6}><CFormLabel>Nombre <span className="text-danger">*</span></CFormLabel><CFormInput name="nombre" value={formulario.nombre} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Slug <span className="text-danger">*</span></CFormLabel><CFormInput name="slug" value={formulario.slug} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Precio usuario <span className="text-danger">*</span></CFormLabel><CFormInput name="precio_usuario" type="number" value={formulario.precio_usuario} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Precio revendedor <span className="text-danger">*</span></CFormLabel><CFormInput name="precio_revendedor" type="number" value={formulario.precio_revendedor} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}>
                            <CFormLabel>Estado <span className="text-danger">*</span></CFormLabel>
                            <CFormSelect name="estado" value={formulario.estado} onChange={handleChangeFormulario}>
                                <option value={1}>Disponible</option>
                                <option value={0}>No disponible</option>
                            </CFormSelect>
                        </CCol>
                        <CCol md={6}><CFormLabel>Imagen <span className="text-danger">*</span></CFormLabel><CFormInput name="imagen" value={formulario.imagen} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Proveedor</CFormLabel><CFormInput name="proveedor" value={formulario.proveedor} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Teléfono proveedor</CFormLabel><CFormInput name="telefono_proveedor" value={formulario.telefono_proveedor} onChange={handleChangeFormulario} /></CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={cerrarModalEditar}>Cancelar</CButton>
                    <CButton color="primary" onClick={handleEditarServicio} disabled={updateServicio.isPending}>
                        {updateServicio.isPending ? 'Actualizando...' : 'Actualizar'}
                    </CButton>
                </CModalFooter>
            </CModal>

            <CModal visible={modalEliminarVisible} onClose={cerrarModalEliminar} alignment="center">
                <CModalHeader onClose={cerrarModalEliminar}><CModalTitle>Eliminar servicio</CModalTitle></CModalHeader>
                <CModalBody>
                    {servicioSeleccionado ? (
                        <div>¿Seguro que deseas eliminar el servicio <strong>{servicioSeleccionado.nombre || `ID ${servicioSeleccionado.id}`}</strong>?</div>
                    ) : (
                        <div>No hay servicio seleccionado.</div>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={cerrarModalEliminar}>Cancelar</CButton>
                    <CButton color="danger" onClick={handleEliminarServicio}>Eliminar</CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default ServiciosEnVenta