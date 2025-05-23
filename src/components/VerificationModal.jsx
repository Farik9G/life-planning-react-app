import { useState } from 'react';

const VerificationModal = ({ email, onVerify, onClose }) => {
    const [code, setCode] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onVerify(code);
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-center text-gray-900">Введите код подтверждения</h2>
            <p className="text-center mb-4 text-gray-900">Код отправлен на {email}</p>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded mb-4 bg-white text-gray-900"
                    placeholder="Введите код"
                    required
                />
                <div className="flex justify-between">
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Подтвердить
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                        Закрыть
                    </button>
                </div>
            </form>
        </div>
    );
};

export default VerificationModal;