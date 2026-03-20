import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import {
    CCard,
    CCardBody,
    CForm,
    CFormInput,
    CFormLabel,
    CButton,
    CRow,
    CCol,
    CInputGroup,
    CInputGroupText,
} from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilCloudUpload, cilCalendar, cilDollar, cilCheckCircle, cilQrCode } from "@coreui/icons";

const STORAGE_KEY = "streaming_cart";

const CheckOut = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState([]);
    const [monto, setMonto] = useState("");
    const [fecha, setFecha] = useState("");
    const [comprobante, setComprobante] = useState(null);

    useEffect(() => {
        try {
            const savedCart = localStorage.getItem(STORAGE_KEY);
            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
        } catch (error) {
            console.error("Error leyendo carrito:", error);
            setCart([]);
        }
    }, []);

    const totalItems = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.cantidad, 0);
    }, [cart]);

    const totalPrice = useMemo(() => {
        return cart.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    }, [cart]);

    const formatPrice = (value) => {
        return new Intl.NumberFormat("es-CO").format(value);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setComprobante(e.target.files[0]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here normally you would send the data to your backend
        console.log("Submit payment:", { monto, fecha, comprobante, cart });
        alert("Pago enviado exitosamente. En breve validaremos tu comprobante.");
        localStorage.removeItem(STORAGE_KEY);
        navigate("/catalogo");
    };

    if (cart.length === 0) {
        return (
            <>
                <AppHeader cartCount={0} />
                <div className="container py-5 text-center mt-5">
                    <h2 className="fw-bold mb-3">No hay productos en tu carrito</h2>
                    <p className="text-secondary mb-4">Debes agregar plataformas antes de proceder al pago.</p>
                    <CButton onClick={() => navigate("/catalogo")} color="primary" className="fw-bold rounded-pill px-4">
                        Volver al Catálogo
                    </CButton>
                </div>
            </>
        );
    }

    return (
        <div className="checkout-layout">
            <AppHeader cartCount={totalItems} />

            <div className="container py-4 py-md-5">
                <div className="text-center mb-5">
                    <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-2 mb-2 fw-bold border border-primary border-opacity-25" style={{ letterSpacing: '0.1em' }}>
                        CHECKOUT SEGURO
                    </span>
                    <h1 className="fw-bold display-5">Finaliza tu compra</h1>
                    <p className="text-secondary">Paga de forma rápida y segura usando Bre-B.</p>
                </div>

                <CRow className="g-4 g-lg-5 justify-content-center">
                    {/* Payment Section (Left) */}
                    <CCol xs={12} lg={7} xl={6}>
                        {/* Bank Details & QR */}
                        <CCard className="mb-4 border-0 shadow-sm premium-card">
                            <CCardBody className="p-4 p-md-5 text-center">
                                <div className="mb-4">
                                    <h3 className="fw-bold text-primary mb-1">Pago por Bre-B</h3>
                                    <p className="text-secondary small">Escanea el código para transferir el monto exacto.</p>
                                </div>
                                
                                <div className="qr-container mx-auto mb-4 d-flex align-items-center justify-content-center bg-white shadow-sm border overflow-hidden p-2" style={{ width: '220px', height: '220px', borderRadius: '24px' }}>
                                    <img 
                                        src="https://i.imgur.com/X1OlDgN.jpeg" 
                                        alt="QR Pago Bre-B" 
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
                                    />
                                </div>

                                <div className="account-details text-start p-4 rounded-4 bg-light bg-opacity-50 border">
                                    <CRow className="g-3">
                                        <CCol xs={6}>
                                            <div className="text-secondary small">Titular de la cuenta</div>
                                            <div className="fw-bold text-dark">Lasso App M.</div>
                                        </CCol>
                                        <CCol xs={6}>
                                            <div className="text-secondary small">Banco</div>
                                            <div className="fw-bold text-dark">Bancolombia</div>
                                        </CCol>
                                        <CCol xs={12}>
                                            <div className="text-secondary small">ID Bre-B / Cuenta</div>
                                            <div className="fw-bold text-dark fs-5 font-monospace">123-456789-00</div>
                                        </CCol>
                                    </CRow>
                                </div>
                            </CCardBody>
                        </CCard>

                        {/* Payment Form */}
                        <CCard className="border-0 shadow-sm premium-card">
                            <CCardBody className="p-4 p-md-5">
                                <h4 className="fw-bold mb-4">Confirma tu pago</h4>
                                <CForm onSubmit={handleSubmit}>
                                    <CRow className="g-4">
                                        <CCol md={6}>
                                            <CFormLabel className="fw-semibold text-secondary small">Monto Pagado</CFormLabel>
                                            <CInputGroup className="premium-input-group">
                                                <CInputGroupText className="bg-transparent border-end-0 text-primary">
                                                    <CIcon icon={cilDollar} />
                                                </CInputGroupText>
                                                <CFormInput
                                                    type="number"
                                                    placeholder="Ej: 25000"
                                                    value={monto}
                                                    onChange={(e) => setMonto(e.target.value)}
                                                    required
                                                    className="border-start-0 ps-0"
                                                />
                                            </CInputGroup>
                                        </CCol>
                                        <CCol md={6}>
                                            <CFormLabel className="fw-semibold text-secondary small">Fecha del Pago</CFormLabel>
                                            <CInputGroup className="premium-input-group">
                                                <CInputGroupText className="bg-transparent border-end-0 text-primary">
                                                    <CIcon icon={cilCalendar} />
                                                </CInputGroupText>
                                                <CFormInput
                                                    type="date"
                                                    value={fecha}
                                                    onChange={(e) => setFecha(e.target.value)}
                                                    required
                                                    className="border-start-0 ps-0 text-secondary"
                                                />
                                            </CInputGroup>
                                        </CCol>
                                        <CCol xs={12}>
                                            <CFormLabel className="fw-semibold text-secondary small">Subir Comprobante</CFormLabel>
                                            <div className="file-upload-wrapper">
                                                <CFormInput
                                                    type="file"
                                                    id="comprobanteInput"
                                                    accept="image/*,application/pdf"
                                                    onChange={handleFileChange}
                                                    required
                                                    className="d-none"
                                                />
                                                <label 
                                                    htmlFor="comprobanteInput" 
                                                    className="w-100 d-flex flex-column align-items-center justify-content-center p-4 border border-2 border-dashed rounded-4 text-center"
                                                    style={{ cursor: 'pointer', transition: 'all 0.3s', backgroundColor: comprobante ? 'rgba(var(--cui-success-rgb), 0.05)' : 'rgba(var(--cui-primary-rgb), 0.02)', borderColor: comprobante ? 'var(--cui-success)' : 'rgba(var(--cui-primary-rgb), 0.2)' }}
                                                >
                                                    {comprobante ? (
                                                        <>
                                                            <CIcon icon={cilCheckCircle} size="xl" className="text-success mb-2" />
                                                            <div className="fw-bold text-success">Archivo adjunto</div>
                                                            <div className="small text-secondary mt-1">{comprobante.name}</div>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CIcon icon={cilCloudUpload} size="xl" className="text-primary mb-2 opacity-75" />
                                                            <div className="fw-bold text-primary">Seleccionar archivo o foto</div>
                                                            <div className="small text-secondary mt-1">JPG, PNG o PDF (Max. 5MB)</div>
                                                        </>
                                                    )}
                                                </label>
                                            </div>
                                        </CCol>
                                        <CCol xs={12} className="mt-5">
                                            <CButton 
                                                type="submit" 
                                                className="btn-premium btn-premium-primary w-100 py-3 fw-bold fs-5 rounded-pill shadow-lg"
                                            >
                                                Finalizar Compra
                                            </CButton>
                                        </CCol>
                                    </CRow>
                                </CForm>
                            </CCardBody>
                        </CCard>
                    </CCol>

                    {/* Cart Summary (Right) */}
                    <CCol xs={12} lg={5} xl={4}>
                        <div style={{ position: 'sticky', top: '100px' }}>
                            <CCard className="border-0 shadow-sm premium-card">
                                <CCardBody className="p-4">
                                    <h5 className="fw-bold mb-4 pb-3 border-bottom text-dark">Resumen del Pedido</h5>
                                    
                                    <div className="cart-items-scroll mb-4" style={{ maxHeight: '350px', overflowY: 'auto' }}>
                                        {cart.map((item) => (
                                            <div key={item.id} className="d-flex align-items-center gap-3 mb-3 p-2 rounded-3" style={{ background: 'rgba(var(--cui-body-color-rgb), 0.02)' }}>
                                                {item.imagen ? (
                                                    <div className="rounded-3 bg-white p-1 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', flexShrink: 0 }}>
                                                        <img src={item.imagen} alt={item.nombre} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                    </div>
                                                ) : (
                                                    <div className="rounded-3 bg-primary bg-opacity-10 text-primary fw-bold fs-4 shadow-sm d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px', flexShrink: 0 }}>
                                                        {item.nombre.charAt(0)}
                                                    </div>
                                                )}
                                                
                                                <div className="flex-grow-1">
                                                    <div className="fw-bold text-dark" style={{ lineHeight: 1.2 }}>{item.nombre}</div>
                                                    <div className="small text-secondary mt-1">Cant: {item.cantidad}</div>
                                                </div>
                                                <div className="fw-bold text-primary">
                                                    ${formatPrice(item.precio * item.cantidad)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-3 text-secondary">
                                        <span>Subtotal ({totalItems} items)</span>
                                        <span>${formatPrice(totalPrice)}</span>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mb-4 text-secondary">
                                        <span>Descuento</span>
                                        <span>$0</span>
                                    </div>
                                    
                                    <div className="d-flex justify-content-between align-items-center pt-4 border-top">
                                        <span className="fw-bold fs-5 text-dark">Total a pagar</span>
                                        <span className="fw-bold fs-3 text-primary lh-1">
                                            ${formatPrice(totalPrice)}
                                        </span>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </div>
                    </CCol>
                </CRow>
            </div>

            <style>{`
                .premium-card {
                    border-radius: 1.5rem;
                    background: var(--cui-body-bg);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }
                .premium-input-group {
                    border-radius: 12px;
                    overflow: hidden;
                    border: 1px solid rgba(var(--cui-body-color-rgb), 0.15);
                    transition: all 0.2s ease;
                }
                .premium-input-group:focus-within {
                    border-color: var(--cui-primary);
                    box-shadow: 0 0 0 0.25rem rgba(var(--cui-primary-rgb), 0.15);
                }
                .premium-input-group input {
                    background: transparent;
                }
                .premium-input-group input:focus {
                    box-shadow: none;
                }
                .file-upload-wrapper label:hover {
                    background-color: rgba(var(--cui-primary-rgb), 0.05) !important;
                }
                .cart-items-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .cart-items-scroll::-webkit-scrollbar-track {
                    background: transparent;
                }
                .cart-items-scroll::-webkit-scrollbar-thumb {
                    background-color: rgba(var(--cui-body-color-rgb), 0.1);
                    border-radius: 10px;
                }
                
                html[data-coreui-theme='dark'] .premium-card {
                    background: var(--cui-dark);
                    border: 1px solid rgba(255,255,255,0.05) !important;
                }
                html[data-coreui-theme='dark'] .bg-light {
                    background-color: rgba(255,255,255,0.02) !important;
                }
                html[data-coreui-theme='dark'] .border {
                    border-color: rgba(255,255,255,0.08) !important;
                }
                html[data-coreui-theme='dark'] .border-dashed {
                    border-color: rgba(255,255,255,0.15) !important;
                    border-style: dashed !important;
                }
                html[data-coreui-theme='dark'] .qr-container {
                    background-color: #ffffff !important; 
                }
                html[data-coreui-theme='dark'] .text-dark {
                    color: rgba(255,255,255,0.85) !important;
                }
            `}</style>
        </div>
    );
};

export default CheckOut;