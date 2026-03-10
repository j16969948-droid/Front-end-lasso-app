import React from "react";

const ServiceCard = ({ servicio, addToCart }) => {
  return (
    <div
      className="card h-100 border-0 shadow-sm"
      style={{
        borderRadius: "1rem",
        overflow: "hidden",
        backgroundColor: "#111827",
        transition: "transform 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <div
        className="d-flex align-items-center justify-content-center"
        style={{
          height: "160px",
          backgroundColor: "#1f2937",
        }}
      >
        <img
          src={servicio.imagen}
          alt={servicio.nombre}
          style={{
            maxHeight: "120px",
            objectFit: "contain",
          }}
        />
      </div>

      <div className="card-body p-4 text-white">
        <h3 className="h5 fw-semibold mb-2">
          {servicio.nombre}
        </h3>

        <p className="text-secondary small mb-4">
          Acceso premium disponible
        </p>

        <div className="d-flex justify-content-between align-items-center">
          <div
            className="fw-bold fs-5"
            style={{ color: "#818cf8" }}
          >
            ${servicio.precio_publico}
          </div>

          <button
            onClick={() =>
              addToCart(
                servicio.id,
                servicio.nombre,
                servicio.precio_publico
              )
            }
            className="btn text-white"
            style={{
              backgroundColor: "#4f46e5",
              borderRadius: "0.5rem",
              padding: "0.5rem 1rem",
              fontSize: "0.875rem",
              border: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#6366f1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#4f46e5";
            }}
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;