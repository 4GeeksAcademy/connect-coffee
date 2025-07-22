import React, { useState } from "react";
import { registerUser } from "../services/api";
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import AlertMessage from '../components/AlertMessage.jsx';

export const RegisterForm = ({ setToken }) => {
  const [searchParams] = useSearchParams();
  const isStoreRegister = searchParams.get('type') === 'Store';

  const [form, setForm] = useState({
    username: "",
    password: "",
    password_validate: "",
    email: "",
    // Campos adicionales por discutir ** //
    ...(isStoreRegister && {
      businessName: "",
      address: ""
    })
  });
  const [message, setMessage] = useState("");
  const [hasAuth, setHasAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [alert, setAlert] = useState({
    show: false,
    message: '',
    type: 'danger'
  });

  const showAlert = (message, type = 'danger') => {
    setAlert({
      show: true,
      message,
      type
    });
  };

  const hideAlert = () => {
    setAlert({
      show: false,
      message: '',
      type: 'danger'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    hideAlert();

    // Validaciones //
    if (!form.username || !form.email || !form.password || !form.password_validate) {
      showAlert('Por favor, complete todos los campos obligatorios', 'danger');
      setLoading(false);
      return;
    }

    if (form.password !== form.password_validate) {
      showAlert('Las contraseñas no coinciden', 'danger');
      setLoading(false);
      return;
    }

    if (form.password.length < 6) {
      showAlert('La contraseña debe tener al menos 6 caracteres', 'danger');
      setLoading(false);
      return;
    }

    if (isStoreRegister && (!form.businessName || !form.address)) {
      showAlert('Por favor, complete todos los datos de la cafetería', 'danger');
      setLoading(false);
      return;
    }

    try {
      // Preparar datos para enviar
      const registerData = {
        username: form.username,
        password: form.password,
        email: form.email,
        role: isStoreRegister ? 'Store' : 'User', // Asignar rol según el tipo ** //
        ...(isStoreRegister && {
          businessName: form.businessName,
          address: form.address,
          status: 'active' // status de activo o pendiente en base al pago realizado o no ** //
        })
      };

      const res = await registerUser(registerData);

      if (res.ok) {
        setForm({
          username: "",
          password: "",
          password_validate: "",
          email: "",
          ...(isStoreRegister && {
            businessName: "",
            address: ""
          })
        });

        if (isStoreRegister) {
          showAlert('¡Cafetería registrada exitosamente! Por favor, inicia sesión.', 'success');
        } else {
          showAlert('¡Registro exitoso! Por favor, inicia sesión.', 'success');
        }

        setTimeout(() => {
          navigate(isStoreRegister ? "/login?type=Store" : "/login");
        }, 2000);
      } else {
        showAlert(res.msg || 'Error en el registro', 'danger');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      showAlert('Error de conexión. Por favor, intente nuevamente.', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    if (alert.show) {
      hideAlert();
    }
  };

  return (
    <>
      <AlertMessage
        message={alert.message}
        type={alert.type}
        show={alert.show}
        onClose={hideAlert}
        autoClose={5000}
      />

      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className={isStoreRegister ? "col-md-8 col-lg-7" : "col-md-6 col-lg-5"}>
            <div className="card shadow">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <i className={`fas ${isStoreRegister ? 'fa-store' : 'fa-coffee'} display-4 mb-3`}
                    style={{ color: '#8b4513' }}></i>
                  <h1 className="h3 mb-1">
                    {isStoreRegister ? 'Registra tu Cafetería' : 'Coffee Connect'}
                  </h1>
                  <p className="text-muted">
                    {isStoreRegister
                      ? 'Únete a nuestra red de cafeterías'
                      : 'Crea tu cuenta y descubre las mejores cafeterías'}
                  </p>
                </div>

                {isStoreRegister && (
                  <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
                    <i className="fas fa-info-circle me-2"></i>
                    <div>
                      <strong>Registro para cafeterías.</strong><br />
                      <small>Si eres un usuario regular registrate <Link to="/signup">aquí</Link></small>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  {/* Campos básicos */}
                  <div className="row">
                    <div className={isStoreRegister ? "col-md-6" : "col-12"}>
                      <div className="mb-3">
                        <label htmlFor="username" className="form-label">
                          <i className="fa-solid fa-user me-1"></i>
                          Usuario
                        </label>
                        <input
                          className="form-control"
                          placeholder={isStoreRegister ? "nombre_cafeteria" : "Usuario"}
                          id="username"
                          name="username"
                          value={form.username}
                          onChange={handleInputChange}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>

                    <div className={isStoreRegister ? "col-md-6" : "col-12"}>
                      <div className="mb-3">
                        <label htmlFor="email" className="form-label">
                          <i className="fas fa-envelope me-1"></i>
                          Email
                        </label>
                        <input
                          className="form-control"
                          type="email"
                          placeholder={isStoreRegister ? "cafeteria@email.com" : "Email"}
                          id="email"
                          name="email"
                          value={form.email}
                          onChange={handleInputChange}
                          disabled={loading}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Campos adicionales para cafeterías */}
                  {isStoreRegister && (
                    <>
                      <div className="mb-3">
                        <label htmlFor="businessName" className="form-label">
                          <i className="fas fa-building me-1"></i>
                          Nombre del Negocio
                        </label>
                        <input
                          className="form-control"
                          placeholder="Nombre de tu Cafeteria"
                          id="businessName"
                          name="businessName"
                          value={form.businessName}
                          onChange={handleInputChange}
                          disabled={loading}
                          required
                        />
                      </div>

                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <label htmlFor="address" className="form-label">
                              <i className="fas fa-map-marker-alt me-1"></i>
                              Dirección
                            </label>
                            <input
                              className="form-control"
                              placeholder="Av. Aprobar proyecto, Valparaíso"
                              id="address"
                              name="address"
                              value={form.address}
                              onChange={handleInputChange}
                              disabled={loading}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Campos de contraseña */}
                  <div className="row">
                    <div className={isStoreRegister ? "col-md-6" : "col-12"}>
                      <div className="mb-3">
                        <label htmlFor="password" className="form-label">
                          <i className="fas fa-lock me-1"></i>
                          Contraseña
                        </label>
                        <div className="input-group">
                          <input
                            className="form-control"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mínimo 6 caracteres"
                            id="password"
                            name="password"
                            value={form.password}
                            onChange={handleInputChange}
                            disabled={loading}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="btn btn-outline-secondary"
                            disabled={loading}
                          >
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className={isStoreRegister ? "col-md-6" : "col-12"}>
                      <div className="mb-3">
                        <label htmlFor="password_validate" className="form-label">
                          <i className="fas fa-lock me-1"></i>
                          Confirmar Contraseña
                        </label>
                        <div className="input-group">
                          <input
                            className="form-control"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Repite la contraseña"
                            id="password_validate"
                            name="password_validate"
                            value={form.password_validate}
                            onChange={handleInputChange}
                            disabled={loading}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="btn btn-outline-secondary"
                            disabled={loading}
                          >
                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Términos y condiciones para cafeterías */}
                  {isStoreRegister && (
                    <div className="form-check mb-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="terms"
                        required
                        disabled={loading}
                      />
                      <label className="form-check-label small" htmlFor="terms">
                        Acepto los <Link to="/terms">términos y condiciones</Link> del servicio para cafeterías
                      </label>
                    </div>
                  )}

                  <button
                    className="btn btn-primary w-100 py-2 my-4"
                    type="submit"
                    style={{
                      backgroundColor: isStoreRegister ? '#8b4513' : '#d4a574',
                      border: 'none'
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </span>
                        Registrando...
                      </>
                    ) : (
                      <>
                        {isStoreRegister ? 'Registrar Cafetería' : 'Crear Cuenta'}
                      </>
                    )}
                  </button>

                  <div className="text-center">
                    {isStoreRegister ? (
                      <>
                        <p className="mb-2">
                          ¿Ya tienes cuenta de cafetería?
                          <Link to="/login?type=Store" className="text-decoration-none ms-1">
                            Inicia Sesión
                          </Link>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="mb-2">
                          ¿Ya tienes cuenta?
                          <Link to="/login" className="text-decoration-none ms-1">
                            Inicia Sesión
                          </Link>
                        </p>
                        <small className="text-muted">
                          ¿Tienes una cafetería? <Link to="/signup?type=Store">Regístrala aquí</Link>
                        </small>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterForm;