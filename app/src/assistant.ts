import {
  createAssistant,
  createSmartappDebugger,
} from '@salutejs/client';

const isDev = import.meta.env.MODE === 'development';

export const initializeAssistant = () => {
  const getState = () => {
    return {}; // здесь можно потом вставить state, если нужно
  };

  if (isDev) {
    return createSmartappDebugger({
      token: import.meta.env.VITE_SMARTAPP_TOKEN ?? '',
      initPhrase: 'запусти Трекер_Привычек',
      getState,
    });
  } else {
    return createAssistant({ getState });
  }
};
