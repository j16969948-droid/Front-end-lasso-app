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
    itemsPerPage = 50
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
        <div className="fade-up">
            <CCard className="premium-card premium-card-static mb-4 border-0">
                <div className="p-md-4 border-bottom">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4">
                        <div>
                            <h2 className="section-title mb-1">{title}</h2>
                            {subtitle && <p className="section-subtitle mb-0">{subtitle}</p>}
                        </div>
                        <div className="d-flex flex-wrap gap-2">
                            {headerBadges}
                            {onAddItem && (
                                <CButton className="btn-lasso btn-lasso-primary" onClick={onAddItem}>
                                    {addItemLabel}
                                </CButton>
                            )}
                        </div>
                    </div>
                </div>

                <CCardBody className="p-md-4">
                    <div className="p-4 mb-5 rounded-4 bg-body-tertiary border-0 shadow-sm">
                        <CRow className="g-4 align-items-end">
                            <CCol md={9}>
                                <CFormLabel className="fw-bold small text-uppercase text-muted mb-2 ps-1">Buscador</CFormLabel>
                                <CFormInput
                                    className="lasso-input"
                                    placeholder={searchPlaceholder}
                                    value={busqueda}
                                    onChange={(e) => cambiarBusqueda(e.target.value)}
                                />
                            </CCol>
                            <CCol md={3}>
                                <CButton className="w-100 btn-lasso btn-lasso-soft-primary" onClick={handleLimpiar}>Limpiar</CButton>
                            </CCol>
                        </CRow>

                        {filterControls && (
                            <div className="mt-4 pt-4 border-top">
                                {filterControls}
                            </div>
                        )}
                    </div>

                    <div className="table-lasso-container shadow-sm">
                        <CTable align="middle" className="mb-0 table-lasso" hover responsive>
                            <CTableHead>
                                <CTableRow>
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
                                                <CTableDataCell key={colIdx} className={col.className || ''}>
                                                    {col.renderFunc ? col.renderFunc(item) : (item[col.key] || '-')}
                                                </CTableDataCell>
                                            ))}
                                        </CTableRow>
                                    ))
                                ) : (
                                    <CTableRow>
                                        <CTableDataCell colSpan={columns.length} className="text-center py-5">
                                            <div className="fw-bold fs-5 mb-2">No se encontraron resultados</div>
                                            <p className="text-muted mb-4 small">Intenta ajustar los criterios de búsqueda o filtros.</p>
                                            <CButton color="primary" variant="outline" className="rounded-pill px-4" onClick={limpiarBusqueda}>Restablecer buscador</CButton>
                                        </CTableDataCell>
                                    </CTableRow>
                                )}
                            </CTableBody>
                        </CTable>
                    </div>

                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-4 mt-5">
                        <div className="text-muted small fw-medium">
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
        </div>
    )
}

export default DataTable
