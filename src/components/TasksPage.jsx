import { useState, useEffect } from 'react';
import api from '../api';

const TasksPage = ({ username, toggleMenu, isMenuOpen, onLogout, navigateToEvents, navigateToProfile }) => {
    const [events, setEvents] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/api/event/', {
                    headers: { Authorization: `Bearer_${token}` }
                });
                setEvents(response.data || []);
            } catch (error) {
                console.error('Error fetching events:', error.response?.data || error.message);
            }
        };
        fetchEvents();
    }, [token]);

    const handleGoToEvents = () => {
        navigateToEvents();
        toggleMenu();
    };

    const handleGoToProfile = () => {
        navigateToProfile();
        toggleMenu();
    };

    const priorityLabels = {
        LOW: 'Низкий',
        MEDIUM: 'Средний',
        HIGH: 'Высокий'
    };

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
                `}
            </style>
            <div className="w-full h-full p-6 bg-gray-50 relative">
                <div className="absolute top-4 right-4">
                    <button
                        className="p-2 z-30 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 transition-all duration-300 shadow-lg glow relative"
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
                            <div className="absolute top-[calc(100%+0.5rem)] right-0 w-56 bg-gray-600 bg-opacity-90 rounded-xl shadow-lg animate-fadeIn z-30">
                                <div className="p-5">
                                    <p className="text-gray-100 font-bold mb-3 border-b border-gray-500 pb-2">{username}</p>
                                    <div
                                        className="w-full text-left px-3 py-2 text-gray-100 hover:bg-gray-500 rounded-lg transition duration-200 cursor-pointer"
                                        onClick={handleGoToProfile}
                                    >
                                        Профиль
                                    </div>
                                    <div
                                        className="w-full text-left px-3 py-2 text-gray-100 hover:bg-gray-500 rounded-lg transition duration-200 cursor-pointer"
                                        onClick={handleGoToEvents}
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
                <div className="max-w-2xl mx-auto mt-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Все события</h2>
                    {events.length === 0 ? (
                        <p className="text-gray-600">У вас пока нет событий.</p>
                    ) : (
                        <div className="space-y-4">
                            {events.map(event => (
                                <div
                                    key={event.id}
                                    className={`p-4 rounded-lg shadow-md ${event.hasPassed ? 'bg-gray-100' : 'bg-white'}`}
                                >
                                    <h3 className="text-lg font-medium text-gray-800">{event.title}</h3>
                                    <p className="text-gray-600">{event.description}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Дата: {event.date || 'Не указана'}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Приоритет: {priorityLabels[event.priority] || 'Средний'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default TasksPage;