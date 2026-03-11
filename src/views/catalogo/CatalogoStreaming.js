    import React, { useEffect, useMemo, useState } from "react";
    import ServiceCard from "../../components/services/ServiceCard";
    import { useCatalogoServicios } from "../../core/hooks/useCatalogos";
    import AppHeader from "../../components/AppHeader";
    import AddToCart from "../../components/services/AddToCart";

    const STORAGE_KEY = "streaming_cart";

    const CatalogoStreaming = () => {
        const { data, isLoading, error } = useCatalogoServicios();
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

        if (isLoading) {
            return <div>Loading...</div>;
        }

        if (error) {
            return <div>Error: {error.message}</div>;
        }

        return (
            <div style={{ paddingBottom: cart.length > 0 ? "320px" : "0px" }}>
                <AppHeader cartCount={totalItems} />

                <section className="py-5 text-center">
                    <div className="container">
                        <h1 className="display-5 fw-bold mb-4">
                            Todas tus plataformas favoritas
                        </h1>

                        <p
                            className="text-muted mx-auto mb-5"
                            style={{ maxWidth: "600px" }}
                        >
                            Compra accesos a Netflix, Disney+, Spotify y más plataformas al
                            mejor precio.
                        </p>
                    </div>
                </section>

                <section className="pb-5">
                    <div className="container">
                        <div className="row g-4">
                            {(data ?? []).map((servicio) => (
                                <div
                                    key={servicio.id}
                                    className="col-12 col-sm-6 col-md-4 col-lg-3"
                                >
                                    <ServiceCard servicio={servicio} addToCart={addToCart} formatPrice={formatPrice} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {cart.length > 0 && (
                    <AddToCart
                        cart={cart}
                        totalItems={totalItems}
                        totalPrice={totalPrice}
                        formatPrice={formatPrice}
                        decreaseQuantity={decreaseQuantity}
                        increaseQuantity={increaseQuantity}
                        removeFromCart={removeFromCart}
                    />
                )}
            </div>
        );
    };

    export default CatalogoStreaming;