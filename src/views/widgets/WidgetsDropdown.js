import React from 'react'
import PropTypes from 'prop-types'

import {
  CRow,
  CCol,
  CCard,
  CCardBody,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilDollar, cilBell, cilLibrary, cilMemory } from '@coreui/icons'
import { formatearMonto } from '../../utils/formatters'

import StatCard from '../../components/StatCard'

const WidgetsDropdown = ({ data }) => {
  return (
    <CRow className="g-4 mb-4">
      <CCol sm={6} xl={3}>
        <StatCard
          title="Ventas Totales"
          value={formatearMonto(data?.revenue || 0)}
          text="Actualizado hace 5m"
          icon={cilDollar}
          color="primary"
        />
      </CCol>
      
      <CCol sm={6} xl={3}>
        <StatCard
          title="Pagos Pendientes"
          value={data?.pending || 0}
          text="Requieren atención"
          icon={cilBell}
          color="danger"
        />
      </CCol>

      <CCol sm={6} xl={3}>
        <StatCard
          title="Stock Inventario"
          value={data?.inventory || 0}
          text="En catálogo"
          icon={cilLibrary}
          color="info"
        />
      </CCol>

      <CCol sm={6} xl={3}>
        <StatCard
          title="Servicios Activos"
          value={data?.services || 0}
          text="En este momento"
          icon={cilMemory}
          color="success"
        />
      </CCol>
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  data: PropTypes.object,
}

export default WidgetsDropdown
