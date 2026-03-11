import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'

import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'
import ProtectedRoute from './components/ProtectedRoute'

// Pages
const CatalogoStreaming = React.lazy(() => import('./views/catalogo/CatalogoStreaming'))
const CartScreen = React.lazy(() => import('./views/catalogo/CartScreen'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))
const PagosEntrantes = React.lazy(() => import('./views/tables/PagosEntrantes'))

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
  }, [])

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

          {/* Ruta principal */}
          <Route path="/" element={<CatalogoStreaming />} />

          {/* Public */}
          <Route path="/catalogo" element={<CatalogoStreaming />} />
          <Route path="/cart" element={<CartScreen />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/pagosEntrantes" element={<PagosEntrantes />} />

          {/* Dashboard (usa layout) */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute>
                <DefaultLayout />
              </ProtectedRoute>
            }
          />

          {/* Errors */}
          <Route path="/404" element={<Page404 />} />
          <Route path="/500" element={<Page500 />} />

        </Routes>
      </Suspense>
    </HashRouter>
  )
}

export default App