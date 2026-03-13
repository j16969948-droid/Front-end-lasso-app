import React from 'react'
import { CSpinner, CCard, CCardBody, CButton } from '@coreui/react'

export const LoadingState = ({ message = 'Cargando información...' }) => (
    <div className="text-center py-5">
        <CSpinner color="primary" />
        <div className="mt-3 fw-semibold">{message}</div>
        <div className="text-medium-emphasis small">Estamos preparando la información para ti</div>
    </div>
)

export const ErrorState = ({ message = 'No se pudo cargar la información', onRetry }) => (
    <CCard className="border-0 shadow-sm">
        <CCardBody className="text-center py-5">
            <div className="fs-5 fw-semibold mb-2">{message}</div>
            <div className="text-medium-emphasis mb-3">Ocurrió un error al consultar la información</div>
            {onRetry && (
                <CButton color="primary" onClick={onRetry}>
                    Reintentar
                </CButton>
            )}
        </CCardBody>
    </CCard>
)
