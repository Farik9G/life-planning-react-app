import { useState } from 'react';
import api from '../api';

const CreateEventPage = ({ username, toggleMenu, isMenuOpen, onLogout, navigateToEvents, navigateToProfile }) => {
    const [eventTitle, setEventTitle] = useState('');
    const [eventDescription, setEventDescription] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('00:00');
    const [eventPriority, setEventPriority] = useState('MEDIUM');
    const [hasPassed, setHasPassed] = useState(false);
    const token = localStorage.getItem('token');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formattedDate = eventDate && eventTime ? `${eventDate} ${eventTime}:00.000` : null;
        const payload = {
            title: eventTitle,
            description: eventDescription,
            date: formattedDate,
            priority: eventPriority,
            hasPassed: hasPassed
        };
        try {
            console.log('Creating event with payload:', payload, 'Authorization:', `Bearer ${token}`);
            const response = await api.post('/api/event/', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Response data:', response.data);
            navigateToEvents();
            setEventTitle('');
            setEventDescription('');
            setEventDate('');
            setEventTime('00:00');
            setEventPriority('MEDIUM');
            setHasPassed(false);
            console.log('Event created:', response.data);
        } catch (error) {
            console.error('Error creating event:', error.response?.data || error.message);
        }
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
                    input[type="date"], input[type="time"] {
                        color: #1f2937;
                    }
                    .custom-checkbox {
                        appearance: none;
                        width: 20px;
                        height: 20px;
                        border: 2px solid #4b5563;
                        border-radius: 50%;
                        cursor: pointer;
                        transition: all 0.2s ease-in-out;
                    }
                    .custom-checkbox:checked {
                        background-color: #3b82f6;
                        border-color: #3b82f6;
                        position: relative;
                    }
                    .custom-checkbox:checked::after {
                        content: '';
                        position: absolute;
                        top: 3px;
                        left: 6px;
                        width: 5px;
                        height: 10px;
                        border: solid white;
                        border-width: 0 2px 2px 0;
                        transform: rotate(45deg);
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
                    .input-icon-wrapper {
                        position: relative;
                    }
                    .input-icon {
                        position: absolute;
                        left: 10px;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 20px;
                        height: 20px;
                        color: #4b5563;
                    }
                    .input-with-icon {
                        padding-left: 40px;
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
                                        onClick={navigateToEvents}
                                    >
                                        Мои события
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

                <div className="max-w-md mx-auto bg-gray-100 p-8 rounded-xl shadow-md mt-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Создать событие</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-1">Название события</label>
                            <input
                                type="text"
                                value={eventTitle}
                                onChange={(e) => setEventTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-900"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-1">Описание</label>
                            <textarea
                                value={eventDescription}
                                onChange={(e) => setEventDescription(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-900"
                                rows="4"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-1">Дата</label>
                            <div className="input-icon-wrapper">
                                <svg
                                    className="input-icon"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <input
                                    type="date"
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-900 input-with-icon"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-1">Время</label>
                            <div className="input-icon-wrapper">
                                <svg
                                    className="input-icon"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <input
                                    type="time"
                                    value={eventTime}
                                    onChange={(e) => setEventTime(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-900 input-with-icon"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-600 text-sm font-medium mb-1">Приоритет</label>
                            <select
                                value={eventPriority}
                                onChange={(e) => setEventPriority(e.target.value)}
                                className="w-full custom-select text-gray-900"
                            >
                                <option value="LOW">Низкий</option>
                                <option value="MEDIUM">Средний</option>
                                <option value="HIGH">Высокий</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={hasPassed}
                                onChange={(e) => setHasPassed(e.target.checked)}
                                className="custom-checkbox"
                            />
                            <label className="ml-2 text-gray-600 text-sm font-medium">Отметить как прошедшее</label>
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200 font-medium"
                        >
                            Создать
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateEventPage;