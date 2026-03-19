import React from 'react'
import {
    CModal,
    CModalHeader,
    CModalTitle,
    CModalBody,
    CModalFooter,
    CButton
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTrash, cilWarning, cilInfo } from '@coreui/icons'

/**
 * Universal Confirmation Modal for Lasso App
 * 
 * @param {boolean} visible - Controlled visibility
 * @param {function} onClose - Function to close the modal
 * @param {function} onConfirm - Function to execute on confirm
 * @param {string} title - Main title
 * @param {string} message - Main question/message
 * @param {string} subMessage - Smaller explanatory text
 * @param {string} type - 'danger', 'warning', 'info' (defaults to danger)
 * @param {string} confirmLabel - Text for the confirm button
 * @param {boolean} isLoading - Disables button and shows loading state
 */
const ConfirmModal = ({ 
    visible, 
    onClose, 
    onConfirm, 
    title = 'Confirmar Acción',
    message = '¿Estás seguro de realizar esta acción?',
    subMessage = 'Esta acción no se puede deshacer.',
    type = 'danger',
    confirmLabel = 'Sí, confirmar',
    isLoading = false
}) => {
    
    const colors = {
        danger: 'var(--lasso-danger)',
        warning: 'var(--lasso-warning)',
        info: 'var(--lasso-info)'
    }

    const icons = {
        danger: cilTrash,
        warning: cilWarning,
        info: cilInfo
    }

    const selectedColor = colors[type] || colors.danger
    const selectedIcon = icons[type] || icons.danger

    return (
        <CModal visible={visible} onClose={onClose} alignment="center" className="lasso-modal">
            <CModalHeader onClose={onClose}>
                <CModalTitle className={`fw-bold ${type === 'danger' ? 'text-danger' : ''}`}>
                    {title}
                </CModalTitle>
            </CModalHeader>
            <CModalBody className="p-4 text-center">
                <div className="mb-4">
                    <CIcon icon={selectedIcon} size="3xl" className={`opacity-50 ${type === 'danger' ? 'text-danger' : ''}`} />
                </div>
                <h6 className="fw-bold">{message}</h6>
                <p className="text-muted small mb-0">{subMessage}</p>
            </CModalBody>
            <CModalFooter className="justify-content-center">
                <CButton 
                    className="btn-lasso btn-lasso-soft-primary border-0 px-4" 
                    onClick={onClose}
                    disabled={isLoading}
                >
                    No, cancelar
                </CButton>
                <CButton 
                    className="btn-lasso btn-lasso-primary px-4" 
                    style={{ background: selectedColor }} 
                    onClick={onConfirm} 
                    disabled={isLoading}
                >
                    {isLoading ? 'Procesando...' : confirmLabel}
                </CButton>
            </CModalFooter>
        </CModal>
    )
}

export default ConfirmModal
