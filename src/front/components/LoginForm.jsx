import { useState } from "react";
import { Eye, EyeOff, Coffee, Mail, Lock, AlertCircle } from "lucide-react";

const LoginForm = ({ onLogin, onSwitchToRegister, isLoading = false }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState('');

    const validateForm = () => {
        const newErrors = {};

        // Email validation
        if (!formData.email) {
            newErrors.email = 'El email es requerido';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'El email no es válido';
        }

        // Password validation
        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida';
        } else if (formData.password.length < 6) {
            newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear a error mientras usuario escribe
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }

        // Clear a API error
        if (apiError) {
            setApiError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setApiError('');
            await onLogin(formData.email, formData.password);
        } catch (error) {
            setApiError(error.message || 'Error al iniciar sesión');
        }
    };

    const handleDemoLogin = () => {
        setFormData({
            email: 'demo@cafeteria.com',
            password: 'demo123'
        });
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center">
                            <Coffee className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-amber-900 mb-2">¡Bienvenido de vuelta!</h2>
                    <p className="text-amber-600">Inicia sesión para descubrir nuevas cafeterías</p>
                </div>

                {/* API Error */}
                {apiError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
                        <span className="text-red-700 text-sm">{apiError}</span>
                    </div>
                )}

                {/* Boton cliente invitado */}
                <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="w-full mb-4 bg-amber-100 text-amber-700 py-2 px-4 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors border border-amber-200"
                >
                    🚀 Usar cuenta de invitado
                </button>

                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-amber-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-white text-amber-500">o inicia con tu cuenta</span>
                    </div>
                </div>

                {/* Formulario Login */}
                <div className="space-y-6">
                    {/* Ingresar Email */}
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

                    {/* Ingresar Contraseña */}
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
                        {errors.password && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                                <AlertCircle className="h-4 w-4 mr-1" />
                                {errors.password}
                            </p>
                        )}
                    </div>

                    {/* Recuperar contraseña**
                    <div className="text-right">
                        <button
                            type="button"
                            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </div>
                     */}

                    {/* Boton inicio-sesion */}
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white py-3 px-4 rounded-lg font-semibold hover:from-amber-700 hover:to-amber-800 focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                Iniciando sesión...
                            </div>
                        ) : (
                            'Iniciar Sesión'
                        )}
                    </button>
                </div>

                {/* Registrarse */}
                <div className="mt-8 text-center">
                    <p className="text-amber-600">
                        ¿No tienes cuenta?{' '}
                        <button
                            onClick={onSwitchToRegister}
                            className="text-amber-700 font-semibold hover:text-amber-800 underline"
                        >
                            Registrate aqui
                        </button>
                    </p>
                </div>

                {/* Info adicional */}
                <div className="mt-6 pt-6 border-t border-amber-100">
                    <div className="text-center text-xs text-amber-500 space-y-1">
                        <p>🔒 Tus datos están protegidos</p>
                        <p>☕ Únete para descubrir tu cafeteria perfecta</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;