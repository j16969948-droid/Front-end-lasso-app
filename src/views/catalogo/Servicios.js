import React, { useEffect, useMemo, useState } from "react";
import ServiceCard from "../../components/services/ServiceCard";
import { useServicios } from "../../core/hooks/useServicios";
import AppHeader from "../../components/AppHeader";
import AddToCart from "../../components/services/AddToCart";
import { CFormInput, CInputGroup, CInputGroupText } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilSearch } from "@coreui/icons";

const STORAGE_KEY = "streaming_cart";

const CatalogoStreaming = () => {
    const { data, isLoading, error } = useServicios();
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const savedCart = localStorage.getItem(STORAGE_KEY);
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }, [cart]);

    const addToCart = (id, nombre, precio, imagen = "") => {
        setCart((prevCart) => {
            const existingProduct = prevCart.find((item) => item.id === id);

            if (existingProduct) {
                return prevCart.map((item) =>
                    item.id === id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }

            return [
                ...prevCart,
                {
                    id,
                    nombre,
                    precio: Number(precio),
                    imagen,
                    cantidad: 1,
                },
            ];
        });
    };

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

    const totalItems = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.cantidad, 0);
    }, [cart]);

    const totalPrice = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    }, [cart]);

    const formatPrice = (value) => {
        return new Intl.NumberFormat("es-CO").format(value);
    };

    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    const [busqueda, setBusqueda] = useState("");

    const filteredData = useMemo(() => {
        if (!data) return [];
        return data.filter(servicio =>
            servicio.nombre.toLowerCase().includes(busqueda.toLowerCase())
        );
    }, [data, busqueda]);

    if (isLoading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger mx-5 my-4" role="alert">
                Error al cargar el catálogo: {error.message}
            </div>
        );
    }

    return (
        <div className="position-relative" style={{ paddingBottom: cart.length > 0 ? "100px" : "20px" }}>
            <AppHeader cartCount={totalItems} />

            {/* Hero Section Premium */}
            <section className="premium-hero position-relative overflow-hidden mb-5 p-4">
                <div className="container position-relative z-index-1 py-1 py-md-2 text-center">
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 mb-3 fw-bold border border-primary border-opacity-25" style={{ letterSpacing: '0.1em' }}>
                        CATÁLOGO
                    </span>
                    <h1 className="display-4 fw-bold mb-3">
                        Tus plataformas favoritas <span className="text-primary">en un solo lugar</span>
                    </h1>
                    <p className="text-secondary mx-auto mb-4 fs-5" style={{ maxWidth: "600px" }}>
                        Potencia tu entretenimiento con suscripciones premium de forma rápida, segura y al mejor precio.
                    </p>

                    <div className="mx-auto mt-4" style={{ maxWidth: "500px" }}>
                        <CInputGroup className="premium-search-group shadow-sm">
                            <CInputGroupText className="bg-white border-end-0 text-secondary ps-4">
                                <CIcon icon={cilSearch} />
                            </CInputGroupText>
                            <CFormInput
                                placeholder="Buscar Netflix, Spotify, Prime Video..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="border-start-0 py-3 ps-2 premium-search-input"
                            />
                        </CInputGroup>
                    </div>
                </div>
                {/* Decorative Background Elements */}
                <div className="position-absolute premium-blob top-0 start-0 translate-middle"></div>
                <div className="position-absolute premium-blob bottom-0 end-0 translate-middle"></div>
            </section>

            <section className="pb-5">
                <div className="container">
                    {filteredData.length > 0 ? (
                        <div className="row g-4 align-items-stretch">
                            {filteredData.map((servicio) => (
                                <div
                                    key={servicio.id}
                                    className="col-12 col-sm-6 col-lg-4 col-xl-3"
                                >
                                    <ServiceCard servicio={servicio} addToCart={addToCart} formatPrice={formatPrice} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <CIcon icon={cilSearch} size="3xl" className="text-secondary mb-3 opacity-50" />
                            <h4 className="text-secondary">No encontramos servicios que coincidan con "{busqueda}"</h4>
                            <p className="text-muted">Intenta con otros términos de búsqueda.</p>
                        </div>
                    )}
                </div>
            </section>

            {cart.length > 0 && (
                <div className="position-fixed bottom-0 start-0 w-100 z-index-3 shadow-lg" style={{ zIndex: 1040 }}>
                    <AddToCart
                        cart={cart}
                        totalItems={totalItems}
                        totalPrice={totalPrice}
                        formatPrice={formatPrice}
                        decreaseQuantity={decreaseQuantity}
                        increaseQuantity={increaseQuantity}
                        removeFromCart={removeFromCart}
                    />
                </div>
            )}

            <style>{`
                    .premium-hero {
                        background: linear-gradient(135deg, rgba(var(--cui-body-bg-rgb), 1), rgba(var(--cui-secondary-bg-rgb), 0.5));
                        border-bottom: 1px solid rgba(var(--cui-body-color-rgb), 0.05);
                    }
                    .premium-search-group {
                        border-radius: 50rem !important;
                        overflow: hidden;
                        border: 1px solid rgba(var(--cui-primary-rgb), 0.2);
                        transition: all 0.3s ease;
                    }
                    .premium-search-group:focus-within {
                        box-shadow: 0 0 0 0.25rem rgba(var(--cui-primary-rgb), 0.2) !important;
                        border-color: var(--cui-primary);
                    }
                    .premium-search-input {
                        border: none;
                        font-size: 1rem;
                    }
                    .premium-search-input:focus {
                        box-shadow: none;
                    }
                    .premium-blob {
                        width: 400px;
                        height: 400px;
                        background: radial-gradient(circle, rgba(var(--cui-primary-rgb), 0.05) 0%, transparent 70%);
                        border-radius: 50%;
                        z-index: 0;
                        pointer-events: none;
                    }
                    
                    html[data-coreui-theme='dark'] .premium-hero {
                        background: linear-gradient(135deg, #181d24, #1b2027);
                    }
                    html[data-coreui-theme='dark'] .premium-search-group .bg-white {
                        background-color: #212631 !important;
                        color: rgba(255,255,255,0.7) !important;
                    }
                    html[data-coreui-theme='dark'] .premium-search-input {
                        background-color: #212631;
                        color: rgba(255,255,255,0.9);
                    }
                `}</style>
        </div>
    );
};

export default CatalogoStreaming;