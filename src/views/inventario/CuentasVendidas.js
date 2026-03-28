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
import { cilCopy, cilUser, cilCheckCircle, cilChartPie, cilCalendar, cilX } from '@coreui/icons'
import { useInventario } from '../../core/hooks/useInventario'
import { useServicios } from '../../core/hooks/useServicios'
import { usePagosEntrantes } from '../../core/hooks/usePagosEntrantes'
import { useOrdenes } from '../../core/hooks/useOrdenes'
import { formatearFecha, normalizarFecha, getBadgeColorEstado, formatearMonto } from '../../utils/formatters'
import { LoadingState, ErrorState } from '../../components/TableFeedback'
import StatCard from '../../components/StatCard'
import DataTable from '../../components/DataTable'

const CuentasVendidas = () => {
    const { data: inventarioData, isLoading: isLoadingInv, error: errorInv } = useInventario()
    const { data: serviciosData, isLoading: isLoadingServ } = useServicios()
    const { data: responsePagos } = usePagosEntrantes()
    const { data: ordenesResponse, isLoading: isLoadingOrdenes } = useOrdenes()
    const pagosEntrantes = responsePagos?.data || []
    
    // Lista de órdenes para relacionar estados
    const listaOrdenes = useMemo(() => {
        if (!ordenesResponse) return []
        return Array.isArray(ordenesResponse) ? ordenesResponse : (ordenesResponse.data || [])
    }, [ordenesResponse])

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

    // Pago asociado a la orden seleccionada (por cliente y fecha)
    const pagoAsociado = useMemo(() => {
        if (!clienteSeleccionado || !Array.isArray(pagosEntrantes)) return null

        const selFecha = normalizarFecha(clienteSeleccionado.fecha_compra)
        const selClienteId = String(clienteSeleccionado.cliente_id_asignado || '').toLowerCase()
        const selTelefono = String(clienteSeleccionado.telefono_asignado || '').toLowerCase()

        return pagosEntrantes.find(p => {
            const pagoFecha = normalizarFecha(p.fecha_comprobante || p.fecha)
            const matchesFecha = pagoFecha === selFecha

            const pagoClienteId = String(p.user_id || p.cliente_id || '').toLowerCase()
            const matchesCliente = (selClienteId && pagoClienteId.includes(selClienteId)) ||
                (selTelefono && pagoClienteId.includes(selTelefono))

            return matchesFecha && matchesCliente
        })
    }, [clienteSeleccionado, pagosEntrantes])

    // Orden asociada al cliente seleccionado
    const ordenAsociada = useMemo(() => {
        if (!clienteSeleccionado || !listaOrdenes.length) return null

        let ordenId = clienteSeleccionado.orden_id || 
                      clienteSeleccionado.pivot?.orden_id || 
                      clienteSeleccionado.orden_inventario?.orden_id;
        
        if (!ordenId && clienteSeleccionado.estado && !isNaN(Number(clienteSeleccionado.estado))) {
            ordenId = Number(clienteSeleccionado.estado);
        }

        let orden = ordenId ? listaOrdenes.find(o => String(o.id) === String(ordenId)) : null;

        if (!orden) {
            const selFecha = normalizarFecha(clienteSeleccionado.fecha_compra);
            const selClienteId = String(clienteSeleccionado.cliente_id_asignado || '').toLowerCase();
            const selTelefono = String(clienteSeleccionado.telefono_asignado || '').toLowerCase();

            orden = listaOrdenes.find(o => {
                const ordenUserId = String(o.usuario?.id || o.user_id || o.cliente_id || '').toLowerCase();
                const ordenTelefono = String(o.usuario?.telefono || o.telefono || '').toLowerCase();
                
                const matchesCliente = (selClienteId && ordenUserId && ordenUserId.includes(selClienteId)) || 
                                       (selTelefono && ordenTelefono && ordenTelefono.includes(selTelefono));
                
                const ordenFecha = normalizarFecha(o.created_at || o.fecha);
                const matchesFecha = !selFecha || !ordenFecha || selFecha === ordenFecha;
                
                return matchesCliente && matchesFecha;
            });
        }
        return orden;
    }, [clienteSeleccionado, listaOrdenes])

    // Calcular servicios pendientes de entregar
    const serviciosPendientes = useMemo(() => {
        if (!ordenAsociada || !ordenAsociada.servicios) return []
        
        // Contamos cuántas cuentas se han entregado por servicio en esta compra
        const entregadasPorServicio = {}
        cuentasPorCliente.forEach(c => {
            if (c.servicio_id) {
                entregadasPorServicio[c.servicio_id] = (entregadasPorServicio[c.servicio_id] || 0) + 1
            }
        })

        const pendientes = []
        ordenAsociada.servicios.forEach(s => {
            const pedido = s.cantidad || 0
            const entregado = entregadasPorServicio[s.id] || 0
            const falta = pedido - entregado
            if (falta > 0) {
                pendientes.push({
                    id: s.id,
                    nombre: s.nombre,
                    pedido: pedido,
                    entregado: entregado,
                    falta: falta
                })
            }
        })

        return pendientes
    }, [ordenAsociada, cuentasPorCliente])

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
            header: 'Estado',
            key: 'estado',
            renderFunc: (row) => {
                const primerCuenta = row.cuentas_asociadas?.[0];
                let ordenId = row.orden_id || 
                              primerCuenta?.orden_id || 
                              primerCuenta?.pivot?.orden_id || 
                              primerCuenta?.orden_inventario?.orden_id;
                
                // Si estado actual es numérico, puede que sea el orden_id según se configuró en backend
                if (!ordenId && primerCuenta?.estado && !isNaN(Number(primerCuenta.estado))) {
                    ordenId = Number(primerCuenta.estado);
                }

                let ordenRelacionada = ordenId ? listaOrdenes.find(o => String(o.id) === String(ordenId)) : null;
                
                // Fallback por ID de Cliente y Fecha (si no se encuentra con ID directo)
                if (!ordenRelacionada && primerCuenta) {
                    const selFecha = normalizarFecha(primerCuenta.fecha_compra);
                    const selClienteId = String(primerCuenta.cliente_id_asignado || '').toLowerCase();
                    const selTelefono = String(primerCuenta.telefono_asignado || '').toLowerCase();

                    ordenRelacionada = listaOrdenes.find(o => {
                        const ordenUserId = String(o.usuario?.id || o.user_id || o.cliente_id || '').toLowerCase();
                        const ordenTelefono = String(o.usuario?.telefono || o.telefono || '').toLowerCase();
                        
                        const matchesCliente = (selClienteId && ordenUserId && ordenUserId.includes(selClienteId)) || 
                                               (selTelefono && ordenTelefono && ordenTelefono.includes(selTelefono));
                        
                        const ordenFecha = normalizarFecha(o.created_at || o.fecha);
                        const matchesFecha = !selFecha || !ordenFecha || selFecha === ordenFecha;
                        
                        return matchesCliente && matchesFecha;
                    });
                }

                const estadoOrden = ordenRelacionada ? ordenRelacionada.estado : 'Sin Orden';
                const badgeClass = getBadgeColorEstado(estadoOrden)

                return (
                    <span className={`badge-lasso badge-lasso-${badgeClass}`}>
                        {estadoOrden}
                    </span>
                )
            }
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
                    <div className="lasso-input-group shadow-sm">
                        <CIcon icon={cilCalendar} className="text-muted ms-1" />
                        <CFormInput
                            type="date"
                            value={filtroFecha}
                            onChange={(e) => setFiltroFecha(e.target.value)}
                            className="border-0 p-0 shadow-none bg-transparent text-muted flex-grow-1 w-100"
                        />
                        {filtroFecha && (
                            <CButton
                                size="sm"
                                color="light"
                                className="rounded-circle p-0 d-flex align-items-center justify-content-center shadow-sm flex-shrink-0"
                                style={{ width: '22px', height: '22px' }}
                                onClick={() => setFiltroFecha('')}
                                title="Ver todas las fechas"
                            >
                                <CIcon icon={cilX} size="sm" />
                            </CButton>
                        )}
                    </div>
                </CCol>
            </CRow>
        </div>
    )

    if (isLoadingInv || isLoadingServ || isLoadingOrdenes) return <LoadingState message="Cargando cuentas vendidas..." />
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

                    {pagoAsociado && (
                        <div className="mb-4 premium-card p-3 rounded-4 border-0 shadow-sm bg-primary bg-opacity-10">
                            <h6 className="fw-bold mb-3 text-primary d-flex align-items-center gap-2">
                                <CIcon icon={cilCheckCircle} size="sm" /> Datos del Pago Confirmado
                            </h6>
                            <CRow className="align-items-center g-3">
                                <CCol xs={12} md={4}>
                                    <div className="bg-white p-2 rounded-3 border text-center overflow-hidden" style={{ maxHeight: '200px' }}>
                                        {pagoAsociado.comprobante_url ? (
                                            <img
                                                src={pagoAsociado.comprobante_url}
                                                alt="Comprobante"
                                                className="img-fluid rounded cursor-pointer"
                                                style={{ maxHeight: '180px', objectFit: 'contain' }}
                                                onClick={() => window.open(pagoAsociado.comprobante_url, '_blank')}
                                            />
                                        ) : (
                                            <div className="py-4 text-muted small">Sin imagen disponible</div>
                                        )}
                                    </div>
                                </CCol>
                                <CCol xs={12} md={8}>
                                    <CRow className="g-3">
                                        <CCol xs={6}>
                                            <div className="small text-secondary fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>Fecha Pagada</div>
                                            <div className="fw-bold">{formatearFecha(pagoAsociado.fecha_comprobante || pagoAsociado.fecha)}</div>
                                        </CCol>
                                        <CCol xs={6}>
                                            <div className="small text-secondary fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>Hora</div>
                                            <div className="fw-bold">{pagoAsociado.hora_comprobante || '-'}</div>
                                        </CCol>
                                        <CCol xs={6}>
                                            <div className="small text-secondary fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>Monto Pagado</div>
                                            <div className="fw-bold text-success fs-5">${formatearMonto(pagoAsociado.monto_pagado)}</div>
                                        </CCol>
                                        <CCol xs={6}>
                                            <div className="small text-secondary fw-bold text-uppercase" style={{ fontSize: '0.65rem' }}>Medio/Referencia</div>
                                            <div className="small text-muted text-truncate" title={pagoAsociado.referencia_pago}>
                                                {pagoAsociado.medio_pago || 'N/A'} - {pagoAsociado.referencia_pago || '-'}
                                            </div>
                                        </CCol>
                                    </CRow>
                                </CCol>
                            </CRow>
                        </div>
                    )}

                    {serviciosPendientes.length > 0 && (
                        <div className="mb-4 premium-card p-3 rounded-4 border-1 border-warning shadow-sm bg-warning bg-opacity-10">
                            <h6 className="fw-bold mb-3 text-warning d-flex align-items-center gap-2">
                                <CIcon icon={cilChartPie} size="sm" /> Servicios Pendientes por Entregar
                            </h6>
                            <CRow className="g-3">
                                {serviciosPendientes.map(sp => (
                                    <CCol xs={12} sm={6} md={4} key={sp.id}>
                                        <div className="bg-white p-3 rounded-3 border border-warning border-opacity-50 h-100 d-flex flex-column justify-content-center">
                                            <div className="fw-bold text-dark mb-1">{sp.nombre}</div>
                                            <div className="d-flex justify-content-between x-small text-muted mb-2">
                                                <span>Comprados: {sp.pedido}</span>
                                                <span>Entregados: {sp.entregado}</span>
                                            </div>
                                            <div className="fw-bold text-danger small bg-danger bg-opacity-10 py-1 px-2 rounded-2 text-center mt-auto">
                                                Falta entregar: {sp.falta}
                                            </div>
                                        </div>
                                    </CCol>
                                ))}
                            </CRow>
                        </div>
                    )}

                    <h6 className="fw-bold mb-3 ms-1 border-start border-3 border-primary ps-2">Todas las Cuentas Asignadas/Compradas</h6>
                    <div className="table-responsive rounded-3 border shadow-sm" style={{ maxHeight: '400px' }}>
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light sticky-top">
                                <tr>
                                    <th className="fw-semibold text-muted py-3">Servicio</th>
                                    <th className="fw-semibold text-muted py-3">Correo</th>
                                    <th className="fw-semibold text-muted py-3 text-center">F. de Compra</th>
                                    <th className="fw-semibold text-muted py-3 text-center">Datos Acceso</th>
                                    <th className="fw-semibold text-muted py-3 text-center">Estado Cuenta</th>
                                    <th className="fw-semibold text-muted py-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cuentasPorCliente.length > 0 ? (
                                    cuentasPorCliente.map(cta => {
                                        // Extraemos el estado individual por cuenta (puede venir en cta.estado, cta.pivot.estado o cta.orden_inventario.estado)
                                        const estadoCuenta = cta.pivot?.estado || cta.orden_inventario?.estado || cta.estado || 'N/A';
                                        return (
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
                                                <span className={`badge-lasso badge-lasso-${getBadgeColorEstado(estadoCuenta)}`}>
                                                    {estadoCuenta}
                                                </span>
                                            </td>
                                            <td className="text-center">
                                                <CButton className="btn-lasso btn-lasso-soft-info py-1 px-2" onClick={() => handleCopiar(cta)} title="Copiar Datos">
                                                    <CIcon icon={cilCopy} size="sm" /> Copiar
                                                </CButton>
                                            </td>
                                        </tr>
                                        )
                                    })
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