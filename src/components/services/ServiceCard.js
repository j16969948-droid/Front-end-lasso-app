import React from "react";
import { CCard, CCardBody, CButton, CBadge } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPlus } from '@coreui/icons';

const ServiceCard = ({ servicio, addToCart, formatPrice }) => {
  return (
    <CCard
      className="h-100 border-0 shadow-sm premium-service-card"
    >
      <div
        className="d-flex align-items-center justify-content-center position-relative premium-service-img-container"
      >
        <img
          src={servicio.imagen}
          alt={servicio.nombre}
          className="premium-service-img"
        />
      </div>

      <CCardBody className="p-4 d-flex flex-column">
        <h3 className="h5 fw-bold mb-1">{servicio.nombre}</h3>
        <p className="text-secondary small mb-4 flex-grow-1">
          Acceso inmediato disponible
        </p>

        <div className="d-flex justify-content-between align-items-center">
          <div className="fw-bold fs-5 text-primary">
            ${formatPrice(servicio.precio_usuario)}
          </div>

          <CButton
            onClick={() =>
              addToCart(
                servicio.id,
                servicio.nombre,
                servicio.precio_usuario,
                servicio.imagen
              )
            }
            className="btn-premium btn-premium-primary rounded-pill d-flex align-items-center gap-1"
          >
            <CIcon icon={cilPlus} size="sm" />
            Agregar
          </CButton>
        </div>
      </CCardBody>

      <style>{`
        .premium-service-card {
            border-radius: 1rem;
            overflow: hidden;
            background: var(--cui-body-bg);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            border: 1px solid rgba(var(--cui-body-color-rgb), 0.05) !important;
        }
        .premium-service-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
            border-color: rgba(var(--cui-primary-rgb), 0.2) !important;
        }
        .premium-service-img-container {
            height: 160px;
            background: linear-gradient(135deg, rgba(var(--cui-secondary-rgb), 0.1), rgba(var(--cui-secondary-rgb), 0.02));
            border-bottom: 1px solid rgba(var(--cui-body-color-rgb), 0.05);
            padding: 1.5rem;
        }
        .premium-service-img {
            max-height: 100px;
            object-fit: contain;
            filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
            transition: transform 0.3s ease;
        }
        .premium-service-card:hover .premium-service-img {
            transform: scale(1.08);
        }
        
        html[data-coreui-theme='dark'] .premium-service-card {
            background: var(--cui-dark);
            border-color: rgba(255, 255, 255, 0.05) !important;
        }
        html[data-coreui-theme='dark'] .premium-service-card:hover {
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4) !important;
            border-color: rgba(255, 255, 255, 0.1) !important;
        }
        html[data-coreui-theme='dark'] .premium-service-img-container {
            background: linear-gradient(135deg, rgba(255,255,255,0.02), transparent);
            border-bottom-color: rgba(255,255,255,0.05);
        }
      `}</style>
    </CCard>
  );
};

export default ServiceCard;