import { useEffect, useRef, useState } from 'react';
import { createAssistant, createSmartappDebugger, AssistantAppState } from '@salutejs/client';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home/Home';
import Stats from './pages/Stats';
import './styles/App.scss';
import { Habit } from './components/HabitCard';
import Modal from './components/Modal/Modal';
import AddHabitForm from './pages/AddHabit/AddHabitForm';

interface DeleteHabitAction {
  type: 'delete_habit';
  id: string; // Номер привычки (1-based)
}



const getTodayDateString = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};


const isDev = import.meta.env.MODE === 'development';

const generateUniqueId = (): string => {
    return Date.now().toString() + Math.random().toString(16).slice(2);
};

const initializeAssistant = (getState: () => AssistantAppState
  ) => {
  if (isDev) {
    return createSmartappDebugger({
      token: import.meta.env.VITE_SMARTAPP_TOKEN ?? '',
      initPhrase: 'запусти Трекер Привычек',
      getState,
      nativePanel:{
        defaultText: "Поговори со мной братишка",
			screenshotMode: false,
			tabIndex: -1,
      }
    });
  }
    return createAssistant({ getState });
};

const App = () => {
  const assistantRef = useRef<ReturnType<typeof createAssistant>>();
  const [habits, setHabits] = useState<Habit[]>([
    {
			id: generateUniqueId(),
      title: 'Пить воду',
      duration: 21,
      startTime: '07:00',
      endTime: '08:00',
      progress: 7,
      goal: 'Пить 2 литра воды каждый день',
      icon: '💧',
      //completedToday: true,
			lastCompletedDate: undefined
    },
    {
			id: generateUniqueId(),
      title: 'Читать книгу',
      duration: 30,
      startTime: '20:00',
      endTime: '21:00',
      progress: 15,
      goal: 'Прочитать 10 страниц каждый день',
      icon: '📚',
      //completedToday: false,
			lastCompletedDate: undefined
    },
  ]);



  // Состояние для управления видимостью модального окна
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  // Новое состояние для хранения названия привычки от ассистента
  const [initialHabitTitle, setInitialHabitTitle] = useState<string | undefined>(undefined);



const handleDeleteHabit = (idToDelete: string) => {
      console.log('Attempting to delete habit with ID:', idToDelete);
      // Фильтруем список, оставляя все привычки, кроме той, у которой совпадает ID
      setHabits(prevHabits => {
          const newHabits = prevHabits.filter(habit => habit.id !== idToDelete);
          console.log('New habits list after deletion:', newHabits);
          return newHabits;
      });
      // Нет необходимости в проверке индекса, filter сам справится
  };




  // Функции для открытия и закрытия модального окна
  const handleOpenModal = () => setShowAddHabitModal(true);
  const handleCloseModal = () => {
    setShowAddHabitModal(false);
    // Очищаем начальное название при закрытии модального окна
    setInitialHabitTitle(undefined);
  };


  // Обработчик добавления привычки, который также закрывает модальное окно
 	const handleAddHabit = (newHabitData: Omit<Habit, 'id' | 'completedToday' | 'lastCompletedDate'>) => {
    // Создаем полный объект Habit с уникальным ID
    const habitWithId: Habit = {
        ...newHabitData,
        id: generateUniqueId(), // Генерируем и присваиваем уникальный ID
        lastCompletedDate: undefined
				//completedToday: newHabitData.completedToday ?? false, // Убедимся, что completedToday имеет значение (по умолчанию false)
    };
    setHabits(prev => [...prev, habitWithId]);
    handleCloseModal();
  };


	const handleCompleteToday = (idToComplete: string) => {
      console.log('Attempting to mark habit as completed today for ID:', idToComplete);
      const todayString = getTodayDateString(); // Получаем текущую дату

      setHabits(prevHabits => {
          return prevHabits.map(habit => {
              // Находим привычку по ID
              if (habit.id === idToComplete) {
                  // *** Логика отметки выполнения: Только если прогресс меньше длительности ***
                  if (habit.progress < habit.duration) {
                       console.log(`Increasing progress and marking date for habit ${idToComplete}.`);
                       // Возвращаем новый объект привычки с обновленными полями
                       return {
                           ...habit,
                           progress: habit.progress + 1, // Увеличиваем прогресс на 1
                           lastCompletedDate: todayString, // Записываем сегодняшнюю дату
                       };
                  } else {
                      // Если прогресс уже достиг или превысил длительность, ничего не делаем
                      console.log(`Habit ${idToComplete} has already reached its duration goal.`);
                      return habit;
                  }
              }
              // Для всех остальных привычек возвращаем их без изменений
              return habit;
          });
      });
  };


   useEffect(() => {
    const assistant = initializeAssistant(() => {
        // ... ваша функция getStateForAssistant, возможно пустая если не нужна
			return {
             item_selector: {
                 items: habits.map((habit, index) => ({ id: habit.id, title: habit.title, number: index + 1 })),
                 ignored_words: ['удалить', 'удали', 'номер', 'привычку'],
             }
        };
        return {};
    });
    assistantRef.current = assistant;
/* eslint-disable  @typescript-eslint/no-explicit-any */
    assistant.on('data', (event: any) => { // Теперь event может содержать event.action
      console.log('assistant.on(data)', event);

      // *** Вот тут ключевое изменение: проверяем event.action ***
      if (event.action) {
        console.log('Assistant action received:', event.action);

        // Проверяем, что тип действия 'add_habit' и есть поле title
        if (event.action.type === 'add_habit' && typeof event.action.title === 'string') {
          const habitTitleFromAssistant = event.action.title;
          console.log('Название привычки от ассистента:', habitTitleFromAssistant);

          // Устанавливаем начальное название в состояние
          setInitialHabitTitle(habitTitleFromAssistant);

          // Открываем модальное окно
          setShowAddHabitModal(true);
        }
				 else if (event.action.type === 'delete_habit') {
             // Проверяем, что поле id существует и является непустой строкой
             // Тип HandledActions уже подсказывает TypeScript, что у delete_habit есть id
             const deleteAction = event.action as DeleteHabitAction; // Приводим к типу удаления

             // *** Проверяем наличие и тип поля id ***
             if (typeof deleteAction.id === 'string' && deleteAction.id) {
                 const habitIdToDelete = deleteAction.id; // Получаем ID напрямую из action

                 console.log('Received delete_habit action for ID:', habitIdToDelete);

                 // *** ВЫЗЫВАЕМ handle delete habit НАПРЯМУЮ С ПОЛУЧЕННЫМ ID ***
                 // Логика поиска по номеру и индексу больше не нужна, так как бэкенд прислал ID
                 handleDeleteHabit(habitIdToDelete);
                 console.log(`Requested deletion for habit with ID: ${habitIdToDelete}`);

             } else {
                 // Если поле id отсутствует или некорректно пришло от бэкенда
                 console.warn('Received delete_habit action without a valid ID:', event.action);
                 // Возможно, отправить голосовой ответ пользователю: "Извините, я не получил идентификатор привычки, которую нужно удалить."
                 // assistantRef.current?.sendData({ type: 'tts', value: "Извините, не удалось определить, какую привычку удалить." });
             }
        }
        // --- КОНЕЦ ИСПРАВЛЕННОЙ Обработки действия удаления привычки по ID ---

        // Здесь можно добавить обработку других типов action
				else if (event.action.type === 'complete_habit_voice') { // Используем тип CompleteHabitVoiceAction
             if ('id' in event.action && typeof event.action.id === 'string' && event.action.id) {
                 const habitIdToComplete = event.action.id;
                 console.log('Received complete_habit_voice action for ID:', habitIdToComplete);
                 // Вызываем нашу функцию отметки выполнения
                 handleCompleteToday(habitIdToComplete);
             } else {
                 console.warn('Received complete_habit_voice action without a valid ID:', event.action);
             }
        }
      }
      // Здесь можно обрабатывать другие типы событий data, не связанные с action
    });

    // ... (обработчики theme, start, command, error, tts)

    return () => {
        // Функция очистки при размонтировании
    };
    // Зависимости: теперь не нужно добавлять habits, так как мы не обращаемся к массиву habits
    // внутри обработчика delete_habit для поиска по индексу.
    // Однако, если getStateForAssistant использует habits, то habits должен остаться в зависимостях.
    // Допустим, что getStateForAssistant может использовать habits для item_selector,
    // поэтому оставляем habits в зависимостях.
  }, [habits]); // Оставляем habits в зависимостях, если getStateForAssistant его использует


  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <h1 className="navbar-title">🧠 Трекер Привычек</h1>
          <div className="navbar-links">
            <Link to="/" className="nav-link">Главная</Link>
            {/* Изменяем Link на div или button и добавляем onClick */}
            <Link to="/stats" className="nav-link">Статистика</Link>
          </div>
        </nav>

        <main className="main-content">
					<button className="nav-link" onClick={handleOpenModal} style={{ cursor: 'pointer' }}>
              Добавить привычку
            </button>
          <Routes>
            <Route path="/" element={<Home habits={habits}  onDeleteHabit={handleDeleteHabit} onCompleteToday={handleCompleteToday}/>} />
            <Route path="/stats" element={<Stats />} />
          </Routes>

          {/* Условное отображение модального окна */}
          {showAddHabitModal && (
            <Modal onClose={handleCloseModal}>
              {/* Передаем начальное название в AddHabitForm */}
              <AddHabitForm
                onAdd={handleAddHabit}
                onClose={handleCloseModal}
                initialTitle={initialHabitTitle} // <-- Передаем сюда
              />
            </Modal>
          )}

        </main>
      </div>
    </Router>
  );
};

export default App;
