export const formatearMonto = (valor) => {
    const numero = Number(valor)
    if (Number.isNaN(numero)) return valor || '-'

    return new Intl.NumberFormat('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(numero)
}

export const formatearFecha = (fecha) => {
    if (!fecha) return '-'

    const date = new Date(fecha)
    if (Number.isNaN(date.getTime())) return fecha

    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    }).format(date)
}

export const normalizarFecha = (fecha) => {
    if (!fecha) return ''

    const formatearAISO = (d) => {
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    if (typeof fecha === 'string') {
        const soloFecha = fecha.includes('T') ? fecha.split('T')[0] : fecha.slice(0, 10)
        if (/^\d{4}-\d{2}-\d{2}$/.test(soloFecha)) return soloFecha

        const parsed = new Date(fecha)
        if (!Number.isNaN(parsed.getTime())) {
            return formatearAISO(parsed)
        }
    }

    const parsed = new Date(fecha)
    if (Number.isNaN(parsed.getTime())) return ''

    return formatearAISO(parsed)
}

export const getBadgeColorEstado = (estado) => {
    const valor = String(estado || '').toLowerCase().trim()

    if (
        valor.includes('activo') ||
        valor.includes('disponible') ||
        valor.includes('habilitado') ||
        valor.includes('publicado') ||
        valor.includes('aprobado') ||
        valor.includes('pagado') ||
        valor.includes('completado') ||
        valor.includes('encontrado') ||
        valor === '1' ||
        valor.includes('vendido') ||
        valor.includes('asignado')
    ) {
        return 'success'
    }

    if (valor.includes('pendiente') || valor.includes('proceso') || valor.includes('revisión')) {
        return 'warning'
    }

    if (
        valor.includes('inactivo') ||
        valor.includes('agotado') ||
        valor.includes('oculto') ||
        valor.includes('bloqueado') ||
        valor.includes('rechazado') ||
        valor.includes('fallido') ||
        valor.includes('anulado') ||
        valor.includes('no encontrado') ||
        valor.includes('sin match') ||
        valor.includes('error') ||
        valor.includes('cancelado') ||
        valor === '0'
    ) {
        return 'danger'
    }

    return 'secondary'
}
