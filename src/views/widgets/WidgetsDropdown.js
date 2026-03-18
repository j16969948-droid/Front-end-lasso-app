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
    <CRow className="g-4 mb-4" xs={{ gutter: 4 }}>
      <CCol sm={6} xl={3}>
        <div className="premium-card p-4 h-100 border-0 shadow-sm position-relative overflow-hidden" 
             style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)', color: 'white' }}>
            <div className="position-relative z-1 text-white">
                <div className="text-uppercase fw-bold mb-1 opacity-75" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>Ventas Totales</div>
                <h2 className="fw-bold mb-0">{formatearMonto(data?.revenue || 0)}</h2>
                <div className="mt-3 small opacity-75">Actualizado hace 5m</div>
            </div>
            <CIcon icon={cilDollar} size="xl" className="position-absolute opacity-10" style={{ right: '20px', bottom: '20px', transform: 'scale(1.8)' }} />
        </div>
      </CCol>
      
      <CCol sm={6} xl={3}>
        <div className="premium-card p-4 h-100 border-0 shadow-sm position-relative overflow-hidden" 
             style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)', color: 'white' }}>
            <div className="position-relative z-1 text-white">
                <div className="text-uppercase fw-bold mb-1 opacity-75" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>Pagos Pendientes</div>
                <h2 className="fw-bold mb-0">{data?.pending || 0}</h2>
                <div className="mt-3 small opacity-75">Requieren atención</div>
            </div>
            <CIcon icon={cilBell} size="xl" className="position-absolute opacity-10" style={{ right: '20px', bottom: '20px', transform: 'scale(1.8)' }} />
        </div>
      </CCol>

      <CCol sm={6} xl={3}>
        <div className="premium-card p-4 h-100 border-0 shadow-sm position-relative overflow-hidden" 
             style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', color: 'white' }}>
            <div className="position-relative z-1 text-white">
                <div className="text-uppercase fw-bold mb-1 opacity-75" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>Stock Inventario</div>
                <h2 className="fw-bold mb-0">{data?.inventory || 0}</h2>
                <div className="mt-3 small opacity-75">En catálogo</div>
            </div>
            <CIcon icon={cilLibrary} size="xl" className="position-absolute opacity-10" style={{ right: '20px', bottom: '20px', transform: 'scale(1.8)' }} />
        </div>
      </CCol>

      <CCol sm={6} xl={3}>
        <div className="premium-card p-4 h-100 border-0 shadow-sm position-relative overflow-hidden" 
             style={{ background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)', color: 'white' }}>
            <div className="position-relative z-1 text-white">
                <div className="text-uppercase fw-bold mb-1 opacity-75" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>Servicios Activos</div>
                <h2 className="fw-bold mb-0">{data?.services || 0}</h2>
                <div className="mt-3 small opacity-75">En este momento</div>
            </div>
            <CIcon icon={cilMemory} size="xl" className="position-absolute opacity-10" style={{ right: '20px', bottom: '20px', transform: 'scale(1.8)' }} />
        </div>
      </CCol>
    </CRow>
  )
}

WidgetsDropdown.propTypes = {
  data: PropTypes.object,
}

export default WidgetsDropdown
