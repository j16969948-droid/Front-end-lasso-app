import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";

const STORAGE_KEY = "streaming_cart";

const CartScreen = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);

    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(STORAGE_KEY);
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error("Error leyendo carrito:", error);
            localStorage.removeItem(STORAGE_KEY);
            setCart([]);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }, [cart]);

    const increaseQuantity = (id) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id ? { ...item, cantidad: item.cantidad + 1 } : item
            )
        );
    };

    const decreaseQuantity = (id) => {
        setCart((prevCart) =>
            prevCart
                .map((item) =>
                    item.id === id ? { ...item, cantidad: item.cantidad - 1 } : item
                )
                .filter((item) => item.cantidad > 0)
        );
    };

    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    const totalItems = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.cantidad, 0);
    }, [cart]);

    const totalPrice = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    }, [cart]);

    const formatPrice = (value) => {
        return new Intl.NumberFormat("es-CO").format(value);
    };

    return (
        <>
            <AppHeader cartCount={totalItems} />

            <div
                style={{
                    minHeight: "100vh",
                }}
            >
                <section className="pt-4 pt-md-5 pb-5">
                    <div className="container">
                        <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4 mb-md-5">
                            <div>
                                <h1
                                    className="fw-bold mb-2"
                                    style={{
                                        color: "#f9fafb",
                                        fontSize: "clamp(2rem, 4vw, 3.2rem)",
                                        lineHeight: 1.1,
                                    }}
                                >
                                    Tu carrito
                                </h1>
                                <p
                                    className="mb-0"
                                    style={{
                                        color: "rgba(255,255,255,0.75)",
                                        fontSize: "1.05rem",
                                    }}
                                >
                                    Revisa tus plataformas antes de continuar con la compra.
                                </p>
                            </div>

                            <button
                                className="btn fw-semibold"
                                onClick={() => navigate("/catalogo")}
                                style={{
                                    background: "#eef2ff",
                                    color: "#4338ca",
                                    borderRadius: "14px",
                                    padding: "0.8rem 1.2rem",
                                    border: "1px solid #c7d2fe",
                                }}
                            >
                                Seguir comprando
                            </button>
                        </div>

                        {cart.length === 0 ? (
                            <div
                                className="text-center py-5"
                                style={{
                                    background: "#ffffff",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "28px",
                                    padding: "56px 24px",
                                    boxShadow: "0 12px 30px rgba(15,23,42,0.05)",
                                }}
                            >
                                <div
                                    className="mx-auto mb-4 d-flex align-items-center justify-content-center"
                                    style={{
                                        width: "84px",
                                        height: "84px",
                                        borderRadius: "24px",
                                        background: "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                                        color: "#4f46e5",
                                        fontSize: "2rem",
                                        fontWeight: 800,
                                    }}
                                >
                                    0
                                </div>

                                <h3 className="fw-bold mb-2" style={{ color: "#111827" }}>
                                    Tu carrito está vacío
                                </h3>

                                <p
                                    className="mx-auto mb-4"
                                    style={{
                                        maxWidth: "520px",
                                        color: "#6b7280",
                                    }}
                                >
                                    Todavía no has agregado plataformas. Explora el catálogo y
                                    selecciona los servicios que quieras comprar.
                                </p>

                                <button
                                    className="btn text-white fw-semibold"
                                    onClick={() => navigate("/catalogo")}
                                    style={{
                                        background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                                        borderRadius: "16px",
                                        padding: "0.95rem 1.5rem",
                                        border: "none",
                                        boxShadow: "0 12px 24px rgba(79,70,229,0.25)",
                                    }}
                                >
                                    Ir al catálogo
                                </button>
                            </div>
                        ) : (
                            <div className="row g-4 g-xl-5">
                                <div className="col-12 col-xl-8">
                                    <div
                                        style={{
                                            background: "#ffffff",
                                            border: "1px solid #e5e7eb",
                                            borderRadius: "28px",
                                            padding: "22px",
                                            boxShadow: "0 12px 30px rgba(15,23,42,0.05)",
                                        }}
                                    >
                                        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
                                            <div>
                                                <h4 className="fw-bold mb-1" style={{ color: "#111827" }}>
                                                    Productos seleccionados
                                                </h4>
                                                <div style={{ color: "#6b7280" }}>
                                                    Ajusta cantidades o elimina plataformas antes de
                                                    continuar.
                                                </div>
                                            </div>

                                            <button
                                                className="btn fw-semibold"
                                                onClick={clearCart}
                                                style={{
                                                    background: "#dc2626",
                                                    color: "#fff",
                                                    borderRadius: "14px",
                                                    padding: "0.7rem 1.1rem",
                                                    border: "none",
                                                    boxShadow: "0 6px 16px rgba(220,38,38,0.25)",
                                                }}
                                            >
                                                Vaciar carrito
                                            </button>
                                        </div>

                                        <div className="d-flex flex-column gap-3">
                                            {cart.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="d-flex flex-column flex-lg-row justify-content-between gap-4"
                                                    style={{
                                                        background: "#f8fafc",
                                                        border: "1px solid #e5e7eb",
                                                        borderRadius: "24px",
                                                        padding: "18px",
                                                        transition: "all 0.2s ease",
                                                    }}
                                                >
                                                    <div className="d-flex align-items-center gap-3 gap-md-4">
                                                        <div
                                                            className="d-flex align-items-center justify-content-center"
                                                            style={{
                                                                width: "88px",
                                                                height: "88px",
                                                                borderRadius: "22px",
                                                                background:
                                                                    "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                                                                overflow: "hidden",
                                                                flexShrink: 0,
                                                                border: "1px solid #e0e7ff",
                                                            }}
                                                        >
                                                            {item.imagen ? (
                                                                <img
                                                                    src={item.imagen}
                                                                    alt={item.nombre}
                                                                    style={{
                                                                        width: "100%",
                                                                        height: "100%",
                                                                        objectFit: "contain",
                                                                        padding: "10px",
                                                                    }}
                                                                />
                                                            ) : (
                                                                <span
                                                                    className="fw-bold"
                                                                    style={{
                                                                        color: "#4f46e5",
                                                                        fontSize: "1.4rem",
                                                                    }}
                                                                >
                                                                    {item.nombre?.charAt(0)}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div style={{ minWidth: 0 }}>
                                                            <h5
                                                                className="fw-bold mb-1"
                                                                style={{ color: "#111827" }}
                                                            >
                                                                {item.nombre}
                                                            </h5>

                                                            <div style={{ color: "#6b7280" }}>
                                                                ${formatPrice(item.precio)} c/u
                                                            </div>

                                                            <div
                                                                className="fw-semibold mt-2"
                                                                style={{ color: "#111827" }}
                                                            >
                                                                Subtotal: $
                                                                {formatPrice(item.precio * item.cantidad)}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex flex-column align-items-stretch align-items-lg-end justify-content-between gap-3">
                                                        <div
                                                            className="d-flex align-items-center justify-content-between"
                                                            style={{
                                                                background: "#ffffff",
                                                                border: "1px solid #e5e7eb",
                                                                borderRadius: "16px",
                                                                padding: "6px",
                                                                gap: "10px",
                                                                width: "fit-content",
                                                            }}
                                                        >
                                                            <button
                                                                className="btn p-0 d-flex align-items-center justify-content-center"
                                                                onClick={() => decreaseQuantity(item.id)}
                                                                style={{
                                                                    width: "40px",
                                                                    height: "40px",
                                                                    borderRadius: "12px",
                                                                    border: "none",
                                                                    background: "#f3f4f6",
                                                                    color: "#111827",
                                                                    fontSize: "1.2rem",
                                                                    fontWeight: 700,
                                                                }}
                                                            >
                                                                -
                                                            </button>

                                                            <span
                                                                className="fw-bold text-center"
                                                                style={{
                                                                    minWidth: "28px",
                                                                    color: "#111827",
                                                                    fontSize: "1rem",
                                                                }}
                                                            >
                                                                {item.cantidad}
                                                            </span>

                                                            <button
                                                                className="btn p-0 d-flex align-items-center justify-content-center"
                                                                onClick={() => increaseQuantity(item.id)}
                                                                style={{
                                                                    width: "40px",
                                                                    height: "40px",
                                                                    borderRadius: "12px",
                                                                    border: "none",
                                                                    background:
                                                                        "linear-gradient(135deg, #4f46e5, #6366f1)",
                                                                    color: "#fff",
                                                                    fontSize: "1.2rem",
                                                                    fontWeight: 700,
                                                                    boxShadow:
                                                                        "0 8px 16px rgba(79,70,229,0.22)",
                                                                }}
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        <button
                                                            className="btn fw-semibold"
                                                            onClick={() => removeFromCart(item.id)}
                                                            style={{
                                                                background: "#fee2e2",
                                                                color: "#dc2626",
                                                                border: "1px solid #fecaca",
                                                                borderRadius: "12px",
                                                                padding: "0.65rem 1rem",
                                                            }}
                                                        >
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="col-12 col-xl-4">
                                    <div
                                        style={{
                                            position: "sticky",
                                            top: "96px",
                                        }}
                                    >
                                        <div
                                            style={{
                                                background: "#ffffff",
                                                border: "1px solid #e5e7eb",
                                                borderRadius: "28px",
                                                padding: "22px",
                                                boxShadow: "0 12px 30px rgba(15,23,42,0.05)",
                                                overflow: "hidden",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg, #eef2ff, #f5f3ff)",
                                                    border: "1px solid #e0e7ff",
                                                    borderRadius: "22px",
                                                    padding: "18px",
                                                    marginBottom: "20px",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: "0.9rem",
                                                        color: "#6b7280",
                                                        marginBottom: "8px",
                                                    }}
                                                >
                                                    Resumen de pago
                                                </div>

                                                <div
                                                    className="fw-bold"
                                                    style={{
                                                        fontSize: "2rem",
                                                        color: "#4f46e5",
                                                    }}
                                                >
                                                    ${formatPrice(totalPrice)}
                                                </div>

                                                <div
                                                    style={{
                                                        color: "#6b7280",
                                                        fontSize: "0.9rem",
                                                        marginTop: "8px",
                                                    }}
                                                >
                                                    Total por {totalItems} producto
                                                    {totalItems !== 1 ? "s" : ""}
                                                </div>
                                            </div>

                                            <h4 className="fw-bold mb-4" style={{ color: "#111827" }}>
                                                Detalle del pedido
                                            </h4>

                                            <div className="d-flex justify-content-between mb-3">
                                                <span style={{ color: "#6b7280" }}>Productos</span>
                                                <span className="fw-semibold" style={{ color: "#111827" }}>
                                                    {totalItems}
                                                </span>
                                            </div>

                                            <div className="d-flex justify-content-between mb-3">
                                                <span style={{ color: "#6b7280" }}>Subtotal</span>
                                                <span className="fw-semibold" style={{ color: "#111827" }}>
                                                    ${formatPrice(totalPrice)}
                                                </span>
                                            </div>

                                            <div className="d-flex justify-content-between mb-3">
                                                <span style={{ color: "#6b7280" }}>Costo adicional</span>
                                                <span className="fw-semibold" style={{ color: "#111827" }}>
                                                    $0
                                                </span>
                                            </div>

                                            <div
                                                className="my-4"
                                                style={{
                                                    borderTop: "1px solid #e5e7eb",
                                                }}
                                            />

                                            <div className="d-flex justify-content-between align-items-center mb-4">
                                                <span
                                                    className="fw-bold"
                                                    style={{ fontSize: "1.1rem", color: "#111827" }}
                                                >
                                                    Total
                                                </span>
                                                <span
                                                    className="fw-bold"
                                                    style={{
                                                        fontSize: "1.7rem",
                                                        color: "#4f46e5",
                                                    }}
                                                >
                                                    ${formatPrice(totalPrice)}
                                                </span>
                                            </div>

                                            <button
                                                className="btn w-100 text-white fw-semibold mb-3"
                                                style={{
                                                    background:
                                                        "linear-gradient(135deg, #4f46e5, #6366f1)",
                                                    borderRadius: "16px",
                                                    padding: "1rem 1.2rem",
                                                    border: "none",
                                                    boxShadow: "0 12px 24px rgba(79,70,229,0.25)",
                                                    fontSize: "1rem",
                                                }}
                                                onClick={() => {
                                                    navigate("/checkout");
                                                }}
                                            >
                                                Continuar compra
                                            </button>

                                            <button
                                                className="btn fw-semibold w-100 mb-4"
                                                onClick={() => navigate("/catalogo")}
                                                style={{
                                                    background: "#eef2ff",
                                                    color: "#4338ca",
                                                    borderRadius: "16px",
                                                    padding: "0.95rem 1.2rem",
                                                    border: "1px solid #c7d2fe",
                                                }}
                                            >
                                                Seguir comprando
                                            </button>

                                            <div
                                                style={{
                                                    background: "#f9fafb",
                                                    border: "1px solid #e5e7eb",
                                                    borderRadius: "18px",
                                                    padding: "14px",
                                                }}
                                            >
                                                <div
                                                    className="fw-semibold mb-1"
                                                    style={{ color: "#111827", fontSize: "0.95rem" }}
                                                >
                                                    Compra segura
                                                </div>
                                                <div
                                                    style={{
                                                        color: "#6b7280",
                                                        fontSize: "0.88rem",
                                                        lineHeight: 1.5,
                                                    }}
                                                >
                                                    Tu carrito se guarda automáticamente mientras navegas.
                                                    Revisa bien las cantidades antes de continuar.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
};

export default CartScreen;