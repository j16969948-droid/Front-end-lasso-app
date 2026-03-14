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

const WidgetsDropdown = ({ data }) => {
  return (
    <CRow className="mb-4 p-2" xs={{ gutter: 4 }}>
      <CCol sm={6} xl={3}>
        <CCard className="dashboard-card bg-gradient-indigo text-white h-100">
          <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
            <div>
              <div className="stats-value">{formatearMonto(data?.revenue || 0)}</div>
              <div className="stats-title">Ventas Totales</div>
            </div>
            <CIcon icon={cilDollar} size="xl" className="stats-icon-bg" />
          </CCardBody>
          <div className="mt-3 px-3 pb-3">
            <small className="opacity-70">Actualizado recientemente</small>
          </div>
        </CCard>
      </CCol>
      <CCol sm={6} xl={3}>
        <CCard className="dashboard-card bg-gradient-rose text-white h-100">
          <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
            <div>
              <div className="stats-value">{data?.pending || 0}</div>
              <div className="stats-title">Pagos Pendientes</div>
            </div>
            <CIcon icon={cilBell} size="xl" className="stats-icon-bg" />
          </CCardBody>
          <div className="mt-3 px-3 pb-3">
            <small className="opacity-70">Requieren validación</small>
          </div>
        </CCard>
      </CCol>
      <CCol sm={6} xl={3}>
        <CCard className="dashboard-card bg-gradient-cyan text-white h-100">
          <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
            <div>
              <div className="stats-value">{data?.inventory || 0}</div>
              <div className="stats-title">Items Inventario</div>
            </div>
            <CIcon icon={cilLibrary} size="xl" className="stats-icon-bg" />
          </CCardBody>
          <div className="mt-3 px-3 pb-3">
            <small className="opacity-70">Stock general</small>
          </div>
        </CCard>
      </CCol>
      <CCol sm={6} xl={3}>
        <CCard className="dashboard-card bg-gradient-emerald text-white h-100">
          <CCardBody className="pb-0 d-flex justify-content-between align-items-start">
            <div>
              <div className="stats-value">{data?.services || 0}</div>
              <div className="stats-title">Servicios Activos</div>
            </div>
            <CIcon icon={cilMemory} size="xl" className="stats-icon-bg" />
          </CCardBody>
          <div className="mt-3 px-3 pb-3">
            <small className="opacity-70">Catálogo de servicios</small>
          </div>
        </CCard>
      </CCol>
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  data: PropTypes.object,
}

export default WidgetsDropdown
