import React from "react";
import ServiceCard from "../../components/services/ServiceCard";
import { useCatalogoServicios } from "../../core/hooks/useCatalogos";

const CatalogoStreaming = ({ servicio }) => {
    const { data, isLoading, error } = useCatalogoServicios();
    if (isLoading) {
        console.log(data);
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error.message}</div>;
    }
    return (
        <>
            <section className="py-5 text-center">
                <div className="container">
                    <h1 className="display-5 fw-bold mb-4">
                        Todas tus plataformas favoritas
                    </h1>

                    <p className="text-muted mx-auto mb-5" style={{ maxWidth: "600px" }}>
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
                                <ServiceCard servicio={servicio} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div
                id="cartBar"
                className="position-fixed bottom-0 start-0 w-100 bg-white border-top shadow-lg d-none"
                style={{ zIndex: 1050 }}
            >
                <div className="container py-3">
                    <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2"></div>

                        <div
                            id="cartTotal"
                            className="fs-4 fw-bold text-primary"
                        >
                            $0
                        </div>
                    </div>

                    <div
                        id="cartItems"
                        className="d-flex flex-wrap gap-3 mb-3"
                    ></div>

                    <div className="d-flex align-items-center justify-content-between border-top pt-3">
                        <div className="text-muted small">
                            Puedes seguir agregando más plataformas
                        </div>

                        <button className="btn btn-primary">
                            Comprar ahora
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CatalogoStreaming;