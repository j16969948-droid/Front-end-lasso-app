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
import { cilPencil, cilTrash, cilCopy, cilReload } from '@coreui/icons'
import {
    useInventario,
    useUpdateInventario,
    useDeleteInventario,
    useCreateInventario,
    useBulkCreateInventario
} from '../../core/hooks/useInventario'
import { useServicios } from '../../core/hooks/useServicios'
import { formatearFecha, getBadgeColorEstado } from '../../utils/formatters'
import { LoadingState, ErrorState } from '../../components/TableFeedback'
import ConfirmModal from '../../components/ConfirmModal'
import DataTable from '../../components/DataTable'



const InventarioGeneral = () => {
    const [modalEditarVisible, setModalEditarVisible] = useState(false)
    const [modalEliminarVisible, setModalEliminarVisible] = useState(false)
    const [modalRecargarVisible, setModalRecargarVisible] = useState(false)
    const [registroSeleccionado, setRegistroSeleccionado] = useState(null)
    const [filtroServicio, setFiltroServicio] = useState('')
    const [filtroExpired, setFiltroExpired] = useState(false)
    const [pinRecarga, setPinRecarga] = useState('')

    const { data: allInventarioData, isLoading: isLoadingInv, error: errorInv } = useInventario({})
    const { data: serviciosData, isLoading: isLoadingServ } = useServicios()

    const inventarioData = useMemo(() => {
        if (!allInventarioData) return []
        if (filtroExpired) {
            const today = new Date().setHours(0, 0, 0, 0)
            return allInventarioData.filter(item => new Date(item.fecha_vencimiento) < today)
        }
        return allInventarioData
    }, [allInventarioData, filtroExpired])

    const createMutation = useCreateInventario()
    const updateMutation = useUpdateInventario()
    const deleteMutation = useDeleteInventario()
    const bulkCreateMutation = useBulkCreateInventario()

    const cerrarModalRecargar = () => {
        setModalRecargarVisible(false)
        setRegistroSeleccionado(null)
        setPinRecarga('')
    }

    const abrirModalRecargar = (registro) => {
        setRegistroSeleccionado(registro)
        setPinRecarga('')
        setModalRecargarVisible(true)
    }

    const handleRecargarCuenta = () => {
        if (!registroSeleccionado) return

        // Por defecto extendemos 15 dias según el contexto previo
        const today = new Date()
        today.setDate(today.getDate() + 15)
        const newVencimiento = today.toISOString().split('T')[0]

        updateMutation.mutate({
            id: registroSeleccionado.id,
            data: {
                pin: pinRecarga,
                fecha_vencimiento: newVencimiento,
                estado: 'disponible' // Al recargar vuelve a estar disponible
            }
        }, {
            onSuccess: () => {
                cerrarModalRecargar()
            }
        })
    }

    const getToday = () => {
        const d = new Date()
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }
    const getIn30Days = () => {
        const d = new Date()
        d.setDate(d.getDate() + 30)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const [formulario, setFormulario] = useState({
        servicio_id: '', fecha_compra: getToday(), correo: '', clave: '',
        perfil: '', pin: '', fecha_vencimiento: getIn30Days(), telefono_asignado: '',
        cliente_id_asignado: '', estado: 'disponible',
        datos_cuenta: '', // Para creación masiva
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
            servicio_id: '', fecha_compra: getToday(), correo: '', clave: '',
            perfil: '', pin: '', fecha_vencimiento: getIn30Days(), telefono_asignado: '',
            cliente_id_asignado: '', estado: 'disponible',
            datos_cuenta: '',
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
        if (!formulario.servicio_id || !formulario.datos_cuenta || !formulario.fecha_compra || !formulario.fecha_vencimiento) {
            alert('Por favor, selecciona servicio, pega los datos y pon las fechas.')
            return
        }

        // Count how many lines the user pasted
        const lineas = formulario.datos_cuenta.trim().split('\n').filter(l => l.trim().length > 0)

        try {
            const result = await bulkCreateMutation.mutateAsync({
                servicio_id: formulario.servicio_id,
                datos_cuenta: formulario.datos_cuenta,
                fecha_compra: formulario.fecha_compra,
                fecha_vencimiento: formulario.fecha_vencimiento,
                estado: formulario.estado || 'disponible'
            })
            const totalPerfiles = Array.isArray(result) ? result.length : '?'
            alert(`¡Creación masiva exitosa! Se crearon ${totalPerfiles} perfiles a partir de ${lineas.length} cuenta(s).`)
            cerrarModalEditar()
        } catch (err) {
            console.error("Error en creación masiva:", err)
            const mensaje = err?.response?.data?.message || 'Asegúrate de que cada línea tenga el formato "correo contraseña".'
            alert('Error: ' + mensaje)
        }
    }

    const handleEditarRegistro = async () => {
        if (!registroSeleccionado) return
        if (!validarFormulario()) return

        // Cierre inmediato para optimismo visual
        cerrarModalEditar()

        updateMutation.mutate({ id: registroSeleccionado.id, data: formulario }, {
            onError: (err) => {
                console.error("Error al editar:", err)
                // Opcional: Reabrir modal o mostrar toast en caso de error crítico
                alert('No se pudo guardar el cambio. El registro volverá a su estado anterior.')
            }
        })
    }

    const handleEliminarRegistro = async () => {
        if (!registroSeleccionado) return

        // Cierre inmediato
        cerrarModalEliminar()

        deleteMutation.mutate(registroSeleccionado.id, {
            onError: (err) => {
                console.error("Error al eliminar:", err)
                alert('Error al eliminar el registro.')
            }
        })
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
        {
            header: 'Datos Acceso',
            key: 'acceso',
            renderFunc: (row) => (
                <div style={{ lineHeight: '1.2' }}>
                    <div className="small fw-bold">P: {row.perfil || '-'}</div>
                    <div className="text-muted small">PIN: {row.pin || '-'}</div>
                </div>
            )
        },
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
                    {(() => {
                        const isExpired = new Date(row.fecha_vencimiento) < new Date().setHours(0, 0, 0, 0);
                        return (
                            <CButton
                                className={`btn-lasso ${isExpired ? 'btn-lasso-soft-warning' : 'btn-lasso-soft-secondary opacity-50'}`}
                                onClick={() => isExpired && abrirModalRecargar(row)}
                                title={isExpired ? "Recargar Cuenta" : "Cuenta Vigente"}
                                disabled={!isExpired}
                            >
                                <CIcon icon={cilReload} size="sm" />
                            </CButton>
                        )
                    })()}
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
        if (Array.isArray(allInventarioData)) {
            allInventarioData.forEach(item => {
                if (item.estado === 'disponible') {
                    counts[item.servicio_id] = (counts[item.servicio_id] || 0) + 1
                }
            })
        }
        return counts
    }, [allInventarioData])

    const totalDisponibles = useMemo(() => {
        return Object.values(cuentasDisponiblesPorServicio).reduce((acc, curr) => acc + curr, 0)
    }, [cuentasDisponiblesPorServicio])

    const totalExpired = useMemo(() => {
        if (!Array.isArray(allInventarioData)) return 0
        const today = new Date().setHours(0, 0, 0, 0)
        return allInventarioData.filter(item => new Date(item.fecha_vencimiento) < today).length
    }, [allInventarioData])

    const filterControls = (
        <div className="fade-up px-3">
            <h6 className="fw-bold small text-uppercase text-muted mb-4" style={{ letterSpacing: '0.1em' }}>
                Filtrar por Categoría
            </h6>
            <div className="lasso-filter-grid">
                <CButton
                    onClick={() => {
                        setFiltroServicio('')
                        setFiltroExpired(false)
                    }}
                    className={`btn-lasso ${(!filtroServicio && !filtroExpired) ? 'btn-lasso-primary' : 'btn-lasso-soft-primary'} px-4`}
                >
                    <span>Todos</span>
                    <span className={`badge ${(!filtroServicio && !filtroExpired) ? 'bg-white text-primary' : 'bg-primary text-white'} ms-2 rounded-pill px-2`}>
                        {totalDisponibles}
                    </span>
                </CButton>

                <CButton
                    onClick={() => {
                        setFiltroExpired(!filtroExpired)
                        setFiltroServicio('') // Opcional: limpiar filtro de servicio al buscar vencidos
                    }}
                    className={`btn-lasso ${filtroExpired ? 'btn-lasso-warning' : 'btn-lasso-soft-warning'} px-4`}
                >
                    <div className="d-flex align-items-center gap-2">
                        <CIcon icon={cilReload} />
                        <span>Recargar</span>
                    </div>
                    <span className={`badge ${filtroExpired ? 'bg-white text-warning' : 'bg-warning text-white'} ms-2 rounded-pill px-2`}>
                        {totalExpired}
                    </span>
                </CButton>
                {Array.isArray(serviciosData) && serviciosData.map(serv => {
                    const count = cuentasDisponiblesPorServicio[serv.id] || 0
                    const isActive = String(filtroServicio) === String(serv.id)

                    return (
                        <CButton
                            key={serv.id}
                            onClick={() => {
                                setFiltroServicio(serv.id)
                                setFiltroExpired(false)
                            }}
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
                    {registroSeleccionado ? (
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
                    ) : (
                        <CRow className="g-4">
                            <CCol md={12}>
                                <div className="p-3 mb-3 badge-lasso-info-soft rounded-3 border-start border-4 border-info">
                                    <h6 className="fw-bold mb-1">Creación Masiva</h6>
                                    <p className="text-muted small mb-0">Selecciona el servicio y pega los datos. El sistema creará todos los perfiles automáticamente.</p>
                                </div>
                            </CCol>
                            <CCol md={12}>
                                <CFormLabel className="fw-semibold small">Servicio Asociado *</CFormLabel>
                                <CFormSelect className="lasso-input" name="servicio_id" value={formulario.servicio_id} onChange={handleChangeFormulario}>
                                    <option value="">Selecciona plataforma (Netflix, Disney+, etc.)</option>
                                    {Array.isArray(serviciosData) && serviciosData.map(serv => (
                                        <option key={serv.id} value={serv.id}>{serv.nombre}</option>
                                    ))}
                                </CFormSelect>
                            </CCol>

                            <CCol md={12}>
                                <CFormLabel className="fw-semibold small">Datos de la Cuenta (Correo Password) *</CFormLabel>
                                <CFormTextarea
                                    className="lasso-input"
                                    name="datos_cuenta"
                                    rows={5}
                                    placeholder={"cuenta1@correo.com clave123\ncuenta2@correo.com clave456\ncuenta3@correo.com clave789"}
                                    value={formulario.datos_cuenta}
                                    onChange={handleChangeFormulario}
                                />
                                <div className="text-muted small mt-1">Pega una cuenta por línea: <code>correo contraseña</code>. Puedes agregar varias cuentas a la vez. Los perfiles y PINs se generan automáticamente.</div>
                            </CCol>

                            {bulkCreateMutation.isPending && (
                                <CCol md={12}>
                                    <div className="text-center p-3">
                                        <div className="fw-bold text-primary mb-2">Creando perfiles en el servidor...</div>
                                        <div className="progress" style={{ height: '8px' }}>
                                            <div
                                                className="progress-bar progress-bar-striped progress-bar-animated w-100"
                                            ></div>
                                        </div>
                                    </div>
                                </CCol>
                            )}
                        </CRow>
                    )}
                </CModalBody>
                <CModalFooter>
                    <CButton className="btn-lasso btn-lasso-soft-primary border-0" onClick={cerrarModalEditar}>Descartar</CButton>
                    <CButton className="btn-lasso btn-lasso-primary" onClick={registroSeleccionado ? handleEditarRegistro : handleCrearRegistro} disabled={updateMutation.isPending || bulkCreateMutation.isPending}>
                        {(updateMutation.isPending || bulkCreateMutation.isPending) ? 'Procesando...' : (registroSeleccionado ? 'Guardar Cambios' : 'Crear Registro Masivo')}
                    </CButton>
                </CModalFooter>
            </CModal>

            <ConfirmModal
                visible={modalEliminarVisible}
                onClose={cerrarModalEliminar}
                onConfirm={handleEliminarRegistro}
                title="Confirmar Eliminación"
                message="¿Estás seguro de eliminar este registro?"
                subMessage={`Esta acción no se puede deshacer y el registro de ${registroSeleccionado?.correo} será borrado permanentemente.`}
                isLoading={deleteMutation.isPending}
            />

            {/* Modal de Recarga Dedicado */}
            <CModal visible={modalRecargarVisible} onClose={cerrarModalRecargar} className="lasso-modal">
                <CModalHeader>
                    <CModalTitle className="fw-bold fs-5">Recargar Cuenta</CModalTitle>
                </CModalHeader>
                <CModalBody>
                    <div className="mb-3">
                        <div className="text-muted small mb-3">
                            Estás recargando la cuenta: <br />
                            <strong>{registroSeleccionado?.correo}</strong>
                        </div>
                        <CRow>
                            <CCol md={12}>
                                <CFormLabel className="fw-semibold small">Ingresa el nuevo PIN de recarga *</CFormLabel>
                                <CFormInput
                                    className="lasso-input"
                                    type="text"
                                    placeholder="Ej: 1234"
                                    value={pinRecarga}
                                    onChange={(e) => setPinRecarga(e.target.value)}
                                />
                            </CCol>
                        </CRow>
                    </div>
                </CModalBody>
                <CModalFooter className="gap-2">
                    <CButton className="btn-lasso btn-lasso-soft-primary border-0" onClick={cerrarModalRecargar}>
                        Cerrar
                    </CButton>
                    <CButton
                        className="btn-lasso btn-lasso-primary"
                        onClick={handleRecargarCuenta}
                        disabled={updateMutation.isPending || !pinRecarga}
                    >
                        {updateMutation.isPending ? 'Recargando...' : 'Recargar Ahora'}
                    </CButton>
                </CModalFooter>
            </CModal>
        </>
    )
}

export default InventarioGeneral    