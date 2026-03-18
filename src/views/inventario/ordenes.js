import React, { useMemo, useState } from 'react'
import {
    CRow,
    CCol,
    CButton,
    CBadge,
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CTable,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableBody,
    CTableDataCell,
    CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilSearch, cilCheckCircle } from '@coreui/icons'
import { useOrdenes, useDeleteOrdenes, useUpdateOrdenes } from '../../core/hooks/useOrdenes'
import { formatearMonto } from '../../utils/formatters'
import DataTable from '../../components/DataTable'
import { LoadingState, ErrorState } from '../../components/TableFeedback'

const Ordenes = () => {
    const { data, isLoading, error, refetch } = useOrdenes()
    const deleteMutation = useDeleteOrdenes()
    const updateMutation = useUpdateOrdenes()
    
    const [modalDetalleVisible, setModalDetalleVisible] = useState(false)
    const [ordenSeleccionada, setOrdenSeleccionada] = useState(null)
    const [isDelivering, setIsDelivering] = useState(false)

    const listaOrdenes = useMemo(() => {
        if (!data) return []
        return Array.isArray(data) ? data : (data.data || [])
    }, [data])

    const handleVerDetalles = (orden) => {
        setOrdenSeleccionada(orden)
        setModalDetalleVisible(true)
    }

    const handleEliminar = (id) => {
        if (window.confirm('¿Estás seguro de eliminar esta orden?')) {
            deleteMutation.mutate(id)
        }
    }

    const handleEntregar = async (id) => {
        if (!window.confirm('¿Confirmas que deseas entregar la cuenta para esta orden?')) return
        
        setIsDelivering(true)
        try {
            await updateMutation.mutateAsync({ 
                id, 
                data: { estado: 'entregado' } 
            })
            setModalDetalleVisible(false)
        } catch (err) {
            console.error('Error al entregar:', err)
        } finally {
            setIsDelivering(false)
        }
    }

    const columns = [
        { header: 'ID', key: 'id', renderFunc: (row) => <span className="fw-bold">#{row.id}</span> },
        {
            header: 'Usuario',
            key: 'usuario',
            renderFunc: (row) => <span className="fw-semibold">{row.usuario?.nombre || 'Desconocido'}</span>
        },
        {
            header: 'Monto Total',
            key: 'total',
            renderFunc: (row) => <span className="fw-bold text-success">${formatearMonto(row.total)}</span>
        },
        {
            header: 'Estado',
            key: 'estado',
            renderFunc: (row) => {
                const est = (row.estado || '').toLowerCase()
                let badgeClass = 'secondary'
                if (est === 'completada' || est === 'pagado' || est === 'aprobado' || est === 'entregado') badgeClass = 'success'
                else if (est === 'pendiente') badgeClass = 'warning'
                else if (est === 'cancelada') badgeClass = 'danger'

                return <CBadge className={`badge-lasso badge-lasso-${badgeClass}`}>{row.estado || 'N/A'}</CBadge>
            }
        },
        {
            header: 'Acciones',
            key: 'acciones',
            renderFunc: (row) => (
                <div className="d-flex gap-2">
                    <CButton className="btn-lasso btn-lasso-soft-info" onClick={() => handleVerDetalles(row)} title="Ver Detalles">
                        <CIcon icon={cilSearch} size="sm" />
                    </CButton>
                    <CButton className="btn-lasso btn-lasso-soft-primary" onClick={() => console.log('Editar', row.id)} title="Editar">
                        <CIcon icon={cilPencil} size="sm" />
                    </CButton>
                    <CButton className="btn-lasso btn-lasso-soft-danger" onClick={() => handleEliminar(row.id)} title="Eliminar">
                        <CIcon icon={cilTrash} size="sm" />
                    </CButton>
                </div>
            )
        }
    ]

    if (isLoading) return <LoadingState message="Cargando órdenes..." />
    if (error) return <ErrorState message="Error al cargar las órdenes" onRetry={() => refetch()} />

    return (
        <div className="fade-up">
            <DataTable
                title="Lista de Órdenes"
                subtitle="Registro histórico de pedidos y transacciones."
                data={listaOrdenes}
                columns={columns}
                searchPlaceholder="Buscar por nombre de usuario..."
                searchFunction={(item, term) =>
                    String(item.usuario?.nombre || '').toLowerCase().includes(term.toLowerCase()) ||
                    String(item.id || '').includes(term)
                }
            />

            {/* Modal de Detalles */}
            <CModal visible={modalDetalleVisible} onClose={() => setModalDetalleVisible(false)} size="lg" alignment="center" className="lasso-modal">
                <CModalHeader className="border-0 pb-0">
                    <CModalTitle className="section-title h4">Detalle de la Orden #{ordenSeleccionada?.id}</CModalTitle>
                </CModalHeader>
                <CModalBody className="p-4">
                    <div className="mb-4">
                        <label className="lasso-label mb-2">Servicios Incluidos</label>
                        <div className="table-lasso-container shadow-sm border rounded-3 overflow-hidden">
                            <CTable align="middle" className="mb-0 table-lasso" responsive hover>
                                <CTableHead className="bg-light">
                                    <CTableRow>
                                        <CTableHeaderCell className="text-uppercase small pt-3 pb-3 ps-3">Servicio</CTableHeaderCell>
                                        <CTableHeaderCell className="text-uppercase small pt-3 pb-3">Cantidad</CTableHeaderCell>
                                        <CTableHeaderCell className="text-uppercase small pt-3 pb-3 text-end pe-3">Subtotal</CTableHeaderCell>
                                    </CTableRow>
                                </CTableHead>
                                <CTableBody>
                                    {ordenSeleccionada?.servicios && ordenSeleccionada.servicios.length > 0 ? (
                                        ordenSeleccionada.servicios.map((item, idx) => (
                                            <CTableRow key={idx}>
                                                <CTableDataCell className="py-3 ps-3">
                                                    <div className="fw-semibold">{item.nombre || 'Desconocido'}</div>
                                                    <div className="text-muted x-small">ID: #{item.id}</div>
                                                </CTableDataCell>
                                                <CTableDataCell className="py-3">{item.cantidad} x ${formatearMonto(item.precio_unitario)}</CTableDataCell>
                                                <CTableDataCell className="py-3 text-end pe-3 fw-bold text-success">
                                                    ${formatearMonto(item.cantidad * item.precio_unitario)}
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))
                                    ) : (
                                        <CTableRow>
                                            <CTableDataCell colSpan={3} className="text-center py-4 text-muted small">
                                                No se encontraron servicios asociados a esta orden.
                                            </CTableDataCell>
                                        </CTableRow>
                                    )}
                                </CTableBody>
                            </CTable>
                        </div>
                    </div>

                    <CRow className="g-4">
                        <CCol md={6}>
                            <div className="p-3 bg-light rounded-3 border border-light-subtle">
                                <div className="lasso-label mb-1" style={{ fontSize: '0.7rem' }}>Total General</div>
                                <div className="fw-bold text-success fs-4">${formatearMonto(ordenSeleccionada?.total)}</div>
                            </div>
                        </CCol>
                        <CCol md={6}>
                            <div className="p-3 bg-light rounded-3 border border-light-subtle">
                                <div className="lasso-label mb-1" style={{ fontSize: '0.7rem' }}>Usuario / Cliente</div>
                                <div className="fw-bold fs-5">{ordenSeleccionada?.usuario?.nombre || 'Desconocido'}</div>
                            </div>
                        </CCol>
                    </CRow>
                </CModalBody>
                <CModalFooter className="border-0 pt-0 gap-2">
                    <CButton 
                        className="btn-lasso btn-lasso-soft-secondary px-4" 
                        onClick={() => setModalDetalleVisible(false)}
                        disabled={isDelivering}
                    >
                        Cerrar
                    </CButton>
                    <CButton 
                        className="btn-lasso btn-lasso-success px-4 d-flex align-items-center gap-2" 
                        onClick={() => handleEntregar(ordenSeleccionada?.id)}
                        disabled={isDelivering || ordenSeleccionada?.estado === 'entregado'}
                    >
                        {isDelivering ? (
                            <CSpinner size="sm" />
                        ) : (
                            <CIcon icon={cilCheckCircle} size="sm" />
                        )}
                        Entregar Cuenta
                    </CButton>
                </CModalFooter>
            </CModal>
        </div>
    )
}

export default Ordenes