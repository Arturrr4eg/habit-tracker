import {
  createAssistant,
  createSmartappDebugger,
  CreateAssistantParams,
} from '@salutejs/client';

const isDev = import.meta.env.MODE === 'development';

export const initializeAssistant = () => {
  const getState = () => {
    return {};
  };

  if (isDev) {
    return createSmartappDebugger({
      token: import.meta.env.VITE_SMARTAPP_TOKEN || '',
      initPhrase: 'запусти трекер',
      getState,
    });
  } else {
    const prodParams: CreateAssistantParams = {
      getState,
    };
    return createAssistant(prodParams);
  }
};
