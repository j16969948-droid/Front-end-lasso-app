import React, { useState } from 'react'
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
    CFormTextarea,
} from '@coreui/react'
import { 
    useInventario, 
    useCreateInventario, 
    useUpdateInventario, 
    useDeleteInventario 
} from '../../core/hooks/useInventario'
import { formatearFecha, getBadgeColorEstado } from '../../utils/formatters'
import { LoadingState, ErrorState } from '../../components/TableFeedback'
import DataTable from '../../components/DataTable'

const Inventario = () => {
    const { data: inventarioData, isLoading, error } = useInventario()
    const createMutation = useCreateInventario()
    const updateMutation = useUpdateInventario()
    const deleteMutation = useDeleteInventario()

    const [modalCrearVisible, setModalCrearVisible] = useState(false)
    const [modalEditarVisible, setModalEditarVisible] = useState(false)
    const [modalEliminarVisible, setModalEliminarVisible] = useState(false)
    const [registroSeleccionado, setRegistroSeleccionado] = useState(null)

    const [formulario, setFormulario] = useState({
        servicio_id: '', fecha_compra: '', correo: '', clave: '',
        perfil: '', pin: '', fecha_vencimiento: '', telefono_asignado: '',
        cliente_id_asignado: '', estado: '', texto: '',
    })

    const searchFunction = (item, termino) => {
        return (
            String(item?.id || '').toLowerCase().includes(termino) ||
            String(item?.servicio_id || '').toLowerCase().includes(termino) ||
            String(item?.correo || '').toLowerCase().includes(termino) ||
            String(item?.perfil || '').toLowerCase().includes(termino) ||
            String(item?.pin || '').toLowerCase().includes(termino) ||
            String(item?.telefono_asignado || '').toLowerCase().includes(termino) ||
            String(item?.estado || '').toLowerCase().includes(termino)
        )
    }

    const resetFormulario = () => {
        setFormulario({
            servicio_id: '', fecha_compra: '', correo: '', clave: '',
            perfil: '', pin: '', fecha_vencimiento: '', telefono_asignado: '',
            cliente_id_asignado: '', estado: '', texto: '',
        })
    }

    const handleChangeFormulario = (e) => {
        const { name, value } = e.target
        setFormulario((prev) => ({ ...prev, [name]: value }))
    }

    const abrirModalCrear = () => { resetFormulario(); setModalCrearVisible(true); }
    const cerrarModalCrear = () => { setModalCrearVisible(false); resetFormulario(); }

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
        })
        setModalEditarVisible(true)
    }

    const cerrarModalEditar = () => { setModalEditarVisible(false); setRegistroSeleccionado(null); resetFormulario(); }

    const abrirModalEliminar = (item) => { setRegistroSeleccionado(item); setModalEliminarVisible(true); }
    const cerrarModalEliminar = () => { setModalEliminarVisible(false); setRegistroSeleccionado(null); }

    const handleCrearRegistro = async () => {
        try {
            await createMutation.mutateAsync(formulario)
            cerrarModalCrear()
        } catch (err) {
            console.error("Error al crear:", err)
        }
    }

    const handleEditarRegistro = async () => {
        if (!registroSeleccionado) return
        try {
            await updateMutation.mutateAsync({ id: registroSeleccionado.id, data: formulario })
            cerrarModalEditar()
        } catch (err) {
            console.error("Error al editar:", err)
        }
    }

    const handleEliminarRegistro = async () => {
        if (!registroSeleccionado) return
        try {
            await deleteMutation.mutateAsync(registroSeleccionado.id)
            cerrarModalEliminar()
        } catch (err) {
            console.error("Error al eliminar:", err)
        }
    }

    const columns = [
        { header: 'ID', key: 'id', className: 'fw-semibold' },
        { header: 'Servicio ID', key: 'servicio_id' },
        { header: 'Fecha compra', key: 'fecha_compra', renderFunc: (row) => formatearFecha(row.fecha_compra) },
        { header: 'Correo', key: 'correo', className: 'fw-semibold' },
        { header: 'Clave', key: 'clave' },
        { header: 'Perfil', key: 'perfil' },
        { header: 'PIN', key: 'pin' },
        { header: 'Vencimiento', key: 'fecha_vencimiento', renderFunc: (row) => formatearFecha(row.fecha_vencimiento) },
        { header: 'Teléfono', key: 'telefono_asignado' },
        { header: 'Cliente ID', key: 'cliente_id_asignado' },
        {
            header: 'Estado',
            key: 'estado',
            renderFunc: (row) => (
                <CBadge color={getBadgeColorEstado(row.estado)} className="rounded-pill px-3 py-2 fw-semibold">
                    {row.estado || '-'}
                </CBadge>
            )
        },
        {
            header: 'Texto',
            key: 'texto',
            renderFunc: (row) => (
                <div style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.texto || ''}>
                    {row.texto || '-'}
                </div>
            )
        },
        {
            header: 'Acciones',
            key: 'acciones',
            renderFunc: (row) => (
                <div className="d-flex gap-2">
                    <CButton color="primary" variant="outline" size="sm" onClick={() => abrirModalEditar(row)}>Editar</CButton>
                    <CButton color="danger" variant="outline" size="sm" onClick={() => abrirModalEliminar(row)}>Eliminar</CButton>
                </div>
            )
        },
    ]

    if (isLoading) return <LoadingState message="Cargando inventario..." />
    if (error) return <ErrorState message="No se pudo cargar el inventario" onRetry={() => window.location.reload()} />

    return (
        <>
            <DataTable
                title="Inventario"
                subtitle="Gestiona, crea, edita y elimina registros del inventario"
                data={Array.isArray(inventarioData) ? inventarioData : []}
                columns={columns}
                searchFunction={searchFunction}
                onAddItem={abrirModalCrear}
                addItemLabel="+ Agregar registro"
                searchPlaceholder="ID, servicio, correo, perfil, pin, teléfono, estado..."
            />

            <CModal visible={modalCrearVisible} onClose={cerrarModalCrear} alignment="center" size="xl">
                <CModalHeader onClose={cerrarModalCrear}><CModalTitle>Agregar registro</CModalTitle></CModalHeader>
                <CModalBody>
                    <CRow className="g-3">
                        <CCol md={6}><CFormLabel>Servicio ID</CFormLabel><CFormInput name="servicio_id" value={formulario.servicio_id} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Fecha compra</CFormLabel><CFormInput name="fecha_compra" value={formulario.fecha_compra} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Correo</CFormLabel><CFormInput name="correo" value={formulario.correo} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Clave</CFormLabel><CFormInput name="clave" value={formulario.clave} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Perfil</CFormLabel><CFormInput name="perfil" value={formulario.perfil} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>PIN</CFormLabel><CFormInput name="pin" value={formulario.pin} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Fecha vencimiento</CFormLabel><CFormInput name="fecha_vencimiento" value={formulario.fecha_vencimiento} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Teléfono asignado</CFormLabel><CFormInput name="telefono_asignado" value={formulario.telefono_asignado} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Cliente ID asignado</CFormLabel><CFormInput name="cliente_id_asignado" value={formulario.cliente_id_asignado} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Estado</CFormLabel><CFormInput name="estado" value={formulario.estado} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={12}><CFormLabel>Texto</CFormLabel><CFormTextarea name="texto" rows={3} value={formulario.texto} onChange={handleChangeFormulario} /></CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={cerrarModalCrear}>Cancelar</CButton>
                    <CButton color="primary" onClick={handleCrearRegistro} disabled={createMutation.isPending}>
                        {createMutation.isPending ? 'Guardando...' : 'Guardar'}
                    </CButton>
                </CModalFooter>
            </CModal>

            <CModal visible={modalEditarVisible} onClose={cerrarModalEditar} alignment="center" size="xl">
                <CModalHeader onClose={cerrarModalEditar}><CModalTitle>Editar registro {registroSeleccionado ? `- ID ${registroSeleccionado.id}` : ''}</CModalTitle></CModalHeader>
                <CModalBody>
                    <CRow className="g-3">
                        <CCol md={6}><CFormLabel>Servicio ID</CFormLabel><CFormInput name="servicio_id" value={formulario.servicio_id} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Fecha compra</CFormLabel><CFormInput name="fecha_compra" value={formulario.fecha_compra} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Correo</CFormLabel><CFormInput name="correo" value={formulario.correo} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Clave</CFormLabel><CFormInput name="clave" value={formulario.clave} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Perfil</CFormLabel><CFormInput name="perfil" value={formulario.perfil} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>PIN</CFormLabel><CFormInput name="pin" value={formulario.pin} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Fecha vencimiento</CFormLabel><CFormInput name="fecha_vencimiento" value={formulario.fecha_vencimiento} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Teléfono asignado</CFormLabel><CFormInput name="telefono_asignado" value={formulario.telefono_asignado} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Cliente ID asignado</CFormLabel><CFormInput name="cliente_id_asignado" value={formulario.cliente_id_asignado} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Estado</CFormLabel><CFormInput name="estado" value={formulario.estado} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={12}><CFormLabel>Texto</CFormLabel><CFormTextarea name="texto" rows={3} value={formulario.texto} onChange={handleChangeFormulario} /></CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={cerrarModalEditar}>Cancelar</CButton>
                    <CButton color="primary" onClick={handleEditarRegistro} disabled={updateMutation.isPending}>
                        {updateMutation.isPending ? 'Actualizando...' : 'Actualizar'}
                    </CButton>
                </CModalFooter>
            </CModal>

            <CModal visible={modalEliminarVisible} onClose={cerrarModalEliminar} alignment="center">
                <CModalHeader onClose={cerrarModalEliminar}><CModalTitle>Eliminar registro</CModalTitle></CModalHeader>
                <CModalBody>
                    {registroSeleccionado ? (
                        <div>¿Seguro que deseas eliminar el registro <strong>{registroSeleccionado.correo || `ID ${registroSeleccionado.id}`}</strong>?</div>
                    ) : (
                        <div>No hay registro seleccionado.</div>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton color="secondary" onClick={cerrarModalEliminar}>Cancelar</CButton>
                    <CButton color="danger" onClick={handleEliminarRegistro} disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default Inventario
