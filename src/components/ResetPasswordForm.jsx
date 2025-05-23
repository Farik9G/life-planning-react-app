import { useForm } from 'react-hook-form';

function ResetPasswordForm({ onSubmit }) {
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onFormSubmit = (data) => {
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input
                    id="email"
                    type="email"
                    {...register('email', { required: 'Email обязателен', pattern: { value: /^\S+@\S+$/i, message: 'Неверный формат email' } })}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <button
                type="submit"
                className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700"
            >
                Отправить код
            </button>
        </form>
    );
}

export default ResetPasswordForm;