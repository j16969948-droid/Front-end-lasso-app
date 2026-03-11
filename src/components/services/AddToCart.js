import React from 'react'
import { useNavigate } from "react-router-dom";

const AddToCart = ({ cart, totalItems, totalPrice, formatPrice, decreaseQuantity, increaseQuantity, removeFromCart }) => {
    const navigate = useNavigate();
    return (
        <div
            className="position-fixed bottom-0 start-0 w-100"
            style={{
                zIndex: 1050,
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(14px)",
                WebkitBackdropFilter: "blur(14px)",
                borderTop: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 -10px 30px rgba(0,0,0,0.08)",
            }}
        >
            <div className="container py-2 py-md-3">
                {/* Header */}
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                    <div>
                        <div
                            className="fw-bold"
                            style={{
                                fontSize: "1.1rem",
                                color: "#111827",
                            }}
                        >
                            Resumen de tu compra
                        </div>

                        <div
                            className="d-flex flex-wrap align-items-center gap-2 mt-1"
                            style={{ color: "#6b7280", fontSize: "0.95rem" }}
                        >
                            <span>{totalItems} item(s)</span>
                            <span>•</span>
                            <span>
                                Total:{" "}
                                <span style={{ color: "#4f46e5", fontWeight: 700 }}>
                                    ${formatPrice(totalPrice)}
                                </span>
                            </span>
                        </div>
                    </div>

                    <div
                        className="px-3 py-2"
                        style={{
                            background: "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                            border: "1px solid #e0e7ff",
                            borderRadius: "14px",
                            minWidth: "fit-content",
                        }}
                    >
                        <div
                            style={{
                                fontSize: "0.8rem",
                                color: "#6b7280",
                                marginBottom: "2px",
                            }}
                        >
                            Total a pagar
                        </div>
                        <div
                            className="fw-bold"
                            style={{
                                fontSize: "1.4rem",
                                color: "#4338ca",
                                lineHeight: 1,
                            }}
                        >
                            ${formatPrice(totalPrice)}
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div
                    className="d-flex gap-2 mb-2"
                    style={{
                        overflowX: "auto",
                        paddingBottom: "2px",
                        scrollbarWidth: "thin",
                    }}
                >
                    {cart.map((item) => (
                        <div
                            key={item.id}
                            className="flex-shrink-0"
                            style={{
                                minWidth: "290px",
                                maxWidth: "320px",
                                background: "#f8fafc",
                                border: "1px solid #e5e7eb",
                                borderRadius: "18px",
                                padding: "14px",
                                boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
                            }}
                        >
                            <div className="d-flex align-items-center justify-content-between gap-3">
                                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                    <div
                                        className="fw-semibold text-truncate"
                                        style={{
                                            color: "#111827",
                                            fontSize: "1rem",
                                        }}
                                    >
                                        {item.nombre}
                                    </div>

                                    <div
                                        className="mt-1"
                                        style={{
                                            color: "#6b7280",
                                            fontSize: "0.9rem",
                                        }}
                                    >
                                        ${formatPrice(item.precio)} c/u
                                    </div>
                                </div>

                                <div
                                    className="d-flex align-items-center"
                                    style={{
                                        background: "#ffffff",
                                        border: "1px solid #e5e7eb",
                                        borderRadius: "14px",
                                        padding: "4px",
                                        gap: "8px",
                                    }}
                                >
                                    <button
                                        className="btn p-0 d-flex align-items-center justify-content-center"
                                        onClick={() => decreaseQuantity(item.id)}
                                        style={{
                                            width: "34px",
                                            height: "34px",
                                            borderRadius: "10px",
                                            border: "none",
                                            background: "#f3f4f6",
                                            color: "#111827",
                                            fontSize: "1.1rem",
                                            fontWeight: 600,
                                        }}
                                    >
                                        -
                                    </button>

                                    <span
                                        className="fw-semibold text-center"
                                        style={{
                                            minWidth: "20px",
                                            color: "#111827",
                                            fontSize: "0.95rem",
                                        }}
                                    >
                                        {item.cantidad}
                                    </span>

                                    <button
                                        className="btn p-0 d-flex align-items-center justify-content-center"
                                        onClick={() => increaseQuantity(item.id)}
                                        style={{
                                            width: "34px",
                                            height: "34px",
                                            borderRadius: "10px",
                                            border: "none",
                                            background: "#4f46e5",
                                            color: "#fff",
                                            fontSize: "1.1rem",
                                            fontWeight: 600,
                                            boxShadow: "0 4px 10px rgba(79,70,229,0.25)",
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div
                                className="mt-3 d-flex align-items-center justify-content-between"
                                style={{
                                    paddingTop: "10px",
                                    borderTop: "1px solid #e5e7eb",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "0.85rem",
                                        color: "#6b7280",
                                    }}
                                >
                                    Subtotal
                                </span>

                                <span
                                    className="fw-bold"
                                    style={{
                                        color: "#111827",
                                        fontSize: "0.95rem",
                                    }}
                                >
                                    ${formatPrice(item.precio * item.cantidad)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div
                    className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
                    style={{
                        borderTop: "1px solid #e5e7eb",
                        paddingTop: "14px",
                    }}
                >
                    <div>
                        <div
                            style={{
                                color: "#111827",
                                fontWeight: 600,
                                fontSize: "0.95rem",
                            }}
                        >
                            Puedes seguir agregando más plataformas
                        </div>
                        <div
                            style={{
                                color: "#6b7280",
                                fontSize: "0.85rem",
                            }}
                        >
                            Tu carrito se guarda automáticamente mientras navegas.
                        </div>
                    </div>

                    <button
                        className="btn text-white fw-semibold"
                        onClick={() => navigate("/cart")}
                        style={{
                            background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                            borderRadius: "14px",
                            padding: "0.9rem 1.6rem",
                            border: "none",
                            minWidth: "190px",
                            boxShadow: "0 10px 20px rgba(79,70,229,0.25)",
                        }}
                    >
                        Comprar ahora
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AddToCart