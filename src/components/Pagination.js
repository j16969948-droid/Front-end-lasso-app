import React from 'react'
import { CButton } from '@coreui/react'

const Pagination = ({
    paginaActual,
    totalPaginas,
    paginasVisibles,
    onPaginaAnterior,
    onPaginaSiguiente,
    onIrAPagina,
}) => {
    return (
        <div className="d-flex align-items-center gap-2 flex-wrap">
            <CButton
                color="secondary"
                variant="outline"
                onClick={onPaginaAnterior}
                disabled={paginaActual === 1}
            >
                Anterior
            </CButton>

            {paginasVisibles.map((pagina) => (
                <CButton
                    key={pagina}
                    color={pagina === paginaActual ? 'primary' : 'secondary'}
                    variant={pagina === paginaActual ? undefined : 'outline'}
                    onClick={() => onIrAPagina(pagina)}
                >
                    {pagina}
                </CButton>
            ))}

            <CButton
                color="primary"
                variant="outline"
                onClick={onPaginaSiguiente}
                disabled={paginaActual === totalPaginas}
            >
                Siguiente
            </CButton>
        </div>
    )
}

export default Pagination
