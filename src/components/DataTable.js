import React from 'react'
import {
    CCard,
    CCardBody,
    CTable,
    CTableBody,
    CTableHead,
    CTableRow,
    CTableHeaderCell,
    CTableDataCell,
    CFormInput,
    CRow,
    CCol,
    CButton,
    CBadge,
    CFormLabel,
} from '@coreui/react'
import { useDataTable } from '../core/hooks/useDataTable'
import Pagination from './Pagination'

/**
 * DataTable Genérico
 * 
 * @param {Object} props
 * @param {string} props.title - Título de la tabla
 * @param {string} props.subtitle - Subtítulo descriptivo
 * @param {Array} props.data - Datos originales
 * @param {Array} props.columns - Definición de columnas {header, key, renderFunc, className}
 * @param {Function} props.searchFunction - Función de búsqueda personalizada
 * @param {Function} props.onAddItem - Función para el botón "+ Nuevo" (opcional)
 * @param {string} props.addItemLabel - Texto del botón de agregar
 * @param {string} props.searchPlaceholder - Placeholder del buscador
 */
const DataTable = ({
    title,
    subtitle,
    data,
    columns,
    searchFunction,
    filterFunction,
    onAddItem,
    addItemLabel = '+ Nuevo',
    searchPlaceholder = 'Buscar...',
    filterControls,
    headerBadges,
    onClear,
    itemsPerPage = 15
}) => {
    const {
        busqueda,
        paginaActual,
        setPaginaActual,
        datosFiltrados,
        datosPaginados,
        totalPaginas,
        paginasVisibles,
        cambiarBusqueda,
        limpiarBusqueda,
    } = useDataTable(data, { searchFunction, filterFunction, itemsPerPage })

    const handleLimpiar = () => {
        limpiarBusqueda()
        if (onClear) onClear()
    }

    return (
        <CCard className="border-0 shadow-sm">
            <div className="border-bottom p-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                    <div>
                        <div className="fs-4 fw-bold">{title}</div>
                        {subtitle && <div className="text-medium-emphasis small">{subtitle}</div>}
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        <CBadge color="primary" className="px-3 py-2 rounded-pill">Registros: {datosFiltrados.length}</CBadge>
                        <CBadge color="info" className="px-3 py-2 rounded-pill">Página {paginaActual} / {totalPaginas}</CBadge>
                        {headerBadges}
                        {onAddItem && (
                            <CButton color="primary" className="rounded-pill px-3" onClick={onAddItem}>
                                {addItemLabel}
                            </CButton>
                        )}
                    </div>
                </div>
            </div>

            <CCardBody>
                <div className="p-3 p-md-4 mb-4 rounded-4 border">
                    <CRow className="g-3 align-items-end">
                        <CCol md={filterControls ? 4 : 10}>
                            <CFormLabel className="fw-semibold">Buscar</CFormLabel>
                            <CFormInput 
                                placeholder={searchPlaceholder} 
                                value={busqueda} 
                                onChange={(e) => cambiarBusqueda(e.target.value)} 
                            />
                        </CCol>
                        {filterControls && <CCol md={6}>{filterControls}</CCol>}
                        <CCol md={filterControls ? 2 : 2}>
                            <CButton color="secondary" variant="outline" className="w-100" onClick={handleLimpiar}>Limpiar</CButton>
                        </CCol>
                    </CRow>
                </div>

                <div className="table-responsive rounded-4 overflow-hidden" style={{ border: '1px solid #2f3a4f', backgroundColor: '#1b2230' }}>
                    <CTable hover align="middle" className="mb-0" style={{ color: '#f8f9fa' }}>
                        <CTableHead>
                            <CTableRow style={{ backgroundColor: '#f8f9fa', color: '#111827' }}>
                                {columns.map((col, idx) => (
                                    <CTableHeaderCell key={idx} className={`${col.className || ''} text-nowrap`}>{col.header}</CTableHeaderCell>
                                ))}
                            </CTableRow>
                        </CTableHead>
                        <CTableBody>
                            {datosPaginados.length > 0 ? (
                                datosPaginados.map((item, rowIdx) => (
                                    <CTableRow key={item.id || rowIdx}>
                                        {columns.map((col, colIdx) => (
                                            <CTableDataCell key={colIdx} className={col.className}>
                                                {col.renderFunc ? col.renderFunc(item) : (item[col.key] || '-')}
                                            </CTableDataCell>
                                        ))}
                                    </CTableRow>
                                ))
                            ) : (
                                <CTableRow>
                                    <CTableDataCell colSpan={columns.length} className="text-center py-5">
                                        <div className="fw-semibold fs-5 mb-1">No se encontraron registros</div>
                                        <div className="text-medium-emphasis mb-3">Ajusta los filtros para ver más resultados</div>
                                        <CButton color="primary" variant="outline" onClick={limpiarBusqueda}>Limpiar búsqueda</CButton>
                                    </CTableDataCell>
                                </CTableRow>
                            )}
                        </CTableBody>
                    </CTable>
                </div>

                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mt-4">
                    <div className="text-medium-emphasis small">
                        Mostrando <strong>{datosFiltrados.length === 0 ? 0 : (paginaActual - 1) * itemsPerPage + 1}</strong> - <strong>{Math.min(paginaActual * itemsPerPage, datosFiltrados.length)}</strong> de <strong>{datosFiltrados.length}</strong> registros
                    </div>
                    <Pagination 
                        paginaActual={paginaActual} 
                        totalPaginas={totalPaginas} 
                        paginasVisibles={paginasVisibles}
                        onPaginaAnterior={() => setPaginaActual(prev => Math.max(1, prev - 1))}
                        onPaginaSiguiente={() => setPaginaActual(prev => Math.min(totalPaginas, prev + 1))}
                        onIrAPagina={setPaginaActual}
                    />
                </div>
            </CCardBody>
        </CCard>
    )
}

export default DataTable
