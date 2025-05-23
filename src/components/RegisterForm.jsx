import { useForm } from 'react-hook-form';

function RegisterForm({ onSubmit }) {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmitForm = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                </label>
                <input
                    {...register('username', { required: 'Username обязателен' })}
                    id="username"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
                {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
            </div>
            <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    Имя
                </label>
                <input
                    {...register('firstName', { required: 'Имя обязательно' })}
                    id="firstName"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
                {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
            </div>
            <div>
                <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
                    Фамилия
                </label>
                <input
                    {...register('surname', { required: 'Фамилия обязательна' })}
                    id="surname"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
                {errors.surname && <p className="text-red-500 text-sm">{errors.surname.message}</p>}
            </div>
            <div>
                <label htmlFor="patronymic" className="block text-sm font-medium text-gray-700">
                    Отчество
                </label>
                <input
                    {...register('patronymic')}
                    id="patronymic"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    {...register('email', {
                        required: 'Email обязателен',
                        pattern: {
                            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                            message: 'Некорректный email',
                        },
                    })}
                    id="email"
                    type="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Пароль
                </label>
                <input
                    {...register('password', {
                        required: 'Пароль обязателен',
                        minLength: { value: 6, message: 'Пароль должен быть не менее 6 символов' },
                    })}
                    id="password"
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Зарегистрироваться
            </button>
        </form>
    );
}

export default RegisterForm;