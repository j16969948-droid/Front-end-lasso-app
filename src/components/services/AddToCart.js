import React from 'react'
import { useNavigate } from "react-router-dom";

const AddToCart = ({ cart, totalItems, totalPrice, formatPrice, decreaseQuantity, increaseQuantity, removeFromCart }) => {
    const navigate = useNavigate();
    return (
        <div
            className="position-fixed bottom-0 start-0 w-100 premium-cart-bar"
            style={{ zIndex: 1050 }}
        >
            <div className="container py-2 py-md-3">
                {/* Header */}
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
                    <div>
                        <div className="fw-bold fs-5 premium-text-color">
                            Resumen de tu compra
                        </div>

                        <div className="d-flex flex-wrap align-items-center gap-2 mt-1 text-secondary small">
                            <span>{totalItems} item(s)</span>
                            <span>•</span>
                            <span>
                                <span className="text-primary fw-bold">
                                    ${formatPrice(totalPrice)}
                                </span>
                            </span>
                        </div>
                    </div>

                    <div className="px-3 py-2 premium-total-box rounded-3">
                        <div className="small text-secondary mb-1">
                            Total a pagar
                        </div>
                        <div className="fw-bold fs-4 text-primary lh-1">
                            ${formatPrice(totalPrice)}
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div
                    className="d-flex gap-2 mb-2 premium-scroll"
                    style={{ overflowX: "auto", paddingBottom: "4px" }}
                >
                    {cart.map((item) => (
                        <div
                            key={item.id}
                            className="flex-shrink-0 premium-cart-item p-3"
                            style={{ minWidth: "290px", maxWidth: "320px" }}
                        >
                            <div className="d-flex align-items-center justify-content-between gap-3">
                                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                                    <div className="fw-semibold text-truncate premium-text-color">
                                        {item.nombre}
                                    </div>
                                    <div className="mt-1 text-secondary small">
                                        ${formatPrice(item.precio)} c/u
                                    </div>
                                </div>

                                <div className="d-flex align-items-center premium-qty-box gap-2 p-1">
                                    <button
                                        className="btn p-0 d-flex align-items-center justify-content-center premium-qty-btn-minus"
                                        onClick={() => decreaseQuantity(item.id)}
                                    >
                                        -
                                    </button>

                                    <span className="fw-semibold text-center premium-text-color" style={{ minWidth: "20px", fontSize: "0.95rem" }}>
                                        {item.cantidad}
                                    </span>

                                    <button
                                        className="btn p-0 d-flex align-items-center justify-content-center premium-qty-btn-plus"
                                        onClick={() => increaseQuantity(item.id)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div className="mt-3 pt-2 d-flex align-items-center justify-content-between premium-cart-item-footer">
                                <span className="small text-secondary">
                                    Subtotal
                                </span>
                                <span className="fw-bold premium-text-color fs-6">
                                    ${formatPrice(item.precio * item.cantidad)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 premium-cart-footer pt-3 mt-2">
                    <div>
                        <div className="fw-semibold premium-text-color">
                            Puedes seguir agregando más plataformas
                        </div>
                        <div className="small text-secondary">
                            Tu carrito se guarda automáticamente mientras navegas.
                        </div>
                    </div>

                    <button
                        className="btn-premium btn-premium-primary rounded-pill px-4 py-2"
                        onClick={() => navigate("/cart")}
                        style={{ minWidth: "190px" }}
                    >
                        Comprar ahora
                    </button>
                </div>
            </div>

            <style>{`
                .premium-scroll::-webkit-scrollbar {
                    height: 6px;
                }
                .premium-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .premium-scroll::-webkit-scrollbar-thumb {
                    background-color: rgba(var(--cui-body-color-rgb), 0.15);
                    border-radius: 10px;
                }
                
                .premium-cart-bar {
                    background: rgba(var(--cui-body-bg-rgb), 0.95);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    border-top: 1px solid rgba(var(--cui-body-color-rgb), 0.1);
                    box-shadow: 0 -10px 30px rgba(0,0,0,0.05);
                }
                .premium-text-color {
                    color: var(--cui-body-color);
                }
                .premium-total-box {
                    background: rgba(var(--cui-primary-rgb), 0.05);
                    border: 1px solid rgba(var(--cui-primary-rgb), 0.1);
                }
                .premium-cart-item {
                    background: rgba(var(--cui-body-color-rgb), 0.02);
                    border: 1px solid rgba(var(--cui-body-color-rgb), 0.08);
                    border-radius: 1.1rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.02);
                }
                .premium-cart-item-footer {
                    border-top: 1px solid rgba(var(--cui-body-color-rgb), 0.08);
                }
                .premium-cart-footer {
                    border-top: 1px solid rgba(var(--cui-body-color-rgb), 0.08);
                }
                
                .premium-qty-box {
                    background: var(--cui-body-bg);
                    border: 1px solid rgba(var(--cui-body-color-rgb), 0.1);
                    border-radius: 14px;
                }
                .premium-qty-btn-minus, .premium-qty-btn-plus {
                    width: 30px;
                    height: 30px;
                    border-radius: 10px;
                    font-size: 1.1rem;
                    font-weight: 600;
                    transition: all 0.2s;
                }
                .premium-qty-btn-minus {
                    background: rgba(var(--cui-body-color-rgb), 0.05);
                    color: var(--cui-body-color);
                }
                .premium-qty-btn-plus {
                    background: var(--cui-primary);
                    color: #fff;
                    box-shadow: 0 4px 10px rgba(var(--cui-primary-rgb), 0.25);
                }
                .premium-qty-btn-minus:hover {
                    background: rgba(var(--cui-body-color-rgb), 0.1);
                }
                
                html[data-coreui-theme='dark'] .premium-cart-bar {
                    background: rgba(var(--cui-dark-rgb), 0.95);
                    border-top-color: rgba(255,255,255,0.08);
                    box-shadow: 0 -10px 40px rgba(0,0,0,0.5);
                }
                html[data-coreui-theme='dark'] .premium-cart-item {
                    background: rgba(255,255,255,0.03);
                    border-color: rgba(255,255,255,0.08);
                }
                html[data-coreui-theme='dark'] .premium-cart-item-footer,
                html[data-coreui-theme='dark'] .premium-cart-footer {
                    border-top-color: rgba(255,255,255,0.08);
                }
                html[data-coreui-theme='dark'] .premium-qty-box {
                    border-color: rgba(255,255,255,0.1);
                }
                html[data-coreui-theme='dark'] .premium-qty-btn-minus {
                    background: rgba(255,255,255,0.1);
                    color: rgba(255,255,255,0.85);
                }
                html[data-coreui-theme='dark'] .premium-scroll::-webkit-scrollbar-thumb {
                    background-color: rgba(255,255,255,0.2);
                }
            `}</style>
        </div>
    )
}

export default AddToCart