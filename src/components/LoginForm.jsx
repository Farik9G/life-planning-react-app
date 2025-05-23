import { useState } from 'react';
import { toast } from 'react-toastify';

const LoginForm = ({ onSubmit, failedLoginAttempts, onReset, validateEmail }) => {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateEmail && !validateEmail(identifier)) {
            toast.error('Пожалуйста, введите корректный email.');
            return;
        }
        onSubmit({ identifier, password });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-gray-600 text-sm font-medium mb-1">Email</label>
                <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                    placeholder="Введите ваш email"
                    required
                />
            </div>
            <div>
                <label className="block text-gray-600 text-sm font-medium mb-1">Пароль</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-900"
                    placeholder="Введите ваш пароль"
                    required
                />
            </div>
            {failedLoginAttempts > 2 && (
                <button
                    type="button"
                    onClick={onReset}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                >
                    Забыли пароль?
                </button>
            )}
            <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
                Войти
            </button>
        </form>
    );
};

export default LoginForm;