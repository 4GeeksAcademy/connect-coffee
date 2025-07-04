import React, { useState } from 'react';
import { Eye, EyeOff, Coffee, Mail, Lock, User, Store, AlertCircle } from 'lucide-react';

const RegisterForm = ({ onRegister, onSwitchToLogin, isLoading = false }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: 'customer' // invitado, proveedor
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);

    const validateForm = () => {
        const newErrors = {};

        // Validacion de nombre
        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        }

        // Validacion email
        if (!formData.email) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }

        // Validacion de contraseña
        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        // Confirma tu contraseña 
        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength += 1;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        return strength;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // contraseña
        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }

        // Limpia campo cuando empieza a escribir el usuario
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Clear API
        if (apiError) {
            setApiError('');
        }
    };

    const handleUserTypeChange = (type) => {
        setFormData(prev => ({
            ...prev,
            userType: type
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setApiError('');
            const registerData = {
                name: formData.name.trim(),
                email: formData.email,
                password: formData.password,
                user_type: formData.userType
            };

            await onRegister(registerData);
        } catch (error) {
            setApiError(error.message || 'Error al registrar usuario');
        }
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength <= 1) return 'bg-red-500';
        if (passwordStrength <= 2) return 'bg-yellow-500';
        if (passwordStrength <= 3) return 'bg-blue-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength <= 1) return 'Débil';
        if (passwordStrength <= 2) return 'Regular';
        if (passwordStrength <= 3) return 'Buena';
        return 'Fuerte';
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-h-screen overflow-y-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
                            <Coffee className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-amber-900 mb-2">¡Únete a CaféConnect!</h2>
                    <p className="text-amber-600">Crea tu cuenta y descubre el mundo del café</p>
                </div>

                {/* Tipo de usuario */}
                <div className="mb-6">
                    <label className="block text-amber-700 font-medium mb-3">
                        Tipo de cuenta
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => handleUserTypeChange('customer')}
                            className={`p-4 border-2 rounded-lg transition-all ${formData.userType === 'customer'
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-amber-200 hover:border-amber-300 text-amber-600'
                                }`}
                        >
                            <User className="h-6 w-6 mx-auto mb-2" />
                            <div className="text-sm font-medium">Cliente</div>
                            <div className="text-xs text-amber-500">Buscar cafeterías</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => handleUserTypeChange('provider')}
                            className={`p-4 border-2 rounded-lg transition-all ${formData.userType === 'provider'
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-amber-200 hover:border-amber-300 text-amber-600'
                                }`}
                        >
                            <Store className="h-6 w-6 mx-auto mb-2" />
                            <div className="text-sm font-medium">Proveedor</div>
                            <div className="text-xs text-amber-500">Registrar cafetería</div>
                        </button>
                    </div>
                </div>

                {/* API Error */}
                {apiError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                        <span className="text-red-700 text-sm">{apiError}</span>
                    </div>
                )}

                {/* Form registrar */}
                <div className="space-y-6">
                    {/* Campo Nombre completo */}
                    <div>
                        <label className="block text-amber-700 font-medium mb-2">
                            Nombre completo
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-400" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="Tu nombre completo"
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${errors.name
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-amber-200 hover:border-amber-300'
                                    }`}
                            />
                        </div>
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Campo email */}
                    <div>
                        <label className="block text-amber-700 font-medium mb-2">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-400" />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="tu@email.com"
                                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${errors.email
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-amber-200 hover:border-amber-300'
                                    }`}
                            />
                        </div>
                        {errors.email && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Campo contraseña */}
                    <div>
                        <label className="block text-amber-700 font-medium mb-2">
                            Contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-400" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${errors.password
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-amber-200 hover:border-amber-300'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-600"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        {/* Seguridad contraseña */}
                        {formData.password && (
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-amber-600 mb-1">
                                    <span>Seguridad de la contraseña</span>
                                    <span className={`font-medium ${passwordStrength <= 2 ? 'text-red-600' : 'text-green-600'}`}>
                                        {getPasswordStrengthText()}
                                    </span>
                                </div>
                                <div className="w-full bg-amber-100 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all ${getPasswordStrengthColor()}`}
                                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirmar contraseña */}
                    <div>
                        <label className="block text-amber-700 font-medium mb-2">
                            Confirmar contraseña
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-400" />
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${errors.confirmPassword
                                    ? 'border-red-300 bg-red-50'
                                    : 'border-amber-200 hover:border-amber-300'
                                    }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-600"
                            >
                                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                        {errors.confirmPassword && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.confirmPassword}
                            </p>
                        )}
                    </div>

                    {/* Boton Crear cuenta */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Registrando...
                            </div>
                        ) : (
                            'Crear Cuenta'
                        )}
                    </button>
                </div>

                {/* Redireccion login */}
                <div className="mt-8 text-center">
                    <p className="text-amber-600">
                        ¿Ya tienes cuenta?{' '}
                        <button
                            onClick={onSwitchToLogin}
                            className="text-amber-700 font-semibold hover:text-amber-800 underline"
                        >
                            Inicia sesión aquí
                        </button>
                    </p>
                </div>

                {/* Info */}
                <div className="mt-6 pt-6 border-t border-amber-100">
                    <div className="text-center text-xs text-amber-500 space-y-1">
                        <p>🔒 Tus datos están protegidos</p>
                        <p>☕ Únete para descubrir tu cafeteria perfecta</p>
                        <p>🎯 {formData.userType === 'provider' ? 'Promociona tu cafetería' : 'Descubre cafeterías increíbles'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;