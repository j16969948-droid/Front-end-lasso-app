import React from 'react'
import PropTypes from 'prop-types'
import { CCard, CCardBody } from '@coreui/react'
import CIcon from '@coreui/icons-react'

/**
 * Componente StatCard Premium
 * 
 * @param {Object} props
 * @param {string} props.title - Título de la métrica
 * @param {string|number} props.value - Valor principal
 * @param {string} props.text - Texto secundario opcional
 * @param {Object} props.icon - Icono de @coreui/icons
 * @param {string} props.color - Color base (primary, info, success, warning, danger)
 */
const StatCard = ({ title, value, text, icon, color = 'primary' }) => {
  return (
    <CCard 
      className="h-100 border-0 shadow-sm transition-all" 
      style={{ 
        borderRadius: '16px', 
        background: `linear-gradient(135deg, rgba(var(--cui-${color}-rgb), 0.1), rgba(var(--cui-${color}-rgb), 0.02))`,
        border: `1px solid rgba(var(--cui-${color}-rgb), 0.05)`
      }}
    >
      <CCardBody className="d-flex align-items-center justify-content-between p-4">
        <div className="overflow-hidden">
          <h6 className="text-secondary fw-bold mb-2 small text-uppercase" style={{ letterSpacing: '0.05em' }}>
            {title}
          </h6>
          <h3 className={`fw-bold text-${color} mb-1 text-truncate`}>
            {value}
          </h3>
          {text && (
            <div className="text-muted small fw-semibold opacity-75">
              {text}
            </div>
          )}
        </div>
        <div 
          className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm flex-shrink-0" 
          style={{ width: '52px', height: '52px', color: `var(--cui-${color})` }}
        >
          <CIcon icon={icon} size="xl" />
        </div>
      </CCardBody>
    </CCard>
  )
}

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  text: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.object, PropTypes.array, PropTypes.string]).isRequired,
  color: PropTypes.string,
}

export default StatCard
