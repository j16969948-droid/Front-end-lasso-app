import React, { useMemo, useState } from 'react'
import {
    CRow,
    CCol,
    CFormSelect,
    CFormLabel,
    CBadge,
} from '@coreui/react'
import { useUsers } from '../../core/hooks/useUsers'
import { formatearMonto } from '../../utils/formatters'
import DataTable from '../../components/DataTable'
import { LoadingState, ErrorState } from '../../components/TableFeedback'

const Usuarios = () => {
    const [filtroRol, setFiltroRol] = useState('')
    
    // Convertimos el ID del rol a array para el hook si existe
    const filters = useMemo(() => {
        return filtroRol ? { roles: [Number(filtroRol)] } : {}
    }, [filtroRol])

    const { data, isLoading, error, refetch } = useUsers(filters)

    const usuarios = useMemo(() => {
        return Array.isArray(data) ? data : []
    }, [data])

    const columns = [
        { header: 'ID', key: 'id', renderFunc: (row) => <span className="text-muted fw-bold">#{row.id}</span> },
        { 
            header: 'Nombre', 
            key: 'nombre', 
            renderFunc: (row) => <div className="fw-semibold">{row.nombre}</div> 
        },
        { 
            header: 'Teléfono', 
            key: 'telefono', 
            renderFunc: (row) => <span className="text-secondary">{row.telefono || '-'}</span> 
        },
        {
            header: 'Roles',
            key: 'roles',
            renderFunc: (row) => (
                <div className="d-flex flex-wrap gap-1">
                    {(row.roles || []).map(r => (
                        <CBadge key={r.id} color="info" className="badge-lasso-mini">
                            {r.nombre}
                        </CBadge>
                    ))}
                </div>
            )
        },
        {
            header: 'Saldo',
            key: 'saldo',
            renderFunc: (row) => (
                <span className={`fw-bold ${Number(row.saldo) > 0 ? 'text-success' : 'text-muted'}`}>
                    ${formatearMonto(row.saldo || 0)}
                </span>
            )
        },
        {
            header: 'Estado',
            key: 'estado',
            renderFunc: (row) => {
                const isActivo = row.estado === 'activo'
                return (
                    <CBadge className={`badge-lasso badge-lasso-${isActivo ? 'success' : 'danger'}`}>
                        {row.estado || 'N/A'}
                    </CBadge>
                )
            }
        }
    ]

    const filterControls = (
        <CRow>
            <CCol md={4}>
                <CFormLabel className="lasso-label small">Filtrar por Rol</CFormLabel>
                <CFormSelect 
                    className="lasso-input" 
                    value={filtroRol} 
                    onChange={(e) => setFiltroRol(e.target.value)}
                >
                    <option value="">Todos los roles</option>
                    <option value="1">Admin</option>
                    <option value="2">Vendedor</option>
                    <option value="3">Revendedor</option>
                    <option value="4">Cliente</option>
                </CFormSelect>
                <div className="mt-1 x-small text-muted">Ajusta los IDs según tu BD si es necesario.</div>
            </CCol>
        </CRow>
    )

    if (isLoading) return <LoadingState message="Cargando usuarios..." />
    if (error) return <ErrorState message="Error al cargar la lista de usuarios" onRetry={() => refetch()} />

    return (
        <div className="fade-up">
            <DataTable
                title="Gestión de Usuarios"
                subtitle="Listado general de personal, revendedores y clientes con sus respectivos saldos."
                data={usuarios}
                columns={columns}
                filterControls={filterControls}
                searchPlaceholder="Buscar por nombre o teléfono..."
                searchFunction={(item, term) => 
                    item.nombre.toLowerCase().includes(term.toLowerCase()) ||
                    String(item.telefono || '').includes(term)
                }
            />
        </div>
    )
}

export default Usuarios
