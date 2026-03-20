import React from 'react'
import classNames from 'classnames'
import {
    CAvatar,
    CCard,
    CCardBody,
    CCol,
    CRow,
    CTable,
    CTableBody,
    CTableDataCell,
    CTableRow,
    CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
    cilPeople, cilArrowRight
} from '@coreui/icons'

import { usePagosTotales } from '../../core/hooks/usePagosTotales'
import { usePagosEntrantes } from '../../core/hooks/usePagosEntrantes'
import { useInventario } from '../../core/hooks/useInventario'
import { useServicios, useInventarioDisponible } from '../../core/hooks/useServicios'
import { formatearMonto } from '../../utils/formatters'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import './dashboard.css'

const Dashboard = () => {
    const { data: pagosTotales, isLoading: loadingTotales } = usePagosTotales()
    const { data: pagosEntrantes, isLoading: loadingEntrantes } = usePagosEntrantes()
    const { data: inventario, isLoading: loadingInventario } = useInventario()
    const { data: servicios, isLoading: loadingServicios } = useServicios()
    const { data: stockDisponible, isLoading: loadingStock } = useInventarioDisponible()

    const isLoading = loadingTotales || loadingEntrantes || loadingInventario || loadingServicios || loadingStock

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
                <CSpinner color="primary" variant="grow" />
            </div>
        )
    }

    const getArrayData = (data) => (Array.isArray(data) ? data : data?.data || [])

    const pagosTotalesList = getArrayData(pagosTotales)
    const pagosEntrantesList = getArrayData(pagosEntrantes)
    const inventarioList = getArrayData(inventario)
    const serviciosList = getArrayData(servicios)

    const totalRevenue = pagosTotalesList.reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0)
    const pendingPayments = pagosEntrantesList.filter((p) => p.estado === 'pendiente').length
    const totalInventory = inventarioList.length
    const totalServices = serviciosList.length

    const widgetData = {
        revenue: totalRevenue,
        pending: pendingPayments,
        inventory: totalInventory,
        services: totalServices
    }

    const recentPayments = pagosEntrantesList.slice(0, 8)
    const stockList = Array.isArray(stockDisponible) ? stockDisponible : []

    return (
        <div className="fade-up">
            <div className="p-4">
                <h1 className="section-title">Panel de Control</h1>
                <p className="section-subtitle">Bienvenido al administrador de Lasso. Aquí tienes un resumen general de tu negocio.</p>
            </div>

            <WidgetsDropdown className="mb-5" data={widgetData} />

            <CRow className="g-4 mb-5">
                <CCol lg={8}>
                    <CCard className="premium-card h-100 border-0 shadow-sm">
                        <CCardBody className="p-4 p-md-5">
                            <div className="d-flex justify-content-between align-items-start mb-4">
                                <div>
                                    <h4 className="fw-bold mb-1">Flujo de Ingresos</h4>
                                    <div className="text-muted small">Análisis detallado de ventas mensuales</div>
                                </div>
                            </div>
                            <div style={{ height: '350px', marginTop: '20px' }}>
                                <MainChart />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>

                <CCol lg={4}>
                    <CCard className="premium-card h-100 border-0 shadow-sm">
                        <CCardBody className="p-4 p-md-5">
                            <h4 className="fw-bold mb-4">Actividad Reciente</h4>
                            <div className="table-lasso-container">
                                <CTable align="middle" className="mb-0 table-lasso" responsive>
                                    <CTableBody>
                                        {recentPayments?.map((pago, index) => (
                                            <CTableRow key={`${pago.id || 'pago'}-${index}`}>
                                                <CTableDataCell className="ps-0 py-3">
                                                    <div className="d-flex align-items-center gap-3">
                                                        <CAvatar
                                                            size="md"
                                                            className={`bg-opacity-10 text-${pago.estado === 'validado' ? 'success' : 'warning'} bg-${pago.estado === 'validado' ? 'success' : 'warning'}`}
                                                        >
                                                            {pago.cliente?.charAt(0) || 'C'}
                                                        </CAvatar>
                                                        <div>
                                                            <div className="fw-bold small">{pago.cliente_id || 'Usuario'}</div>
                                                            <div className="text-muted x-small">ID: {pago.id}</div>
                                                        </div>
                                                    </div>
                                                </CTableDataCell>
                                                <CTableDataCell className="text-end pe-0 py-3">
                                                    <div className="fw-bold text-primary small">{formatearMonto(pago.monto_pagado)}</div>
                                                    <span className={`badge-lasso badge-lasso-${pago.estado === 'validado' ? 'success' : 'warning'} x-small mt-1`}>
                                                        {pago.estado}
                                                    </span>
                                                </CTableDataCell>
                                            </CTableRow>
                                        ))}
                                        {recentPayments.length === 0 && (
                                            <CTableRow>
                                                <CTableDataCell colSpan="2" className="text-center py-5 text-muted small">
                                                    No hay actividad reciente.
                                                </CTableDataCell>
                                            </CTableRow>
                                        )}
                                    </CTableBody>
                                </CTable>
                            </div>
                            <div className="mt-4 pt-4 border-top text-center text-muted x-small fw-bold text-uppercase" style={{ cursor: 'pointer', letterSpacing: '0.1em' }}>
                                Ver todos los pagos <CIcon icon={cilArrowRight} className="ms-1" size="sm" />
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
            <CRow className="g-4 mb-5">
                <CCol lg={12}>
                    <CCard className="premium-card border-0 shadow-sm">
                        <CCardBody className="p-4 p-md-5">
                            <h4 className="fw-bold mb-4">Stock Disponible por Servicio</h4>
                            <CRow className="g-3">
                                {stockList.map((item) => (
                                    <CCol key={item.id} sm={6} md={4} lg={3}>
                                        <div className="p-3 bg-light rounded-3 border border-light-subtle d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="lasso-label small" style={{ fontSize: '0.7rem' }}>{item.nombre}</div>
                                                <div className="fw-bold fs-5">{item.disponible_count}</div>
                                            </div>
                                            <div className={`rounded-circle bg-${item.disponible_count > 5 ? 'success' : 'danger'} bg-opacity-10 p-2`}>
                                                <div className={`rounded-circle bg-${item.disponible_count > 5 ? 'success' : 'danger'}`} style={{ width: '8px', height: '8px' }}></div>
                                            </div>
                                        </div>
                                    </CCol>
                                ))}
                                {stockList.length === 0 && (
                                    <div className="text-center py-4 text-muted small">Cargando información de inventario...</div>
                                )}
                            </CRow>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </div>
    )
}


export default Dashboard
