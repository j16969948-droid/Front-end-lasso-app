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
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPeople,
} from '@coreui/icons'

import { usePagosTotales } from '../../core/hooks/usePagosTotales'
import { usePagosEntrantes } from '../../core/hooks/usePagosEntrantes'
import { useInventario } from '../../core/hooks/useInventario'
import { useServicios } from '../../core/hooks/useServicios'
import { formatearMonto } from '../../utils/formatters'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import './dashboard.css'

const Dashboard = () => {
  const { data: pagosTotales, isLoading: loadingTotales } = usePagosTotales()
  const { data: pagosEntrantes, isLoading: loadingEntrantes } = usePagosEntrantes()
  const { data: inventario, isLoading: loadingInventario } = useInventario()
  const { data: servicios, isLoading: loadingServicios } = useServicios()

  const isLoading = loadingTotales || loadingEntrantes || loadingInventario || loadingServicios

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  // Cálculos para los widgets
  const getArrayData = (data) => (Array.isArray(data) ? data : data?.data || [])

  const pagosTotalesList = getArrayData(pagosTotales)
  const pagosEntrantesList = getArrayData(pagosEntrantes)
  const inventarioList = getArrayData(inventario)
  const serviciosList = getArrayData(servicios)

  const totalRevenue = pagosTotalesList.reduce((acc, curr) => acc + (parseFloat(curr.monto) || 0), 0)
  const pendingPayments = pagosEntrantesList.filter((p) => p.estado === 'pendiente').length
  const totalInventory = inventarioList.length
  const totalServices = serviciosList.length

  // Datos para los widgets (pasados por props para simplificar)
  const widgetData = {
    revenue: totalRevenue,
    pending: pendingPayments,
    inventory: totalInventory,
    services: totalServices
  }

  // Pagos recientes
  const recentPayments = pagosEntrantesList.slice(0, 5)

  return (
    <>
      <WidgetsDropdown className="mb-4" data={widgetData} />

      <CCard className="mb-4 dashboard-card">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Resumen de Actividad
              </h4>
              <div className="small text-body-secondary">Histórico de ventas y movimientos</div>
            </CCol>
          </CRow>
          <MainChart />
        </CCardBody>
      </CCard>

      <CRow>
        <CCol xs>
          <CCard className="mb-4 dashboard-card">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="card-title mb-0">Pagos Recientes</h4>
              </div>
              <div className="table-responsive table-premium-container">
                <CTable align="middle" className="mb-0 table-premium">
                  <CTableHead className="text-nowrap">
                    <CTableRow>
                      <CTableHeaderCell className="bg-body-tertiary text-center">
                        <CIcon icon={cilPeople} />
                      </CTableHeaderCell>
                      <CTableHeaderCell className="bg-body-tertiary">Cliente</CTableHeaderCell>
                      <CTableHeaderCell className="bg-body-tertiary text-center">Estado</CTableHeaderCell>
                      <CTableHeaderCell className="bg-body-tertiary">Monto</CTableHeaderCell>
                      <CTableHeaderCell className="bg-body-tertiary">Fecha</CTableHeaderCell>
                    </CTableRow>
                  </CTableHead>
                  <CTableBody>
                    {recentPayments?.map((pago, index) => (
                      <CTableRow key={`${pago.id || 'pago'}-${index}`}>
                        <CTableDataCell className="text-center">
                          <CAvatar size="md" color={pago.estado === 'validado' ? 'success' : 'warning'} textColor="white">
                            {pago.cliente?.charAt(0) || 'C'}
                          </CAvatar>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="fw-bold">{pago.cliente_id || 'Desconocido'}</div>
                          <div className="small text-body-secondary">ID: {pago.id}</div>
                        </CTableDataCell>
                        <CTableDataCell className="text-center">
                          <span className={`badge ${pago.estado === 'validado' ? 'bg-success' :
                            pago.estado === 'pendiente' ? 'bg-warning' :
                              'bg-danger'
                            }`}>
                            {pago.estado}
                          </span>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="fw-semibold text-primary">{formatearMonto(pago.monto_pagado)}</div>
                        </CTableDataCell>
                        <CTableDataCell>
                          <div className="small text-body-secondary">{pago.fecha}</div>
                          <div className="fw-semibold">{pago.hora}</div>
                        </CTableDataCell>
                      </CTableRow>
                    ))}
                    {recentPayments.length === 0 && (
                      <CTableRow>
                        <CTableDataCell colSpan="5" className="text-center py-4 text-muted">
                          No hay pagos recientes registrados.
                        </CTableDataCell>
                      </CTableRow>
                    )}
                  </CTableBody>
                </CTable>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
