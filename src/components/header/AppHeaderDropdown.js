import React from 'react'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilExitToApp,
  cilSettings,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from './../../assets/images/avatars/8.jpg'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated, hasRole } from '../../utils/auth'
import DataService from '../../core/services/DataService'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()

  const logout = () => {
    DataService.destroyAllData()
    navigate("/catalogo")
  }
  const hasRoleAdmin = hasRole('admin')
  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Perfil</CDropdownHeader>

        {/* <CDropdownItem href="#">
          <CIcon icon={cilEnvelopeOpen} className="me-2" />
          Mensajes
          <CBadge color="success" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>

        <CDropdownItem href="#">
          <CIcon icon={cilCommentSquare} className="me-2" />
          Comentarios
          <CBadge color="warning" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>

        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Ajustes</CDropdownHeader>

        <CDropdownItem href="#">
          <CIcon icon={cilUser} className="me-2" />
          Cuenta
        </CDropdownItem>

        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Ajustes
        </CDropdownItem>

        <CDropdownItem href="#">
          <CIcon icon={cilCreditCard} className="me-2" />
          Pagos
          <CBadge color="secondary" className="ms-2">
            42
          </CBadge>
        </CDropdownItem> */}
        <CDropdownDivider />
        {hasRoleAdmin && (
          <CDropdownItem onClick={() => navigate("/Dashboard")}>
            Dashboard
          </CDropdownItem>
        )}
        <CDropdownDivider />
        {!isAuthenticated() && (
          <CDropdownItem onClick={() => navigate("/login")}>
            Iniciar Sesión
          </CDropdownItem>
        )}
        {isAuthenticated() && (
          <CDropdownItem onClick={logout}>
            Cerrar Sesión
          </CDropdownItem>
        )}
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
