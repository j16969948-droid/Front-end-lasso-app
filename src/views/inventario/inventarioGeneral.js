import React, { useState, useMemo } from 'react'
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
import { cilPencil, cilTrash, cilCopy } from '@coreui/icons'
import {
    useInventario,
    useUpdateInventario,
    useDeleteInventario,
    useCreateInventario
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
            cerrarModalEditar()
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

    const handleCopiar = (item) => {
        const textoParaCopiar = `Correo: ${item.correo}\nClave: ${item.clave}\nPIN: ${item.pin || 'N/A'}`
        navigator.clipboard.writeText(textoParaCopiar)
            .then(() => alert('¡Datos copiados al portapapeles!'))
            .catch(err => console.error('Error al copiar:', err))
    }

    const columns = [
        { header: 'ID', key: 'id', className: 'fw-bold text-primary' },
        {
            header: 'Servicio', key: 'servicio_nombre', renderFunc: (row) => (
                <div className="d-flex align-items-center gap-2">
                    {row.servicio?.imagen && <img src={row.servicio.imagen} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />}
                    <span className="fw-semibold">{row.servicio?.nombre || 'N/A'}</span>
                </div>
            )
        },
        {
            header: 'Fechas (C/V)',
            key: 'fechas',
            renderFunc: (row) => (
                <div style={{ lineHeight: '1.2' }}>
                    <div className="text-muted small mb-1" title="Fecha de Compra">C: {formatearFecha(row.fecha_compra)}</div>
                    <div className="fw-semibold small text-primary" title="Fecha de Vencimiento">V: {formatearFecha(row.fecha_vencimiento)}</div>
                </div>
            )
        },
        { header: 'Correo', key: 'correo', className: 'fw-semibold' },
        { header: 'Clave', key: 'clave' },
        { header: 'Perfil', key: 'perfil', className: 'text-center' },
        { header: 'PIN', key: 'pin', className: 'text-center' },
        {
            header: 'Estado',
            key: 'estado',
            renderFunc: (row) => (
                <span className={`badge-lasso badge-lasso-${getBadgeColorEstado(row.estado)}`}>
                    {row.estado || '-'}
                </span>
            )
        },
        {
            header: 'Acciones',
            key: 'acciones',
            renderFunc: (row) => (
                <div className="d-flex gap-2">
                    <CButton className="btn-lasso btn-lasso-soft-info" onClick={() => handleCopiar(row)} title="Copiar Datos">
                        <CIcon icon={cilCopy} size="sm" />
                    </CButton>
                    <CButton className="btn-lasso btn-lasso-soft-primary" onClick={() => abrirModalEditar(row)} title="Editar">
                        <CIcon icon={cilPencil} size="sm" />
                    </CButton>
                    <CButton className="btn-lasso btn-lasso-soft-danger" onClick={() => abrirModalEliminar(row)} title="Eliminar">
                        <CIcon icon={cilTrash} size="sm" />
                    </CButton>
                </div>
            )
        },
    ]

    // Cálculos para contadores de disponibles
    const cuentasDisponiblesPorServicio = useMemo(() => {
        const counts = {}
        if (Array.isArray(inventarioData)) {
            inventarioData.forEach(item => {
                if (item.estado === 'disponible') {
                    counts[item.servicio_id] = (counts[item.servicio_id] || 0) + 1
                }
            })
        }
        return counts
    }, [inventarioData])

    const totalDisponibles = useMemo(() => {
        return Object.values(cuentasDisponiblesPorServicio).reduce((acc, curr) => acc + curr, 0)
    }, [cuentasDisponiblesPorServicio])

    const filterControls = (
        <div className="fade-up px-3">
            <h6 className="fw-bold small text-uppercase text-muted mb-4" style={{ letterSpacing: '0.1em' }}>
                Filtrar por Categoría
            </h6>
            <div className="lasso-filter-grid">
                <CButton
                    onClick={() => setFiltroServicio('')}
                    className={`btn-lasso ${!filtroServicio ? 'btn-lasso-primary' : 'btn-lasso-soft-primary'} px-4`}
                >
                    <span>Todos</span>
                    <span className="badge bg-white text-primary ms-2 rounded-pill px-2">
                        {totalDisponibles}
                    </span>
                </CButton>
                {Array.isArray(serviciosData) && serviciosData.map(serv => {
                    const count = cuentasDisponiblesPorServicio[serv.id] || 0
                    const isActive = String(filtroServicio) === String(serv.id)

                    return (
                        <CButton
                            key={serv.id}
                            onClick={() => setFiltroServicio(serv.id)}
                            className={`btn-lasso ${isActive ? 'btn-lasso-primary' : 'btn-lasso-soft-primary'} px-3`}
                        >
                            {serv.imagen && (
                                <img src={serv.imagen} alt="" style={{ height: '18px', width: '18px', objectFit: 'cover', borderRadius: '50%' }} />
                            )}
                            <span>{serv.nombre}</span>
                            <span className={`badge ${isActive ? 'bg-white text-primary' : 'bg-primary text-white'} ms-2 rounded-pill px-2`}>
                                {count}
                            </span>
                        </CButton>
                    )
                })}
            </div>
        </div>
    )

    const opcionesEstado = [
        { label: 'Disponible', value: 'disponible' },
        { label: 'Asignado', value: 'asignado' },
        { label: 'Vencido', value: 'vencido' },
    ]

    if (isLoadingInv || isLoadingServ) return <LoadingState message="Cargando base de datos..." />
    if (errorInv) return <ErrorState message="Error al conectar con el servidor de inventario" onRetry={() => window.location.reload()} />

    return (
        <>
            <DataTable
                title="Inventario General"
                subtitle="Panel administrativo para la gestión de cuentas y membresías activas."
                data={Array.isArray(inventarioData) ? inventarioData : []}
                columns={columns}
                searchFunction={searchFunction}
                filterFunction={filterFunction}
                filterControls={filterControls}
                onClear={() => setFiltroServicio('')}
                searchPlaceholder="Buscar por ID, correo, perfil, pin o estado..."
                onAddItem={() => { setRegistroSeleccionado(null); resetFormulario(); setModalEditarVisible(true); }}
                addItemLabel="Registrar Nuevo"
            />

            <CModal visible={modalEditarVisible} onClose={cerrarModalEditar} alignment="center" size="lg" className="lasso-modal">
                <CModalHeader onClose={cerrarModalEditar}>
                    <CModalTitle className="fw-bold">
                        {registroSeleccionado ? `Editar Registro #${registroSeleccionado.id}` : 'Nuevo Registro de Inventario'}
                    </CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <CRow className="g-4">
                        <CCol md={6}>
                            <CFormLabel className="fw-semibold small">Servicio Asociado *</CFormLabel>
                            <CFormSelect className="lasso-input" name="servicio_id" value={formulario.servicio_id} onChange={handleChangeFormulario}>
                                <option value="">Selecciona plataforma</option>
                                {Array.isArray(serviciosData) && serviciosData.map(serv => (
                                    <option key={serv.id} value={serv.id}>{serv.nombre}</option>
                                ))}
                            </CFormSelect>
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel className="fw-semibold small">Estado de Cuenta *</CFormLabel>
                            <CFormSelect className="lasso-input" name="estado" value={formulario.estado} onChange={handleChangeFormulario}>
                                {opcionesEstado.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </CFormSelect>
                        </CCol>

                        <CCol md={12}><hr className="my-2 opacity-10" /></CCol>

                        <CCol md={6}>
                            <CFormLabel className="fw-semibold small">Correo Electrónico *</CFormLabel>
                            <CFormInput className="lasso-input" name="correo" placeholder="ejemplo@correo.com" value={formulario.correo} onChange={handleChangeFormulario} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel className="fw-semibold small">Contraseña *</CFormLabel>
                            <CFormInput className="lasso-input" name="clave" type="text" value={formulario.clave} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={4}>
                            <CFormLabel className="fw-semibold small">Perfil *</CFormLabel>
                            <CFormInput className="lasso-input" name="perfil" placeholder="Nombre de perfil" value={formulario.perfil} onChange={handleChangeFormulario} />
                        </CCol>
                        <CCol md={4}>
                            <CFormLabel className="fw-semibold small">PIN Acceso *</CFormLabel>
                            <CFormInput className="lasso-input" name="pin" maxLength={4} value={formulario.pin} onChange={handleChangeFormulario} />
                        </CCol>
                        <CCol md={4}>
                            <CFormLabel className="fw-semibold small">Teléfono</CFormLabel>
                            <CFormInput className="lasso-input" name="telefono_asignado" value={formulario.telefono_asignado} onChange={handleChangeFormulario} />
                        </CCol>

                        <CCol md={12}><hr className="my-2 opacity-10" /></CCol>

                        <CCol md={6}>
                            <CFormLabel className="fw-semibold small">Fecha de Compra *</CFormLabel>
                            <CFormInput className="lasso-input" name="fecha_compra" type="date" value={formulario.fecha_compra} onChange={handleChangeFormulario} />
                        </CCol>
                        <CCol md={6}>
                            <CFormLabel className="fw-semibold small">Fecha de Vencimiento *</CFormLabel>
                            <CFormInput className="lasso-input" name="fecha_vencimiento" type="date" value={formulario.fecha_vencimiento} onChange={handleChangeFormulario} />
                        </CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter>
                    <CButton className="btn-lasso btn-lasso-soft-primary border-0" onClick={cerrarModalEditar}>Descartar</CButton>
                    <CButton className="btn-lasso btn-lasso-primary" onClick={registroSeleccionado ? handleEditarRegistro : handleCrearRegistro} disabled={updateMutation.isPending || createMutation.isPending}>
                        {(updateMutation.isPending || createMutation.isPending) ? 'Procesando...' : (registroSeleccionado ? 'Guardar Cambios' : 'Crear Registro')}
                    </CButton>
                </CModalFooter>
            </CModal>

            <CModal visible={modalEliminarVisible} onClose={cerrarModalEliminar} alignment="center" className="lasso-modal">
                <CModalHeader onClose={cerrarModalEliminar}>
                    <CModalTitle className="fw-bold text-danger">Confirmar Eliminación</CModalTitle>
                </CModalHeader>
                <CModalBody className="p-4 text-center">
                    <div className="mb-4">
                        <CIcon icon={cilTrash} size="3xl" className="text-danger opacity-50" />
                    </div>
                    <h6>¿Estás seguro de eliminar este registro?</h6>
                    <p className="text-muted small">Esta acción no se puede deshacer y el registro de <strong>{registroSeleccionado?.correo}</strong> será borrado permanentemente.</p>
                </CModalBody>
                <CModalFooter className="justify-content-center">
                    <CButton className="btn-lasso btn-lasso-soft-primary border-0 px-4" onClick={cerrarModalEliminar}>No, cancelar</CButton>
                    <CButton className="btn-lasso btn-lasso-primary px-4" style={{ background: 'var(--lasso-danger)' }} onClick={handleEliminarRegistro} disabled={deleteMutation.isPending}>
                        {deleteMutation.isPending ? 'Eliminando...' : 'Sí, eliminar'}
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default InventarioGeneral    