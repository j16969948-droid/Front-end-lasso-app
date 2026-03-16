import React, { useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
    CCard,
    CCardBody,
    CFormInput,
    CButton,
    CRow,
    CCol,
    CFormLabel,
} from '@coreui/react'
import DataTable from '../../components/DataTable'

const Validar = () => {
    const location = useLocation()
    const [urlComprobante, setUrlComprobante] = useState(location.state?.url || '')

    const handleValidar = () => {
        console.log('Validando comprobante:', urlComprobante)
        // Lógica de validación aquí
    }

    const columns = [
        { header: 'ID', key: 'id' },
        { header: 'Fecha', key: 'fecha' },
        { header: 'Monto', key: 'monto' },
        { header: 'Estado', key: 'estado' },
        { header: 'Referencia', key: 'referencia' },
    ]

    const searchFunction = (pago, termino) => {
        return (
            String(pago?.id || '').toLowerCase().includes(termino) ||
            String(pago?.referencia || '').toLowerCase().includes(termino)
        )
    }

    return (
        <div className="fade-in-up">
            <CCard className="premium-card mb-4">
                <CCardBody className="p-4">
                    <h4 className="fw-bold mb-3">Validar Comprobante</h4>
                    <p className="text-secondary mb-4">
                        Ingresa la URL del comprobante para verificar automáticamente los datos del pago y cruzarlos con el sistema.
                    </p>
                    <CRow className="g-3 align-items-end">
                        <CCol md={9}>
                            <CFormLabel className="fw-semibold small text-uppercase text-secondary">URL del Comprobante</CFormLabel>
                            <CFormInput
                                type="text"
                                placeholder="https://ejemplo.com/comprobante.jpg"
                                value={urlComprobante}
                                onChange={(e) => setUrlComprobante(e.target.value)}
                                className="premium-input"
                            />
                        </CCol>
                        <CCol md={3}>
                            <CButton
                                color="primary"
                                className="w-100 btn-premium btn-premium-primary"
                                onClick={handleValidar}
                            >
                                Validar Ahora
                            </CButton>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            <DataTable
                title="Pagos Registrados"
                subtitle="Consulta el historial para verificar la validez de los pagos procesados"
                data={[]} // Sin datos por ahora
                columns={columns}
                searchFunction={searchFunction}
                searchPlaceholder="Buscar por ID o referencia..."
            />
        </div>
    )
}

export default Validar