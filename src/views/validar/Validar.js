import React, { useState } from 'react'
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
    const [urlComprobante, setUrlComprobante] = useState('')

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
        <div className="fade-in">
            <CCard className="border-0 shadow-sm mb-4 rounded-4">
                <CCardBody className="p-4">
                    <h4 className="fw-bold mb-3">Validar comprobante</h4>
                    <p className="text-medium-emphasis mb-4">
                        Ingresa la URL del comprobante para verificar los datos del pago.
                    </p>
                    <CRow className="g-3 align-items-end">
                        <CCol md={9}>
                            <CFormLabel className="fw-semibold">URL del Comprobante</CFormLabel>
                            <CFormInput
                                type="text"
                                placeholder="URL del comprobante"
                                value={urlComprobante}
                                onChange={(e) => setUrlComprobante(e.target.value)}
                                className="py-2"
                            />
                        </CCol>
                        <CCol md={3}>
                            <CButton
                                color="primary"
                                className="w-100 py-2 fw-semibold rounded-3 shadow-sm"
                                onClick={handleValidar}
                            >
                                Validar
                            </CButton>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>

            <DataTable
                title="Pagos Registrados"
                subtitle="Consulta el historial para verificar la validez de los pagos"
                data={[]} // Sin datos por ahora
                columns={columns}
                searchFunction={searchFunction}
                searchPlaceholder="Buscar por ID o referencia..."
            />
        </div>
    )
}

export default Validar