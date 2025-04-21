import { createAssistant, createSmartappDebugger } from '@salutejs/client';

const initializeAssistant = () => {
	const assistantParams = {
		token: import.meta.env.VITE_SMARTAPP_TOKEN || '',  // Получаем токен из переменных окружения
		initPhrase: 'запусти хабит трекер',
		getState: () => {
			// Здесь возвращаем нужное состояние
			return {
				// Здесь твое состояние или пустой объект
			};
		}
	};

	return createSmartappDebugger(assistantParams); // Отправляем параметры с getState
};
