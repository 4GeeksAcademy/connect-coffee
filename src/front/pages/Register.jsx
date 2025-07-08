import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Eye, EyeOff, Mail, Lock, User, MapPin } from 'lucide-react';

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'customer',
        address: ''
    });

    const goToLogin = () => {
        navigate('/login'); // Redireccionar LoginForm
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        if (formData.password !== formData.confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        console.log('Register submitted:', formData);
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
        maxWidth: '450px',
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
                        Crea tu cuenta nueva
                    </p>
                </div>

                {/* Campo de nombre usuario */}
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

                {/* Campo de email */}
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

                {/* Rol de usuario */}
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
                    <option value="provider">Proveedor (Dueño de cafetería)</option>
                </select>

                {/* Direccion (solo para duenos de cafeteria) */}
                {formData.userType === 'provider' && (
                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                        <MapPin size={18} style={iconStyle} />
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleInputChange}
                            style={inputStyle}
                            placeholder="Dirección de la cafetería"
                            required
                        />
                    </div>
                )}

                {/* Campo de contrasena */}
                <div style={{ position: 'relative', marginBottom: '15px' }}>
                    <Lock size={18} style={iconStyle} />
                    <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        style={inputStyle}
                        placeholder="Contraseña"
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

                {/* Campo confirmar contrasena */}
                <div style={{ position: 'relative', marginBottom: '15px' }}>
                    <Lock size={18} style={iconStyle} />
                    <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        style={inputStyle}
                        placeholder="Confirmar contraseña"
                        required
                    />
                    <button
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {/* Terminos y condiciones** */}
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px', color: '#666' }}>
                        <input
                            type="checkbox"
                            required
                            style={{ marginRight: '8px' }}
                        />
                        Acepto los términos y condiciones
                    </label>
                </div>

                {/* Boton submit */}
                <button onClick={handleSubmit} style={buttonStyle}>
                    Crear Cuenta
                </button>

                {/* Redireccion LoginForm */}
                <div style={{ textAlign: 'center' }}>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                        ¿Ya tienes cuenta?
                        <span
                            onClick={goToLogin}
                            style={{ color: '#d97706', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}
                        >
                            Inicia Sesión
                        </span>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default Register;