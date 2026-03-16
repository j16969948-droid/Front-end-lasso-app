/**
 * AppSidebar Component
 *
 * Collapsible navigation sidebar with branding, menu items, and toggle controls.
 *
 * Features:
 * - Redux-controlled visibility state
 * - Unfoldable/narrow mode for more screen space
 * - Brand logo with full and narrow variants
 * - Close button for mobile devices
 * - Footer with toggle button
 * - Dark color scheme
 * - Fixed positioning
 *
 * @component
 * @example
 * return (
 *   <AppSidebar />
 * )
 */

import React, { Suspense } from 'react'
import { useSelector, useDispatch } from 'react-redux'

import {
  CCloseButton,
  CSidebar,
  CSidebarBrand,
  CSidebarFooter,
  CSidebarHeader,
  CSidebarToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'

import { AppSidebarNav } from './AppSidebarNav'
import { useMenusUser } from '../core/hooks/useMenus'

import { getUserRole } from '../core/hooks/useRole'

/**
 * AppSidebar functional component
 *
 * Manages sidebar state with Redux:
 * - sidebarShow: Controls sidebar visibility
 * - sidebarUnfoldable: Controls narrow/wide mode
 *
 * Renders navigation from _nav.js configuration file.
 * Memoized to prevent unnecessary re-renders.
 *
 * @returns {React.ReactElement} Sidebar with navigation
 */
const AppSidebar = () => {
  const dispatch = useDispatch()
  const unfoldable = useSelector((state) => state.sidebarUnfoldable)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { menus } = useMenusUser()
  const role = getUserRole()

  return (
    <Suspense fallback={<div>Cargando menú...</div>}>
      <CSidebar
        className="border-end premium-sidebar"
        colorScheme="dark"
        position="fixed"
        unfoldable={unfoldable}
        visible={sidebarShow}
        onVisibleChange={(visible) => {
          dispatch({ type: 'set', sidebarShow: visible })
        }}
      >
        <CSidebarHeader className="border-bottom flex-column align-items-center py-4">
          <CSidebarBrand to="/" className="text-decoration-none mb-2">
            <div className="d-flex align-items-center gap-2">
              <div className="bg-primary rounded-pill p-1 d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                <span className="fw-bold text-white" style={{ fontSize: '1.2rem' }}>L</span>
              </div>
              {!unfoldable && (
                <span className="fw-bold fs-4 tracking-tight" style={{ letterSpacing: '-0.5px' }}>LassoApp</span>
              )}
            </div>
          </CSidebarBrand>

          {!unfoldable && role && (
            <div className="px-2 py-1 rounded-pill bg-body-tertiary border border-light border-opacity-10 d-flex align-items-center gap-2" style={{ fontSize: '0.7rem' }}>
              <div className="rounded-circle bg-success" style={{ width: '6px', height: '6px' }}></div>
              <span className="text-secondary fw-bold text-uppercase opacity-75">Panel {role}</span>
            </div>
          )}

          <CCloseButton
            className="d-lg-none position-absolute top-0 end-0 m-2"
            dark
            onClick={() => dispatch({ type: 'set', sidebarShow: false })}
          />
        </CSidebarHeader>
        <AppSidebarNav items={menus} />
        <CSidebarFooter className="border-top d-none d-lg-flex">
          <CSidebarToggler
            onClick={() => dispatch({ type: 'set', sidebarUnfoldable: !unfoldable })}
          />
        </CSidebarFooter>
      </CSidebar>
    </Suspense>
  )
}

export default React.memo(AppSidebar)
