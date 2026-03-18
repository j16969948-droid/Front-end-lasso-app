import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'
import './styles/premium-ui.css'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
const CatalogoStreaming = React.lazy(() => import('./views/catalogo/Servicios'))
const CartScreen = React.lazy(() => import('./views/catalogo/CartScreen'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const PagosEntrantes = React.lazy(() => import('./views/tables/PagosEntrantes'))
const PagosTotales = React.lazy(() => import('./views/tables/PagosTotales'))
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))
const InventarioGeneral = React.lazy(() => import('./views/inventario/inventarioGeneral'))
const ServiciosEnVenta = React.lazy(() => import('./views/serviciosVenta/ServiciosEnVenta'))
const Validar = React.lazy(() => import('./views/validar/Validar'))
const Informe = React.lazy(() => import('./views/ventas/Informe'))
const Codigos = React.lazy(() => import('./views/codigos/codigos'))
const Ordenes = React.lazy(() => import('./views/inventario/ordenes'))

// Layout
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]

    if (theme) setColorMode(theme)
    if (isColorModeSet()) return
    setColorMode(storedTheme)
  }, [isColorModeSet, setColorMode, storedTheme])

  return (
    <HashRouter>
      <Suspense
        fallback={
          <div className="pt-3 text-center">
            <CSpinner color="primary" variant="grow" />
          </div>
        }
      >
        <Routes>
          {/* públicas */}
          <Route path="/" element={<CatalogoStreaming />} />
          <Route path="/catalogo" element={<CatalogoStreaming />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />

          {/* protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<DefaultLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/pagosEntrantes" element={<PagosEntrantes />} />
              <Route path="/pagosTotales" element={<PagosTotales />} />
              <Route path="/inventarioGeneral" element={<InventarioGeneral />} />
              <Route path="/serviciosEnVenta" element={<ServiciosEnVenta />} />
              <Route path="/validar" element={<Validar />} />
              <Route path="/informe" element={<Informe />} />
              <Route path="/codigos" element={<Codigos />} />
              <Route path="/ordenes" element={<Ordenes />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App