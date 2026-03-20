import React, { useState, useMemo } from 'react'
import {
    CRow,
    CCol,
    CButton,
    CCard,
    CCardBody,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CFormInput,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCopy, cilUser, cilCheckCircle, cilChartPie, cilCalendar } from '@coreui/icons'
import { useInventario } from '../../core/hooks/useInventario'
import { useServicios } from '../../core/hooks/useServicios'
import { formatearFecha, normalizarFecha, getBadgeColorEstado } from '../../utils/formatters'
import { LoadingState, ErrorState } from '../../components/TableFeedback'
import StatCard from '../../components/StatCard'
import DataTable from '../../components/DataTable'

const CuentasVendidas = () => {
    const { data: inventarioData, isLoading: isLoadingInv, error: errorInv } = useInventario()
    const { data: serviciosData, isLoading: isLoadingServ } = useServicios()

    const getToday = () => {
        const d = new Date()
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    const [modalDetallesVisible, setModalDetallesVisible] = useState(false)
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null)
    const [filtroServicio, setFiltroServicio] = useState('')
    const [filtroFecha, setFiltroFecha] = useState(getToday())

    // Solo cuentas con estado asignado (vendidas)
    const cuentasVendidas = useMemo(() => {
        if (!Array.isArray(inventarioData)) return []
        return inventarioData.filter(item => {
            const matchesEstado = item.estado?.toLowerCase() === 'asignado'
            const itemFecha = normalizarFecha(item.fecha_compra)
            const matchesFecha = !filtroFecha || itemFecha === filtroFecha
            return matchesEstado && matchesFecha
        })
    }, [inventarioData, filtroFecha])

    // Agrupando cuentas del mismo cliente compradas el mismo día
    const cuentasAgrupadas = useMemo(() => {
        const map = new Map();
        cuentasVendidas.forEach(cta => {
            const normalizedDate = normalizarFecha(cta.fecha_compra) || 'NO_DATE';
            const key = `${cta.cliente_id_asignado || 'NO_ID'}_${cta.telefono_asignado || 'NO_PHONE'}_${normalizedDate}`;
            if (!map.has(key)) {
                map.set(key, { ...cta, cuentas_asociadas: [cta], fecha_compra_normalizada: normalizedDate });
            } else {
                map.get(key).cuentas_asociadas.push(cta);
            }
        });
        return Array.from(map.values()).sort((a, b) => new Date(b.fecha_compra) - new Date(a.fecha_compra));
    }, [cuentasVendidas])

    // Métricas Mini Dashboard
    const metricas = useMemo(() => {
        const total = cuentasVendidas.length

        const telefonosUnicos = new Set()
        const clientesIdsUnicos = new Set()
        const conteoServicios = {}

        cuentasVendidas.forEach(item => {
            if (item.telefono_asignado) telefonosUnicos.add(item.telefono_asignado)
            if (item.cliente_id_asignado) clientesIdsUnicos.add(item.cliente_id_asignado)

            if (item.servicio_id) {
                conteoServicios[item.servicio_id] = (conteoServicios[item.servicio_id] || 0) + 1
            }
        })

        let topServicio = { id: null, count: 0, nombre: 'Ninguno' }
        Object.entries(conteoServicios).forEach(([id, count]) => {
            if (count > topServicio.count) {
                const s = (serviciosData || []).find(serv => String(serv.id) === String(id))
                topServicio = { id, count, nombre: s ? s.nombre : `ID ${id}` }
            }
        })

        // Un aproximado de clientes únicos uniendo teléfono o ID
        const totalClientesUnicos = Math.max(telefonosUnicos.size, clientesIdsUnicos.size)

        return { total, topServicio, totalClientesUnicos }
    }, [cuentasVendidas, serviciosData])

    const cuentasPorCliente = useMemo(() => {
        if (!clienteSeleccionado || !Array.isArray(inventarioData)) return []

        return inventarioData.filter(item => {
            const coincideTelefono = clienteSeleccionado.telefono_asignado && item.telefono_asignado === clienteSeleccionado.telefono_asignado
            const coincideId = clienteSeleccionado.cliente_id_asignado && item.cliente_id_asignado === clienteSeleccionado.cliente_id_asignado
            
            const itemFecha = normalizarFecha(item.fecha_compra)
            const selFecha = normalizarFecha(clienteSeleccionado.fecha_compra)
            const coincideFecha = itemFecha === selFecha

            return (coincideTelefono || coincideId) && coincideFecha
        })
    }, [clienteSeleccionado, inventarioData])

    const filterFunction = (item) => {
        if (!filtroServicio) return true;
        return item.cuentas_asociadas.some(c => String(c.servicio_id) === String(filtroServicio));
    }

    const searchFunction = (group, termino) => {
        return group.cuentas_asociadas.some(item =>
            String(item.id || '').toLowerCase().includes(termino) ||
            String(item.servicio?.nombre || '').toLowerCase().includes(termino) ||
            String(item.correo || '').toLowerCase().includes(termino) ||
            String(item.perfil || '').toLowerCase().includes(termino) ||
            String(item.telefono_asignado || '').toLowerCase().includes(termino) ||
            String(item.cliente_id_asignado || '').toLowerCase().includes(termino)
        );
    }

    const abrirDetalles = (item) => {
        if (!item.telefono_asignado && !item.cliente_id_asignado) {
            alert('Esta cuenta no tiene un teléfono o ID de cliente asignado para buscar historial.')
            return
        }
        setClienteSeleccionado(item)
        setModalDetallesVisible(true)
    }

    const cerrarDetalles = () => {
        setModalDetallesVisible(false)
        setClienteSeleccionado(null)
    }

    const handleCopiar = (item) => {
        const textoParaCopiar = `Correo: ${item.correo}\nClave: ${item.clave}\nPIN: ${item.pin || 'N/A'}`
        navigator.clipboard.writeText(textoParaCopiar)
            .then(() => alert('¡Datos copiados al portapapeles!'))
            .catch(err => console.error('Error al copiar:', err))
    }

    const columns = [
        {
            header: 'Servicios',
            key: 'servicios',
            renderFunc: (row) => (
                <div className="d-flex align-items-center gap-1 flex-wrap">
                    {row.cuentas_asociadas.map((c, i) => c.servicio?.imagen ? (
                        <img key={i} src={c.servicio.imagen} alt={c.servicio?.nombre} title={c.servicio?.nombre} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <span key={i} className="badge bg-secondary">{c.servicio?.nombre}</span>
                    ))}
                </div>
            )
        },
        { header: 'Cliente ID', key: 'cliente_id_asignado', className: 'text-muted fw-bold' },
        { header: 'Teléfono', key: 'telefono_asignado', className: 'fw-semibold' },
        {
            header: 'Fecha Compra',
            key: 'fecha_compra',
            renderFunc: (row) => (
                <div className="text-secondary small fw-semibold">{formatearFecha(row.fecha_compra)}</div>
            )
        },
        {
            header: 'Paquete',
            key: 'cantidad',
            renderFunc: (row) => (
                <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1 border border-primary border-opacity-25">
                    {row.cuentas_asociadas.length} item(s)
                </span>
            )
        },
        {
            header: 'Acciones',
            key: 'acciones',
            renderFunc: (row) => (
                <div className="d-flex gap-2">
                    <CButton className="btn-lasso btn-lasso-soft-primary py-1 px-3" onClick={() => abrirDetalles(row)} title="Ver Historial Cliente">
                        <CIcon icon={cilUser} size="sm" className="me-1" /> Detalles
                    </CButton>
                </div>
            )
        },
    ]

    const filterControls = (
        <div className="fade-up px-3">
            <CRow className="align-items-end g-4 mb-4">
                <CCol md={9}>
                    <h6 className="fw-bold small text-uppercase text-muted mb-3" style={{ letterSpacing: '0.1em' }}>
                        Filtrar por Categoría
                    </h6>
                    <div className="lasso-filter-grid">
                        <CButton
                            onClick={() => setFiltroServicio('')}
                            className={`btn-lasso ${!filtroServicio ? 'btn-lasso-primary' : 'btn-lasso-soft-primary'} px-4`}
                        >
                            <span>Todos</span>
                            <span className="badge bg-white text-primary ms-2 rounded-pill px-2">
                                {cuentasVendidas.length}
                            </span>
                        </CButton>
                        {Array.isArray(serviciosData) && serviciosData.map(serv => {
                            const count = cuentasVendidas.filter(c => c.servicio_id === serv.id).length
                            if (count === 0) return null

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
                </CCol>
                <CCol md={3}>
                    <h6 className="fw-bold small text-uppercase text-muted mb-3" style={{ letterSpacing: '0.1em' }}>
                        Seleccionar Fecha
                    </h6>
                    <div className="d-flex align-items-center gap-2 bg-white p-2 rounded-3 border shadow-sm">
                        <CIcon icon={cilCalendar} className="text-muted ms-1" />
                        <CFormInput
                            type="date"
                            value={filtroFecha}
                            onChange={(e) => setFiltroFecha(e.target.value)}
                            className="border-0 p-0 shadow-none bg-transparent text-muted"
                        />
                        {filtroFecha && (
                            <CButton
                                size="sm"
                                color="light"
                                className="rounded-circle p-0"
                                style={{ width: '20px', height: '20px', lineHeight: '1' }}
                                onClick={() => setFiltroFecha('')}
                                title="Ver todas las fechas"
                            >
                                
                            </CButton>
                        )}
                    </div>
                </CCol>
            </CRow>
        </div>
    )

    if (isLoadingInv || isLoadingServ) return <LoadingState message="Cargando cuentas vendidas..." />
    if (errorInv) return <ErrorState message="Error al cargar los datos." onRetry={() => window.location.reload()} />

    return (
        <div className="mb-4">
            {/* Mini Dashboard */}
            <CRow className="mb-4 px-3 align-items-stretch g-4">
                <CCol xs={12} sm={4}>
                    <StatCard 
                        title="Cuentas Vendidas Totales" 
                        value={metricas.total} 
                        icon={cilCheckCircle} 
                        color="primary" 
                    />
                </CCol>

                <CCol xs={12} sm={4}>
                    <StatCard 
                        title="Servicio Estrella" 
                        value={metricas.topServicio.nombre} 
                        text={`${metricas.topServicio.count} ventas`}
                        icon={cilChartPie} 
                        color="info" 
                    />
                </CCol>

                <CCol xs={12} sm={4}>
                    <StatCard 
                        title="Clientes Únicos" 
                        value={metricas.totalClientesUnicos} 
                        icon={cilUser} 
                        color="success" 
                    />
                </CCol>
            </CRow>

            <DataTable
                title="Cuentas Vendidas"
                subtitle="Registro unificado de todos los servicios entregados."
                data={cuentasAgrupadas}
                columns={columns}
                searchFunction={searchFunction}
                filterFunction={filterFunction}
                filterControls={filterControls}
                onClear={() => setFiltroServicio('')}
                searchPlaceholder="Buscar por teléfono, cliente ID, correo o servicio..."
                hideAddButton={true}
            />

            {/* Modal de Historial de Cliente */}
            <CModal visible={modalDetallesVisible} onClose={cerrarDetalles} alignment="center" size="xl" className="lasso-modal">
                <CModalHeader onClose={cerrarDetalles} className="border-bottom-0 pb-0">
                    <CModalTitle className="fw-bold fs-4">
                        Historial de Compras del Cliente
                    </CModalTitle>
                </CModalHeader>
                <CModalBody className="pt-3">
                    <div className="mb-4 bg-light bg-opacity-50 p-3 rounded-3 border">
                        <CRow>
                            <CCol sm={6}>
                                <div className="small text-secondary fw-bold text-uppercase">Teléfono</div>
                                <div className="fs-5 fw-bold font-monospace text-primary">{clienteSeleccionado?.telefono_asignado || 'No registrado'}</div>
                            </CCol>
                            <CCol sm={6}>
                                <div className="small text-secondary fw-bold text-uppercase">ID de Cliente</div>
                                <div className="fs-5 fw-bold font-monospace text-primary">{clienteSeleccionado?.cliente_id_asignado || 'No registrado'}</div>
                            </CCol>
                        </CRow>
                    </div>

                    <h6 className="fw-bold mb-3 ms-1 border-start border-3 border-primary ps-2">Todas las Cuentas Asignadas/Compradas</h6>
                    <div className="table-responsive rounded-3 border shadow-sm" style={{ maxHeight: '400px' }}>
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th className="fw-semibold text-muted py-3">Servicio</th>
                                    <th className="fw-semibold text-muted py-3">Correo</th>
                                    <th className="fw-semibold text-muted py-3 text-center">F. de Compra</th>
                                    <th className="fw-semibold text-muted py-3 text-center">Datos Acceso</th>
                                    <th className="fw-semibold text-muted py-3 text-center">Estado</th>
                                    <th className="fw-semibold text-muted py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cuentasPorCliente.length > 0 ? (
                                    cuentasPorCliente.map(cta => (
                                        <tr key={cta.id}>
                                            <td className="fw-bold">
                                                <div className="d-flex align-items-center gap-2">
                                                    {cta.servicio?.imagen && <img src={cta.servicio.imagen} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />}
                                                    <span>{cta.servicio?.nombre || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="fw-semibold">{cta.correo}</td>
                                            <td className="text-center text-secondary small">{formatearFecha(cta.fecha_compra)}</td>
                                            <td className="text-center">
                                                <div className="small fw-bold border bg-light rounded px-2 py-1 mb-1 d-inline-block">
                                                    P: {cta.perfil || '-'}
                                                </div>
                                                <br />
                                                <div className="small text-muted border bg-light rounded px-2 py-1 d-inline-block">
                                                    PIN: {cta.pin || '-'}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge-lasso badge-lasso-${getBadgeColorEstado(cta.estado)} px-2 py-1`}>
                                                    {cta.estado}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <CButton className="btn-lasso btn-lasso-soft-info py-1 px-2" onClick={() => handleCopiar(cta)} title="Copiar Datos">
                                                    <CIcon icon={cilCopy} size="sm" /> Copiar
                                                </CButton>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center text-muted py-4">
                                            No se encontraron otras cuentas para este cliente.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CModalBody>
                <CModalFooter className="border-top-0 pt-0 mt-3">
                    <CButton color="primary" variant="outline" className="fw-bold rounded-pill px-4" onClick={cerrarDetalles}>
                        Cerrar panel
                    </CButton>
                </CModalFooter>
            </CModal>
        </div>
    )
}

export default CuentasVendidas