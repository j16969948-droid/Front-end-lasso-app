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
    CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash } from '@coreui/icons'
import {
    useInventario,
    useCreateInventario,
    useUpdateInventario,
    useDeleteInventario
} from '../../core/hooks/useInventario'
import { useServicios } from '../../core/hooks/useServicios'
import { formatearFecha, getBadgeColorEstado } from '../../utils/formatters'
import { LoadingState, ErrorState } from '../../components/TableFeedback'
import DataTable from '../../components/DataTable'

const InventarioGeneral = () => {
    const { data: inventarioData, isLoading: isLoadingInv, error: errorInv } = useInventario()
    const { data: serviciosData, isLoading: isLoadingServ } = useServicios()

    const createMutation = useCreateInventario()
    const updateMutation = useUpdateInventario()
    const deleteMutation = useDeleteInventario()

    const [modalCrearVisible, setModalCrearVisible] = useState(false)
    const [modalEditarVisible, setModalEditarVisible] = useState(false)
    const [modalEliminarVisible, setModalEliminarVisible] = useState(false)
    const [registroSeleccionado, setRegistroSeleccionado] = useState(null)
    const [filtroServicio, setFiltroServicio] = useState('')

    const [formulario, setFormulario] = useState({
        servicio_id: '', fecha_compra: '', correo: '', clave: '',
        perfil: '', pin: '', fecha_vencimiento: '', telefono_asignado: '',
        cliente_id_asignado: '', estado: 'disponible',
    })

    const filterFunction = (item) => {
        return !filtroServicio || String(item?.servicio_id) === String(filtroServicio)
    }

    const searchFunction = (item, termino) => {
        return (
            String(item?.id || '').toLowerCase().includes(termino) ||
            String(item?.servicio?.nombre || '').toLowerCase().includes(termino) ||
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
            cliente_id_asignado: '', estado: 'disponible',
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
        })
        setModalEditarVisible(true)
    }

    const cerrarModalEditar = () => { setModalEditarVisible(false); setRegistroSeleccionado(null); resetFormulario(); }

    const abrirModalEliminar = (item) => { setRegistroSeleccionado(item); setModalEliminarVisible(true); }
    const cerrarModalEliminar = () => { setModalEliminarVisible(false); setRegistroSeleccionado(null); }

    const validarFormulario = () => {
        const camposObligatorios = [
            'servicio_id', 'fecha_compra', 'correo', 'clave',
            'perfil', 'pin', 'fecha_vencimiento', 'estado'
        ]

        const faltantes = camposObligatorios.filter(campo => !formulario[campo])

        if (faltantes.length > 0) {
            alert('Por favor, completa todos los campos obligatorios.')
            return false
        }
        return true
    }

    const handleCrearRegistro = async () => {
        if (!validarFormulario()) return
        try {
            await createMutation.mutateAsync(formulario)
            cerrarModalCrear()
        } catch (err) {
            console.error("Error al crear:", err)
        }
    }

    const handleEditarRegistro = async () => {
        if (!registroSeleccionado) return
        if (!validarFormulario()) return
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
        { header: 'Servicio', key: 'servicio_nombre', renderFunc: (row) => row.servicio?.nombre || 'N/A' },
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
            header: 'Acciones',
            key: 'acciones',
            renderFunc: (row) => (
                <div className="d-flex gap-2">
                    <CButton className="btn-premium-action btn-action-edit" onClick={() => abrirModalEditar(row)}>
                        <CIcon icon={cilPencil} size="sm" className="me-1" />
                        Editar
                    </CButton>
                    <CButton className="btn-premium-action btn-action-delete" onClick={() => abrirModalEliminar(row)}>
                        <CIcon icon={cilTrash} size="sm" className="me-1" />
                        Eliminar
                    </CButton>
                </div>
            )
        },
    ]

    const filterControls = (
        <CCol md={12}>
            <CFormLabel className="fw-semibold small text-uppercase text-secondary">Filtrar por Servicio</CFormLabel>
            <CFormSelect className="premium-input" value={filtroServicio} onChange={(e) => setFiltroServicio(e.target.value)}>
                <option value="">Todos los servicios</option>
                {Array.isArray(serviciosData) && serviciosData.map(serv => (
                    <option key={serv.id} value={serv.id}>{serv.nombre}</option>
                ))}
            </CFormSelect>
        </CCol>
    )

    const opcionesEstado = [
        { label: 'Disponible', value: 'disponible' },
        { label: 'Asignado', value: 'asignado' },
        { label: 'Vencido', value: 'vencido' },
    ]

    if (isLoadingInv || isLoadingServ) return <LoadingState message="Cargando datos..." />
    if (errorInv) return <ErrorState message="No se pudo cargar el inventario" onRetry={() => window.location.reload()} />

    return (
        <>
            <DataTable
                title="Inventario"
                subtitle="Gestiona, crea, edita y elimina registros del inventario"
                data={Array.isArray(inventarioData) ? inventarioData : []}
                columns={columns}
                searchFunction={searchFunction}
                filterFunction={filterFunction}
                filterControls={filterControls}
                onClear={() => setFiltroServicio('')}
                onAddItem={abrirModalCrear}
                addItemLabel="+ Agregar registro"
                searchPlaceholder="ID, servicio, correo, perfil, pin, teléfono, estado..."
            />

            <CModal visible={modalCrearVisible} onClose={cerrarModalCrear} alignment="center" size="xl" className="premium-modal">
                <CModalHeader onClose={cerrarModalCrear} className="border-0 pb-0">
                    <CModalTitle className="fw-bold fs-4">Agregar Nuevo Registro</CModalTitle>
                </CModalHeader>
                <CModalBody className="p-4">
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormLabel>Servicio <span className="text-danger">*</span></CFormLabel>
                            <CFormSelect name="servicio_id" value={formulario.servicio_id} onChange={handleChangeFormulario}>
                                <option value="">Selecciona un servicio</option>
                                {Array.isArray(serviciosData) && serviciosData.map(serv => (
                                    <option key={serv.id} value={serv.id}>{serv.nombre}</option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        <CCol md={6}><CFormLabel>Fecha compra <span className="text-danger">*</span></CFormLabel><CFormInput name="fecha_compra" type="date" value={formulario.fecha_compra} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Correo <span className="text-danger">*</span></CFormLabel><CFormInput name="correo" value={formulario.correo} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Clave <span className="text-danger">*</span></CFormLabel><CFormInput name="clave" value={formulario.clave} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Perfil <span className="text-danger">*</span></CFormLabel><CFormInput name="perfil" value={formulario.perfil} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>PIN <span className="text-danger">*</span></CFormLabel><CFormInput name="pin" value={formulario.pin} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Fecha vencimiento <span className="text-danger">*</span></CFormLabel><CFormInput name="fecha_vencimiento" type="date" value={formulario.fecha_vencimiento} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}>
                            <CFormLabel>Estado <span className="text-danger">*</span></CFormLabel>
                            <CFormSelect name="estado" value={formulario.estado} onChange={handleChangeFormulario}>
                                <option value="">Selecciona un estado</option>
                                {opcionesEstado.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </CFormSelect>
                        </CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter className="border-0 pt-0">
                    <CButton color="secondary" variant="ghost" onClick={cerrarModalCrear} className="rounded-pill px-4">Cancelar</CButton>
                    <CButton color="primary" onClick={handleCrearRegistro} disabled={createMutation.isPending} className="rounded-pill px-4">
                        {createMutation.isPending ? 'Guardando...' : 'Guardar Registro'}
                    </CButton>
                </CModalFooter>
            </CModal>

            <CModal visible={modalEditarVisible} onClose={cerrarModalEditar} alignment="center" size="xl" className="premium-modal">
                <CModalHeader onClose={cerrarModalEditar} className="border-0 pb-0">
                    <CModalTitle className="fw-bold fs-4">Editar Registro {registroSeleccionado ? `- ID ${registroSeleccionado.id}` : ''}</CModalTitle>
                </CModalHeader>
                <CModalBody className="p-4">
                    <CRow className="g-3">
                        <CCol md={6}>
                            <CFormLabel>Servicio <span className="text-danger">*</span></CFormLabel>
                            <CFormSelect name="servicio_id" value={formulario.servicio_id} onChange={handleChangeFormulario}>
                                <option value="">Selecciona un servicio</option>
                                {Array.isArray(serviciosData) && serviciosData.map(serv => (
                                    <option key={serv.id} value={serv.id}>{serv.nombre}</option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        <CCol md={6}><CFormLabel>Fecha compra <span className="text-danger">*</span></CFormLabel><CFormInput name="fecha_compra" type="date" value={formulario.fecha_compra} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Correo <span className="text-danger">*</span></CFormLabel><CFormInput name="correo" value={formulario.correo} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={6}><CFormLabel>Clave <span className="text-danger">*</span></CFormLabel><CFormInput name="clave" value={formulario.clave} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Perfil <span className="text-danger">*</span></CFormLabel><CFormInput name="perfil" value={formulario.perfil} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>PIN <span className="text-danger">*</span></CFormLabel><CFormInput name="pin" value={formulario.pin} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Fecha vencimiento <span className="text-danger">*</span></CFormLabel><CFormInput name="fecha_vencimiento" type="date" value={formulario.fecha_vencimiento} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Teléfono asignado</CFormLabel><CFormInput name="telefono_asignado" value={formulario.telefono_asignado} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}><CFormLabel>Cliente ID asignado</CFormLabel><CFormInput name="cliente_id_asignado" value={formulario.cliente_id_asignado} onChange={handleChangeFormulario} /></CCol>
                        <CCol md={4}>
                            <CFormLabel>Estado <span className="text-danger">*</span></CFormLabel>
                            <CFormSelect name="estado" value={formulario.estado} onChange={handleChangeFormulario}>
                                <option value="">Selecciona un estado</option>
                                {opcionesEstado.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </CFormSelect>
                        </CCol>
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

export default InventarioGeneral    