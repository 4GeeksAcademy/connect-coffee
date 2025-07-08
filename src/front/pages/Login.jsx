import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Eye, EyeOff, Mail, Lock, User } from 'lucide-react';

const Login = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        userType: 'customer'
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        console.log('Form submitted:', formData);
    };

    const goToRegister = () => {
        navigate('/register'); // redireccion a RegisterForm
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setFormData({ email: '', password: '', name: '', userType: 'customer' });
    };

    const containerStyle = {
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #fef7ed 0%, #fed7aa 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
    };

    const cardStyle = {
        backgroundColor: 'white',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        maxWidth: '400px',
        width: '100%',
        padding: '30px'
    };

    const inputStyle = {
        width: '100%',
        padding: '12px 40px 12px 40px',
        border: '2px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
        marginBottom: '15px'
    };

    const buttonStyle = {
        width: '100%',
        padding: '12px',
        backgroundColor: '#d97706',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginBottom: '15px'
    };

    const iconStyle = {
        position: 'absolute',
        left: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#999'
    };

    return (
        <div style={containerStyle}>
            <div style={cardStyle}>
                {/* Header */}
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <Coffee size={40} color="#d97706" />
                    <h1 style={{ margin: '10px 0', color: '#333' }}>CafeConnect</h1>
                    <p style={{ color: '#666', fontSize: '14px' }}>
                        {isLogin ? 'Inicia sesión' : 'Crea tu cuenta'}
                    </p>
                </div>

                {/* Name field */}
                {!isLogin && (
                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                        <User size={18} style={iconStyle} />
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            style={inputStyle}
                            placeholder="Nombre completo"
                            required
                        />
                    </div>
                )}

                {/* Email field */}
                <div style={{ position: 'relative', marginBottom: '15px' }}>
                    <Mail size={18} style={iconStyle} />
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        style={inputStyle}
                        placeholder="tu@email.com"
                        required
                    />
                </div>

                {/* Password field */}
                <div style={{ position: 'relative', marginBottom: '15px' }}>
                    <Lock size={18} style={iconStyle} />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        style={inputStyle}
                        placeholder="••••••••"
                        required
                    />
                    <button
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#999'
                        }}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* User type */}
                {!isLogin && (
                    <select
                        name="userType"
                        value={formData.userType}
                        onChange={handleInputChange}
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '2px solid #ddd',
                            borderRadius: '8px',
                            marginBottom: '15px',
                            boxSizing: 'border-box'
                        }}
                    >
                        <option value="customer">Cliente</option>
                        <option value="provider">Proveedor</option>
                    </select>
                )}

                {/* Boton de submit */}
                <button onClick={handleSubmit} style={buttonStyle}>
                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </button>

                <div style={{ textAlign: 'center' }}>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                        ¿No tienes cuenta? 
                        <span
                            onClick={goToRegister}
                            style={{ color: '#d97706', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
                        >
                            Regístrate
                        </span>
                    </span>
                </div>

                {/* Olvide mi contrasena */}
                {isLogin && (
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                        <span style={{ color: '#999', fontSize: '12px', cursor: 'pointer' }}>
                            ¿Olvidaste tu contraseña?
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;