import { useState, useEffect } from 'react';
import api from '../api';

const EventsPage = ({ username, toggleMenu, isMenuOpen, onLogout, navigateToProfile, navigateToCreateEvent }) => {
    const [events, setEvents] = useState([]);
    const [sortOrder, setSortOrder] = useState('ASC');
    const [sortBy, setSortBy] = useState('date');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    const fetchEvents = async () => {
        if (!token) {
            console.warn('No token found, skipping fetch');
            setError('Не авторизован. Пожалуйста, войдите.');
            return;
        }
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching events with params:', { sortBy, sortOrder, token });
            const response = await api.get(`/api/event/?sort=${sortBy}&order=${sortOrder}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Fetch events response:', response.data);
            response.data.forEach(event => console.log(`Event ${event.id} hasPassed: ${event.hasPassed}`));
            const sortedEvents = sortEvents(response.data, sortBy, sortOrder);
            setEvents(sortedEvents);
        } catch (error) {
            console.error('Error fetching events:', error.response?.data || error.message, 'Status:', error.response?.status);
            setError(`Ошибка загрузки событий: ${error.response?.statusText || error.message}. Проверьте сервер или токен.`);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    const sortEvents = (eventsToSort, sortBy, sortOrder) => {
        return [...eventsToSort].sort((a, b) => {
            let valueA, valueB;
            switch (sortBy) {
                case 'date':
                    valueA = new Date(a.date).getTime();
                    valueB = new Date(b.date).getTime();
                    break;
                case 'title':
                    valueA = a.title.toLowerCase();
                    valueB = b.title.toLowerCase();
                    break;
                case 'priority':
                    const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2 };
                    valueA = priorityOrder[a.priority] || 0;
                    valueB = priorityOrder[b.priority] || 0;
                    break;
                case 'hasPassed':
                    valueA = a.hasPassed ? 1 : 0;
                    valueB = b.hasPassed ? 1 : 0;
                    break;
                default:
                    valueA = new Date(a.date).getTime();
                    valueB = new Date(b.date).getTime();
            }
            return sortOrder === 'ASC' ? valueA - valueB : valueB - valueA;
        });
    };

    useEffect(() => {
        fetchEvents();
    }, [token, sortOrder, sortBy]);

    const handleSortChange = (newSortBy) => {
        console.log('Sort by changed to:', newSortBy);
        setSortBy(newSortBy);
    };

    const handleOrderChange = (newSortOrder) => {
        console.log('Sort order changed to:', newSortOrder);
        setSortOrder(newSortOrder);
    };

    const priorityLabels = {
        LOW: 'Низкий',
        MEDIUM: 'Средний',
        HIGH: 'Высокий'
    };

    const priorityColors = {
        LOW: '#3B82F6',
        MEDIUM: '#F59E0B',
        HIGH: '#EF4444'
    };

    const normalizePriority = (priority) => {
        const normalized = priority?.toUpperCase() || 'MEDIUM';
        return priorityLabels[normalized] || 'Средний';
    };

    const eventStatus = (hasPassed) => (hasPassed ? 'Прошедшее' : 'Активное');
    const statusColor = (hasPassed) => (hasPassed ? '#EF4444' : '#10B981');

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
                                        onClick={navigateToProfile}
                                    >
                                        Профиль
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

                <div className="max-w-2xl mx-auto mt-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Мои события</h2>
                    <div className="flex space-x-4 mb-6">
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-1">Сортировать по</label>
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-900"
                            >
                                <option value="title">Названию</option>
                                <option value="date">Дате</option>
                                <option value="priority">Приоритету</option>
                                <option value="hasPassed">Статусу</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-1">Порядок</label>
                            <select
                                value={sortOrder}
                                onChange={(e) => handleOrderChange(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-900"
                            >
                                <option value="ASC">По возрастанию</option>
                                <option value="DESC">По убыванию</option>
                            </select>
                        </div>
                    </div>
                    {loading ? (
                        <p className="text-gray-600">Загрузка событий...</p>
                    ) : error ? (
                        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                            <p>{error}</p>
                        </div>
                    ) : events.length === 0 ? (
                        <p className="text-gray-600">У вас пока нет событий.</p>
                    ) : (
                        <div className="space-y-4">
                            {events.map(event => (
                                <div
                                    key={event.id}
                                    className={`p-4 rounded-lg shadow-md ${event.hasPassed ? 'bg-gray-100' : 'bg-white'}`}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <h3 className="text-lg font-medium text-gray-800">{event.title || 'Без названия'}</h3>
                                    <p className="text-gray-600">{event.description || 'Без описания'}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Дата: {event.date ? new Date(event.date.split('.')[0]).toLocaleString() : 'Не указана'}
                                    </p>
                                    <p className="text-sm mt-1">
                                        <span className="text-gray-500">Приоритет: </span>
                                        <span style={{ color: priorityColors[event.priority] }}>{normalizePriority(event.priority)}</span>
                                    </p>
                                    <p className="text-sm mt-1">
                                        <span className="text-gray-500">Статус: </span>
                                        <span style={{ color: statusColor(event.hasPassed) }}>{eventStatus(event.hasPassed)}</span>
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

export default EventsPage;