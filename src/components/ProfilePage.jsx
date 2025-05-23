import { useState, useEffect } from 'react';
import api from '../api';

const ProfilePage = ({ username, toggleMenu, isMenuOpen, onLogout, navigateToEvents, navigateToCreateEvent }) => {
    const [user, setUser] = useState(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchUserData = async () => {
            if (!token) {
                console.warn('No token found, skipping fetch');
                return;
            }
            try {
                const response = await api.get('/api/user/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.log('User data response:', response.data);
                setUser(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error.response?.data || error.message);
            }
        };
        fetchUserData();
    }, [token]);

    return (
        <>
            <style>
                {`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.3s ease-out;
                    }
                    .glow:hover {
                        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
                    }
                    button:focus {
                        outline: none;
                        box-shadow: none;
                    }
                `}
            </style>
            <div className="w-full h-screen p-6 bg-gray-50 relative">
                <div className="absolute top-4 right-4">
                    <button
                        className="p-2 z-50 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 transition-all duration-300 shadow-lg glow relative"
                        onClick={toggleMenu}
                    >
                        <svg
                            className="w-6 h-6 text-gray-900"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                        {isMenuOpen && (
                            <div className="absolute top-[calc(100%+0.5rem)] right-0 w-56 bg-gray-600 bg-opacity-90 rounded-xl shadow-lg animate-fadeIn z-50">
                                <div className="p-5">
                                    <p className="text-gray-100 font-bold mb-3 border-b border-gray-500 pb-2">{username}</p>
                                    <div
                                        className="w-full text-left px-3 py-2 text-gray-100 hover:bg-gray-500 rounded-lg transition duration-200 cursor-pointer"
                                        onClick={navigateToEvents}
                                    >
                                        Мои события
                                    </div>
                                    <div
                                        className="w-full text-left px-3 py-2 text-gray-100 hover:bg-gray-500 rounded-lg transition duration-200 cursor-pointer"
                                        onClick={navigateToCreateEvent}
                                    >
                                        Создать событие
                                    </div>
                                    <div
                                        className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-500 rounded-lg transition duration-200 cursor-pointer"
                                        onClick={onLogout}
                                    >
                                        Выйти
                                    </div>
                                </div>
                            </div>
                        )}
                    </button>
                </div>

                <div className="w-full max-w-2xl mx-auto mt-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Профиль</h2>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-gray-600 mb-2"><strong>Имя пользователя:</strong> {user?.username || 'Не указано'}</p>
                        <p className="text-gray-600 mb-2"><strong>Имя:</strong> {user?.firstName || 'Не указано'}</p>
                        <p className="text-gray-600 mb-2"><strong>Фамилия:</strong> {user?.surname || 'Не указано'}</p>
                        <p className="text-gray-600 mb-2"><strong>Отчество:</strong> {user?.patronymic || 'Не указано'}</p>
                        <p className="text-gray-600 mb-2"><strong>Email:</strong> {user?.email || 'Не указано'}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProfilePage;