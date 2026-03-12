import { useState, useMemo } from 'react'

export const useDataTable = (data = [], options = {}) => {
    const { 
        itemsPerPage = 15, 
        searchFunction = null, 
        filterFunction = null, 
        initialSearch = '' 
    } = options

    const [busqueda, setBusqueda] = useState(initialSearch)
    const [paginaActual, setPaginaActual] = useState(1)

    const datosFiltrados = useMemo(() => {
        let resultado = data

        // Primero aplicar el filtro personalizado (fecha, estado, etc)
        if (filterFunction) {
            resultado = resultado.filter(item => filterFunction(item))
        }

        // Luego aplicar la búsqueda de texto
        if (searchFunction && busqueda) {
            const termino = busqueda.toLowerCase()
            resultado = resultado.filter((item) => searchFunction(item, termino))
        }

        return resultado
    }, [data, busqueda, searchFunction, filterFunction])

    const totalPaginas = Math.max(1, Math.ceil(datosFiltrados.length / itemsPerPage))
    const paginaSegura = Math.min(paginaActual, totalPaginas)

    const datosPaginados = useMemo(() => {
        const inicio = (paginaSegura - 1) * itemsPerPage
        const fin = inicio + itemsPerPage
        return datosFiltrados.slice(inicio, fin)
    }, [datosFiltrados, paginaSegura, itemsPerPage])

    const paginasVisibles = useMemo(() => {
        const total = totalPaginas
        const actual = paginaSegura
        const rango = []

        let inicio = Math.max(1, actual - 2)
        let fin = Math.min(total, actual + 2)

        if (actual <= 3) fin = Math.min(total, 5)
        if (actual >= total - 2) inicio = Math.max(1, total - 4)

        for (let i = inicio; i <= fin; i += 1) {
            rango.push(i)
        }

        return rango
    }, [paginaSegura, totalPaginas])

    const cambiarBusqueda = (valor) => {
        setBusqueda(valor)
        setPaginaActual(1)
    }

    const limpiarBusqueda = () => {
        setBusqueda('')
        setPaginaActual(1)
    }

    return {
        busqueda,
        setBusqueda,
        paginaActual: paginaSegura,
        setPaginaActual,
        datosFiltrados,
        datosPaginados,
        totalPaginas,
        paginasVisibles,
        cambiarBusqueda,
        limpiarBusqueda,
    }
}
