import React, { useState } from 'react'
import {
    CButton,
    CFormInput,
    CSpinner,
    CToaster,
    CToast,
    CToastHeader,
    CToastBody,
    CRow,
    CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilClipboard, cilCheckCircle, cilWarning, cilSync, cilSearch } from '@coreui/icons'
import { useCodigosQuery } from '../../core/hooks/useCodigos'
import DataTable from '../../components/DataTable'

const Codigos = () => {
    const [busqueda, setBusqueda] = useState('')
    const [toast, setToast] = useState(null)

    const { data: codigos = [], isLoading, isError, refetch } = useCodigosQuery({
        correo: busqueda || undefined
    })

    const handleCopiar = (texto) => {
        navigator.clipboard.writeText(texto)
        setToast({
            type: 'info',
            title: 'Copiado al Portapapeles',
            body: 'El contenido se ha copiado correctamente.'
        })
    }

    const columns = [
        { header: 'N°', key: 'id', renderFunc: (row, idx) => <span className="text-muted fw-bold">#{row.id}</span> },
        {
            header: 'Fecha Recibido',
            key: 'creado_en',
            renderFunc: (row) => (
                <div className="small">
                    <div className="fw-semibold">{row.creado_en ? new Date(row.creado_en).toLocaleDateString() : '-'}</div>
                    <div className="text-muted">{row.creado_en ? new Date(row.creado_en).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}</div>
                </div>
            )
        },
        { header: 'Correo Electrónico', key: 'correo', className: 'fw-semibold' },
        {
            header: 'Suscripción',
            key: 'plataforma',
            renderFunc: (row) => {
                const plat = (row.plataforma || '').toLowerCase()
                const badgeClass = plat === 'netflix' ? 'danger' : plat === 'disney' ? 'info' : 'secondary'
                return <span className={`badge-lasso badge-lasso-${badgeClass} text-uppercase`}>{row.plataforma}</span>
            }
        },
        { header: 'Contenido / Código', key: 'codigo', className: 'fw-bold text-primary' },
        {
            header: 'Estado',
            key: 'estado',
            renderFunc: (row) => {
                const est = (row.estado || '').toLowerCase()
                const badgeClass = est === 'entregado' ? 'success' : est === 'pendiente' ? 'warning' : 'danger'
                return <span className={`badge-lasso badge-lasso-${badgeClass}`}>{row.estado}</span>
            }
        },
        {
            header: 'Acciones',
            key: 'acciones',
            renderFunc: (row) => (
                <div className="d-flex gap-2">
                    <CButton className="btn-lasso btn-lasso-soft-primary" onClick={() => handleCopiar(row.codigo)} title="Copiar Código">
                        <CIcon icon={cilClipboard} size="sm" />
                    </CButton>
                </div>
            )
        }
    ]
    return (
        <div className="fade-up">
            <CToaster push={toast} placement="top-end">
                {toast && (
                    <CToast autohide={true} visible={true} className="lasso-modal border-0 shadow-lg">
                        <CToastHeader className="bg-transparent border-0 pb-0">
                            <CIcon icon={toast.type === 'danger' ? cilWarning : cilCheckCircle} className={`me-2 text-${toast.type}`} />
                            <strong className="me-auto section-title">{toast.title}</strong>
                        </CToastHeader>
                        <CToastBody className="pt-2">{toast.body}</CToastBody>
                    </CToast>
                )}
            </CToaster>

            <DataTable
                title="Centro de Códigos"
                subtitle="Monitoreo en tiempo real de códigos de acceso y verificaciones de plataforma."
                data={codigos}
                columns={columns}
                searchPlaceholder="Buscar por correo electrónico..."
                addItemLabel="Actualizar Lista"
                onAddItem={() => refetch()}
                searchFunction={(item, term) => item.correo?.toLowerCase().includes(term.toLowerCase())}
            />
        </div>
    )
}

export default Codigos