import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import api from './api';
import { ToastContainer, toast } from 'react-toastify';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import ResetPasswordForm from './components/ResetPasswordForm';
import VerificationModal from './components/VerificationModal';
import EventsPage from './components/EventsPage';
import ProfilePage from './components/ProfilePage';
import CreateEventPage from './components/CreateEventPage';

function App() {
    const [mode, setMode] = useState('login');
    const [showVerification, setShowVerification] = useState(false);
    const [email, setEmail] = useState('');
    const [formData, setFormData] = useState(null);
    const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchUsername = async () => {
            if (isAuthenticated) {
                try {
                    const token = localStorage.getItem('token');
                    console.log('Token for /api/user/ request:', token);
                    if (!token) {
                        throw new Error('No token found in localStorage');
                    }
                    const _RESPONSE = await api.get('/api/user/', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log('Response from /api/user/:', _RESPONSE.data);
                    if (_RESPONSE.data && _RESPONSE.data.username) {
                        setUsername(_RESPONSE.data.username);
                    } else {
                        throw new Error('Username not found in response');
                    }
                } catch (error) {
                    console.error('Error fetching username:', error.message, error.response?.data, error.response?.status);
                    setUsername('User');
                    if (error.response?.status === 401 || error.response?.status === 500) {
                        setIsAuthenticated(false);
                        localStorage.removeItem('token');
                        navigate('/events');
                    }
                }
            }
        };
        fetchUsername().catch((error) => {
            console.error('Unhandled error in fetchUsername:', error);
        });
    }, [isAuthenticated, navigate]);

    // Закрываем меню при изменении маршрута
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleFormSubmit = async (data) => {
        if (isCodeSent && formData && email) {
            setShowVerification(true);
            toast.info('Код уже отправлен, введите его в модальном окне');
            return;
        }

        if (!validateEmail(data.email || data.identifier)) {
            toast.error('Пожалуйста, введите корректный email.');
            return;
        }

        try {
            const endpoint = mode === 'login' ? '/api/auth/start-login' : mode === 'register' ? '/api/auth/start-registration' : '/api/auth/start-reset-password';
            const payload = { email: data.email || data.identifier };
            console.log('Sending request to', endpoint, 'with payload:', payload);
            console.log('Setting formData:', data);
            const _RESPONSE = await api.post(endpoint, payload);
            console.log('Response from', endpoint, ':', _RESPONSE.data);

            if (_RESPONSE.data === 'OK' || _RESPONSE.data.success || _RESPONSE.data.status === 'success') {
                toast.success(_RESPONSE.data.message || 'Код подтверждения отправлен');
                setFormData(data);
                setEmail(data.email || data.identifier);
                setShowVerification(true);
                setIsCodeSent(true);
                if (mode === 'login') {
                    setFailedLoginAttempts(0);
                }
            } else {
                if (mode === 'login') {
                    toast.error('Неверный email или пароль');
                    setFailedLoginAttempts((prev) => prev + 1);
                } else if (mode === 'reset') {
                    toast.error(_RESPONSE.data.error || 'Пользователь не найден');
                } else {
                    toast.error(_RESPONSE.data.error || 'Ошибка при отправке кода');
                }
            }
        } catch (error) {
            console.error('Error:', error.response?.data);
            if (mode === 'login') {
                toast.error(error.response?.data?.error || 'Введите email для входа');
                setFailedLoginAttempts((prev) => prev + 1);
            } else if (mode === 'reset') {
                toast.error(error.response?.data?.error || 'Пользователь не найден');
            } else {
                toast.error(error.response?.data?.error || 'Ошибка сервера');
            }
        }
    };

    const handleVerification = async (code) => {
        let endpoint;
        try {
            console.log('handleVerification called with formData:', formData, 'mode:', mode);
            if (!formData) {
                throw new Error('formData is not defined');
            }

            console.log('Before setting endpoint, mode:', mode, 'formData:', formData);
            if (mode === 'register') {
                endpoint = '/api/auth/sign-up';
            } else if (mode === 'reset') {
                endpoint = '/api/auth/reset-password';
            } else if (mode === 'login') {
                if (!formData.identifier) {
                    throw new Error('formData.identifier is not defined');
                }
                endpoint = '/api/auth/sign-in-with-email';
            } else {
                throw new Error('Invalid mode: ' + mode);
            }
            console.log('Endpoint set to:', endpoint);

            const payload = mode === 'reset'
                ? { email: formData.email, newPassword: formData.password, code: parseInt(code) }
                : mode === 'login'
                    ? {
                        email: formData.identifier,
                        password: formData.password,
                        code: parseInt(code)
                    }
                    : { ...formData, code: parseInt(code) };

            console.log('Sending request to', endpoint, 'with payload:', payload);
            const _RESPONSE = await api.post(endpoint, payload);
            console.log('Response from', endpoint, ':', _RESPONSE.data, 'Type:', typeof _RESPONSE.data);

            if (_RESPONSE.data === 'OK' || _RESPONSE.data === 'CREATED' || _RESPONSE.data.success || _RESPONSE.data.status === 'success' || _RESPONSE.data.token) {
                toast.success(_RESPONSE.data.message || mode === 'reset' ? 'Пароль успешно сброшен' : 'Успешно!');
                setShowVerification(false);
                setIsCodeSent(false);
                if (_RESPONSE.data.token) {
                    localStorage.setItem('token', _RESPONSE.data.token);
                    setIsAuthenticated(true);
                }
                setMode('login');
            } else {
                console.warn('Unexpected response from', endpoint, ':', _RESPONSE.data);
                toast.error(_RESPONSE.data.error || mode === 'register' ? 'Ошибка регистрации: неверный код или данные' : 'Неверный код');
            }
        } catch (error) {
            console.error('Error in', endpoint || 'unknown endpoint', ':', error.message, error.response?.data, 'Status:', error.response?.status);
            let errorMessage;
            if (mode === 'register') {
                errorMessage = error.response?.data?.error === 'Internal Server Error'
                    ? 'Пользователь с таким email уже существует'
                    : error.response?.data?.error || 'Ошибка регистрации: неверный код или данные';
            } else if (mode === 'reset') {
                errorMessage = error.response?.data?.error === 'Internal Server Error'
                    ? 'Неверный код или неподходящий пароль'
                    : error.response?.data?.error || 'Ошибка верификации';
            } else {
                errorMessage = error.response?.data?.error === 'Internal Server Error'
                    ? 'Неверный код подтверждения'
                    : error.response?.data?.error || 'Ошибка верификации';
            }
            toast.error(errorMessage);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setMode('login');
        setIsCodeSent(false);
        setIsMenuOpen(false);
        setUsername('');
        navigate('/events');
    };

    const handleModalClose = () => {
        setShowVerification(false);
    };

    const toggleMenu = () => {
        setIsMenuOpen((prev) => !prev);
    };

    const navigateToProfile = () => {
        navigate('/profile');
    };

    const navigateToCreateEvent = (eventData = null) => {
        console.log('Navigating to create event with data:', eventData);
        if (eventData && eventData.type && eventData.nativeEvent) {
            console.warn('Received event object instead of eventData, using null instead');
            eventData = null; // Преобразуем событие в null, если это объект события
        }
        navigate('/create-event', { state: { eventData } });
    };

    const navigateToEvents = () => {
        navigate('/events');
    };

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-gray-100 p-4 overflow-x-hidden">
            {isAuthenticated ? (
                <div className="w-full h-full relative bg-gray-100">
                    <Routes>
                        <Route
                            path="/events"
                            element={
                                <EventsPage
                                    username={username}
                                    toggleMenu={toggleMenu}
                                    isMenuOpen={isMenuOpen}
                                    onLogout={logout}
                                    navigateToProfile={navigateToProfile}
                                    navigateToCreateEvent={navigateToCreateEvent}
                                />
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProfilePage
                                    username={username}
                                    toggleMenu={toggleMenu}
                                    isMenuOpen={isMenuOpen}
                                    onLogout={logout}
                                    navigateToEvents={navigateToEvents}
                                    navigateToCreateEvent={navigateToCreateEvent}
                                />
                            }
                        />
                        <Route
                            path="/create-event"
                            element={
                                <CreateEventPage
                                    username={username}
                                    toggleMenu={toggleMenu}
                                    isMenuOpen={isMenuOpen}
                                    onLogout={logout}
                                    navigateToEvents={navigateToEvents}
                                    navigateToProfile={navigateToProfile}
                                    editingEvent={location.state?.eventData || null}
                                    handleCreateEvent={async (eventData) => {
                                        try {
                                            const token = localStorage.getItem('token');
                                            const _RESPONSE = await api.post('/api/event/', eventData, {
                                                headers: { Authorization: `Bearer ${token}` }
                                            });
                                            toast.success('Событие успешно создано!');
                                            navigate('/events');
                                        } catch (error) {
                                            console.error('Error creating event:', error);
                                            toast.error('Ошибка при создании события');
                                        }
                                    }}
                                />
                            }
                        />
                        <Route path="*" element={<EventsPage
                            username={username}
                            toggleMenu={toggleMenu}
                            isMenuOpen={isMenuOpen}
                            onLogout={logout}
                            navigateToProfile={navigateToProfile}
                            navigateToCreateEvent={navigateToCreateEvent}
                        />} />
                    </Routes>
                </div>
            ) : (
                <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg relative">
                    <h1 className="text-2xl font-bold text-center mb-6 text-gray-900">Life Planning App</h1>
                    <div className="flex justify-center mb-4 space-x-4">
                        <button
                            className={`px-4 py-2 ${mode === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                            onClick={() => setMode('login')}
                        >
                            Вход
                        </button>
                        <button
                            className={`px-4 py-2 ${mode === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600'}`}
                            onClick={() => setMode('register')}
                        >
                            Регистрация
                        </button>
                    </div>
                    {mode === 'login' && (
                        <LoginForm
                            onSubmit={handleFormSubmit}
                            failedLoginAttempts={failedLoginAttempts}
                            onReset={() => setMode('reset')}
                            validateEmail={validateEmail}
                        />
                    )}
                    {mode === 'register' && <RegisterForm onSubmit={handleFormSubmit} />}
                    {mode === 'reset' && <ResetPasswordForm onSubmit={handleFormSubmit} />}
                    {showVerification && (
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 p-4 rounded-lg z-20">
                            <VerificationModal
                                email={email}
                                onVerify={handleVerification}
                                onClose={handleModalClose}
                            />
                        </div>
                    )}
                    <ToastContainer position="top-right" autoClose={3000} />
                </div>
            )}
        </div>
    );
}

export default App;