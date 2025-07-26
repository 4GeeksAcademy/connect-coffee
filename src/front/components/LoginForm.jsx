import React, { useState, useEffect } from "react";
import { getToken } from "../services/api";
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { useLocation } from 'react-router-dom';
import AlertMessage from '../components/AlertMessage.jsx';
import { getUserStore, getStore } from "../services/api_store";

export const LoginForm = ({ setToken }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isStoreLogin = searchParams.get('type') === 'Store';
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [hasAuth, setHasAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { store, dispatch } = useGlobalReducer();

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

  const handleLogout = () => {
    setLoading(true);
    setHasAuth(false);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("message");
    dispatch({ type: "token", payload: "" });
    dispatch({ type: "message", payload: "" });
    dispatch({ type: "user", payload: "" });
    setLoading(false);
    navigate('/login')
  }

  const getUserStoreId = async (token) => {
    try {
      console.log('Obteniendo tienda del usuario...');
      const storeData = await getUserStore(token);
      
      console.log('Respuesta getUserStore:', storeData);
      
      if (storeData.ok && storeData.data && storeData.data.length > 0) {
        const storeId = storeData.data[0].id;
        console.log('Redirigiendo a /provider/' + storeId);
        navigate(`/provider/${storeId}`);
      } else {
        console.log('Usuario Store sin tienda, redirigiendo a crear tienda');
        showAlert('No tienes una tienda registrada. Serás redirigido para crear una.', 'warning');
        setTimeout(() => {
          navigate('/create-store');
        }, 2000);
      }
    } catch (error) {
      console.error('Error obteniendo tienda:', error);
      showAlert('Error al obtener información de la tienda', 'danger');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    hideAlert();

    // Se implementa validacion basica //
    if (!form.username || !form.password) {
      showAlert('Por favor, complete todos los campos', 'danger');
      setLoading(false);
      return;
    }

    try {
      const loginData = isStoreLogin
        ? { ...form, loginType: 'store' }
        : form;

      const res = await getToken(loginData);

      if (res.ok) {
        if (isStoreLogin && res.role !== 'Store') {
          showAlert('Esta cuenta no es de tipo Cafetería. Use el login de usuarios.', 'warning');
          setLoading(false);
          return;
        }

        if (!isStoreLogin && res.role === 'Store') {
          showAlert('Esta es una cuenta de Cafetería. Use el login para cafeterías.', 'warning');
          setLoading(false);
          return;
        }

        localStorage.setItem("token", res?.access_token);
        localStorage.setItem("user", res?.username);
        localStorage.setItem("role", res?.role);
        dispatch({ type: "token", payload: res.access_token });
        dispatch({ type: "user", payload: res.username });
        dispatch({ type: "role", payload: res.role });
        setHasAuth(true);
        showAlert('¡Inicio de sesión exitoso!', 'success');

        setTimeout(() => {
          if (res.role === 'Store') {
            getUserStoreId(res.access_token);
          } else if (res.role === 'SuperAdmin') {
            navigate('/');
          } else {
            navigate('/');
          }
        }, 1500);
      } else {
        setHasAuth(false);
        showAlert(res?.msg || 'Credenciales inválidas', 'danger');
      }
    } catch (error) {
      console.error('Error en login:', error);
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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <>
      {/* Componente de Alerta */}
      <AlertMessage
        message={alert.message}
        type={alert.type}
        show={alert.show}
        onClose={hideAlert}
        autoClose={5000}
      />

      {/* Login Form */}
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-5">
            <div className="card shadow">
              <div className="card-body p-5">
                {/* Header */}
                <div className="text-center mb-4">
                  <i className={`fas ${isStoreLogin ? 'fa-store' : 'fa-coffee'} display-4 mb-3`}
                    style={{ color: '#8b4513' }}></i>
                  <h2 className="mb-1">
                    {isStoreLogin ? 'Portal Cafeterías' : 'Iniciar Sesión'}
                  </h2>
                  <p className="text-muted">
                    {isStoreLogin
                      ? 'Accede a tu panel de administración'
                      : 'Bienvenido de vuelta'}
                  </p>
                </div>

                {/* Login Exclusivo */}
                {isStoreLogin && (
                  <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
                    <i className="fas fa-info-circle me-2"></i>
                    <div>
                      <strong>Login exclusivo para cafeterías.</strong><br />
                      <small>Si eres un usuario regular, <Link to="/login">haz clic aquí</Link></small>
                    </div>
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label">
                      {isStoreLogin ? 'Usuario de Cafetería' : 'Usuario'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      name="username"
                      value={form.username}
                      onChange={handleInputChange}
                      placeholder={isStoreLogin ? 'usuario_cafeteria' : 'Ingrese su usuario'}
                      disabled={loading}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      Contraseña
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="password"
                        name="password"
                        value={form.password}
                        onChange={handleInputChange}
                        placeholder="Ingrese su contraseña"
                        disabled={loading}
                        required
                      />
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                      >
                        <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                      </button>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{
                        backgroundColor: isStoreLogin ? '#8b4513' : '#d4a574',
                        border: 'none'
                      }}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </span>
                          Iniciando sesión...
                        </>
                      ) : (
                        'Iniciar Sesión'
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center mt-3">
                  {isStoreLogin ? (
                    <>
                      <p className="mb-2">
                        ¿No tienes cuenta de cafetería?
                        <Link to="/signup?type=Store" className="text-decoration-none ms-1">
                          Registra tu cafetería
                        </Link>
                      </p>
                      <small className="text-muted">
                        ¿Eres usuario? <Link to="/login">Ingresa aquí</Link>
                      </small>
                    </>
                  ) : (
                    <>
                      <p className="mb-2">
                        ¿No tienes cuenta?
                        <Link to="/signup" className="text-decoration-none ms-1">
                          Regístrate
                        </Link>
                      </p>
                      <small className="text-muted">
                        ¿Tienes una cafetería? <Link to="/login?type=Store">Ingresa aquí</Link>
                      </small>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginForm;