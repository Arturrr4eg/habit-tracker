import { AssistantAppState, createAssistant, createSmartappDebugger } from '@salutejs/client';
import React from "react";
import './styles.css';
import { PlayerSession } from "@entities/users/types.ts";

// Типы для состояния приложения
interface AppComponentState {
  Users: PlayerSession[];
}

interface ItemSelectorState {
  items: PlayerSession[];
  ignored_words: string[];
}

interface AssistantAppCustomState {
  item_selector: ItemSelectorState;
}

type ActionType = 'reset_game' | 'add_user' | 'delete_user' | 'rename_user' |
  'increase_user_level' | 'decrease_user_level' |
  'increase_user_power' | 'decrease_user_power';

type AssistantAction = {
  type: ActionType;
  username: string;
  newUsername: string;
  power: string;
};


const initializeAssistant = (
  getState: () => AssistantAppState
) => {
  if (import.meta.env.MODE === 'development') {
    return createSmartappDebugger({
      token: import.meta.env.VITE_APP_TOKEN ?? '',
      initPhrase: `Запусти ${import.meta.env.VITE_APP_SMARTAPP}`,
      getState,
      nativePanel: {
        defaultText: 'ччччччч',
        screenshotMode: false,
        tabIndex: -1,
      },
    });
  }
  return createAssistant({ getState });
};

export class Ass extends React.Component<{}, AppComponentState> {
  private assistant?: ReturnType<typeof createAssistant>;

  constructor(props: {}) {
    super(props);
    this.state = {
      Users: [{ username: "Игрок", level: 1, power: 1 }],
    };
  }

  async componentDidMount() {
    try {
      this.assistant = await initializeAssistant(() => this.getStateForAssistant());
      this.setupAssistantListeners();
    } catch (error) {
      console.error('Assistant initialization failed:', error);
    }
  }

  setupAssistantListeners() {
    if (!this.assistant) return;
    console.log("listen")

    this.assistant.on('data', (event: any) => {
      console.log('assistant.on(data)', event);
      if (event.action) {
        console.log("vlad loh")
        this.dispatchAssistantAction(event.action);
      }
    });

    this.assistant.on('start', () => {
      console.log('assistant.on(start)', this.assistant?.getInitialData());
    });

    this.assistant.on('command', console.log);
    this.assistant.on('error', console.error);
    this.assistant.on('tts', console.log);
  }

  getStateForAssistant(): AssistantAppState & AssistantAppCustomState {
    return {
      item_selector: {
        items: this.state.Users.map(({username, level, power}) => ({
          username,
          level,
          power
        })),
        ignored_words: [
          'добавить', 'установить', 'запиши', 'поставь', 'закинь', 'напомнить',
          'удалить', 'удали',
          'выполни', 'выполнил', 'сделал'
        ],
      },
    };
  }

  dispatchAssistantAction(action: AssistantAction) {
    console.log(action)
    switch (action.type) {
      case "reset_game":
        return this.resetGame();
      case "add_user":
        return this.addUser(action.username);
      case "delete_user":
        return this.deleteUser(action.username);
      case "rename_user":
        return this.renameUser(action.username, action.newUsername);
      case "increase_user_power":
        return this.increasePower(action.username, action.power);
      case "decrease_user_power":
        return this.decreasePower(action.username, action.power);
      case "increase_user_level":
        return this.increaseLevel(action.username);
      case "decrease_user_level":
        return this.decreaseLevel(action.username);
      default:
        console.warn('Unknown action type:', action.type);
    }
  }

  resetGame() {
    this.setState( prev => ({
      Users: [...prev.Users.map(user => ({username: user.username, level: 1, power: 1}))]
    }));
  }

  addUser(username: string) {
    this.setState(prev => ({
      Users: [...prev.Users, { username, level: 1, power: 1 }]
    }));
  }

  deleteUser(username: string) {
    this.setState(prev => ({
      Users: [...prev.Users.filter(user => user.username !== username)]
    }));
  }
