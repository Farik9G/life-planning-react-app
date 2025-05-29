import { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { toast } from 'react-toastify';

const EventsPage = ({ username, toggleMenu, isMenuOpen, onLogout, navigateToProfile, navigateToCreateEvent }) => {
    const [events, setEvents] = useState([]);
    const [sortOrder, setSortOrder] = useState('ASC');
    const [sortBy, setSortBy] = useState('date');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = localStorage.getItem('token');

    const fetchEvents = useCallback(async () => {
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
    }, [token, sortBy, sortOrder]);

    const sortEvents = (eventsToSort, sortBy, sortOrder) => {
        const priorityOrder = { LOW: 0, MEDIUM: 1, HIGH: 2 };
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
                    break;
            }
            if (sortBy === 'date' || sortBy === 'priority' || sortBy === 'hasPassed') {
                return sortOrder === 'ASC' ? valueA - valueB : valueB - valueA;
            }
            return sortOrder === 'ASC' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        });
    };

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Принудительная перезагрузка данных при возврате назад
    useEffect(() => {
        const handlePopState = () => {
            console.log('Popstate event detected, forcing re-render and refetching events');
            setEvents([]); // Сбрасываем состояние для принудительного перерендера
            fetchEvents();
        };

        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, [fetchEvents]);

    // Проверка пропсов
    useEffect(() => {
        if (!navigateToCreateEvent) {
            console.error('navigateToCreateEvent is not defined in EventsPage props');
        }
        if (!toggleMenu) {
            console.error('toggleMenu is not defined in EventsPage props');
        }
    }, [navigateToCreateEvent, toggleMenu]);

    const handleSortChange = (newSortBy) => {
        console.log('Sort by changed to:', newSortBy);
        setSortBy(newSortBy);
    };

    const handleOrderChange = (newSortOrder) => {
        console.log('Sort order changed to:', newSortOrder);
        setSortOrder(newSortOrder);
    };

    const handleEditEvent = (eventData) => {
        if (!eventData.id) {
            toast.error('Не удалось открыть событие для редактирования: отсутствует ID события');
            return;
        }
        if (typeof navigateToCreateEvent !== 'function') {
            console.error('navigateToCreateEvent is not a function:', navigateToCreateEvent);
            toast.error('Ошибка: навигация для редактирования недоступна');
            return;
        }
        navigateToCreateEvent(eventData);
    };

    const handleToggleMenu = () => {
        if (typeof toggleMenu !== 'function') {
            console.error('toggleMenu is not a function:', toggleMenu);
            toast.error('Ошибка: меню недоступно');
            return;
        }
        toggleMenu();
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
                    .glow:hover {
                        box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
                    }
                    button:focus {
                        outline: none;
                        box-shadow: none;
                    }
                    html, body {
                        height: 100%;
                        margin: 0;
                        padding: 0;
                        overflow: hidden;
                    }
                    .event-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                        gap: 1rem;
                        overflow-y: auto;
                        overflow-x: hidden;
                        scrollbar-width: thin;
                        scrollbar-color: #9ca3af #f3f4f6;
                        height: calc(100vh - 200px);
                        padding-top: 10px;
                    }
                    .event-grid::-webkit-scrollbar {
                        width: 8px;
                    }
                    .event-grid::-webkit-scrollbar-track {
                        background: #f3f4f6;
                    }
                    .event-grid::-webkit-scrollbar-thumb {
                        background-color: #9ca3af;
                        border-radius: 4px;
                    }
                    .event-card {
                        background-color: #f9fafb;
                        border-radius: 12px;
                        padding: 1rem;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                        max-height: 350px;
                        display: flex;
                        flex-direction: column;
                    }
                    .event-card:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
                    }
                    .event-card h3 {
                        font-size: 1.125rem;
                        font-weight: 500;
                        color: #1f2937;
                        margin-bottom: 0.5rem;
                        overflow-y: auto;
                        max-height: 60px;
                        padding-bottom: 0.25rem;
                        scrollbar-width: none;
                    }
                    .event-card h3::-webkit-scrollbar {
                        width: 0;
                        transition: width 0.3s ease;
                    }
                    .event-card h3:hover {
                        scrollbar-width: thin;
                    }
                    .event-card h3:hover::-webkit-scrollbar {
                        width: 8px;
                        transition: width 0.3s ease;
                    }
                    .event-card h3:hover::-webkit-scrollbar-track {
                        background: #f3f4f6;
                    }
                    .event-card h3:hover::-webkit-scrollbar-thumb {
                        background-color: #9ca3af;
                        border-radius: 3px;
                    }
                    .event-description {
                        flex-grow: 1;
                        max-height: 100px;
                        overflow-y: auto;
                        overflow-wrap: break-word;
                        word-break: break-word;
                        white-space: normal;
                        min-height: 40px;
                        margin-bottom: 0.5rem;
                        scrollbar-width: none;
                    }
                    .event-description::-webkit-scrollbar {
                        width: 0;
                        transition: width 0.3s ease;
                    }
                    .event-description:hover {
                        scrollbar-width: thin;
                    }
                    .event-description:hover::-webkit-scrollbar {
                        width: 8px;
                        transition: width 0.3s ease;
                    }
                    .event-description:hover::-webkit-scrollbar-track {
                        background: #f3f4f6;
                    }
                    .event-description:hover::-webkit-scrollbar-thumb {
                        background-color: #9ca3af;
                        border-radius: 3px;
                    }
                    .priority-low {
                        color: #10b981;
                        font-weight: 500;
                    }
                    .priority-medium {
                        color: #f59e0b;
                        font-weight: 500;
                    }
                    .priority-high {
                        color: #ef4444;
                        font-weight: 500;
                    }
                    .status-passed {
                        color: #6b7280;
                        font-style: italic;
                    }
                    .status-upcoming {
                        color: #3b82f6;
                        font-weight: 500;
                    }
                    .custom-select {
                        appearance: none;
                        background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%234b5563'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E") no-repeat right 0.75rem center/16px 16px;
                        border: 2px solid #4b5563;
                        border-radius: 8px;
                        padding: 0.5rem 2.5rem 0.5rem 1rem;
                        transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                    }
                    .custom-select:hover {
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    }
                    .custom-select:focus {
                        outline: none;
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
                    }
                `}
            </style>
            <div className="w-full h-full bg-gray-100 relative">
                <div className="absolute top-4 right-4">
                    <button
                        className="p-2 z-30 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 transition-all duration-300 shadow-lg glow relative"
                        onClick={handleToggleMenu}
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
                                    <p className="text-gray-100 font-bold mb-3 border-b border-gray-500 pb-2">{username || 'Гость'}</p>
                                    <div
                                        className="w-full text-left px-3 py-2 text-gray-100 hover:bg-gray-500 rounded-lg transition duration-200 cursor-pointer"
                                        onClick={navigateToProfile}
                                    >
                                        Профиль
                                    </div>
                                    <div
                                        className="w-full text-left px-3 py-2 text-gray-100 hover:bg-gray-500 rounded-lg transition duration-200 cursor-pointer"
                                        onClick={() => navigateToCreateEvent && navigateToCreateEvent()}
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

                <div className="max-w-5xl mx-auto w-full h-full flex flex-col justify-start p-2">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Мои события</h2>
                    <div className="flex flex-wrap gap-4 mb-4">
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-1">Сортировать по</label>
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="custom-select text-gray-900"
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
                                className="custom-select text-gray-900"
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
                        <div className="event-grid flex-grow">
                            {events.map((event) => (
                                <div key={event.id} className="event-card">
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">{event.title || 'Без названия'}</h3>
                                    {event.description && (
                                        <p className="text-gray-600 event-description">{event.description}</p>
                                    )}
                                    <p className="text-gray-600 mb-1">
                                        {event.date ? new Date(event.date.split('.')[0]).toLocaleString('ru-RU', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }) : 'Не указана'}
                                    </p>
                                    <p className={`mb-1 priority-${event.priority.toLowerCase()}`}>
                                        Приоритет: {event.priority === 'LOW' ? 'Низкий' : event.priority === 'MEDIUM' ? 'Средний' : 'Высокий'}
                                    </p>
                                    <p className={`mb-3 status-${event.hasPassed ? 'passed' : 'upcoming'}`}>
                                        {event.hasPassed ? 'Прошедшее' : 'Предстоящее'}
                                    </p>
                                    <button
                                        className="w-full bg-blue-500 text-white py-1.5 px-3 rounded-lg hover:bg-blue-600 transition duration-200"
                                        onClick={() => handleEditEvent(event)}
                                    >
                                        Редактировать
                                    </button>
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