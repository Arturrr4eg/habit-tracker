import { useEffect, useRef, useState } from 'react';
import { createAssistant, createSmartappDebugger, AssistantAppState } from '@salutejs/client';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Stats from './pages/Stats';
import './styles/App.scss';
import { Habit } from './components/HabitCard';
import Modal from './components/Modal/Modal';
import AddHabitForm from './pages/AddHabit/AddHabitForm';

interface DeleteHabitAction {
  type: 'delete_habit';
  id: number; // Номер привычки (1-based)
}


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
      progress: 40,
      goal: 'Пить 2 литра воды каждый день',
      icon: '💧',
      completedToday: true,
    },
    {
			id: generateUniqueId(),
      title: 'Читать книгу',
      duration: 30,
      startTime: '20:00',
      endTime: '21:00',
      progress: 60,
      goal: 'Прочитать 10 страниц каждый день',
      icon: '📚',
      completedToday: false,
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
  const handleAddHabit = (newHabitData: Omit<Habit, 'id' | 'completedToday'> & { completedToday?: boolean }) => {
    console.log('Adding new habit:', newHabitData);
    // Создаем полный объект Habit с уникальным ID
    const habitWithId: Habit = {
        ...newHabitData,
        id: generateUniqueId(), // Генерируем и присваиваем уникальный ID
        completedToday: newHabitData.completedToday ?? false, // Убедимся, что completedToday имеет значение (по умолчанию false)
    };
    setHabits(prev => [...prev, habitWithId]);
    handleCloseModal();
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
             // Проверяем, что поле number существует и является числом больше 0
             if ('number' in event.action && typeof event.action.number === 'number' && event.action.number > 0) {
                 const deleteAction = event.action as DeleteHabitAction;
                 const habitNumberToDelete = deleteAction.id; // Номер привычки (1-based)

                 console.log('Received delete_habit action for number:', habitNumberToDelete);

                 // *** НАХОДИМ ПРИВЫЧКУ ПО НОМЕРУ (индексу) И УДАЛЯЕМ ПО ЕЕ ID ***
                 // Номер привычки от ассистента соответствует индексу в массиве минус 1.
                 const indexToDelete = habitNumberToDelete - 1;

                 // Проверяем, что вычисленный индекс существует в текущем массиве привычек
                 if (indexToDelete >= 0 && indexToDelete < habits.length) {
                     // Получаем объект привычки по индексу
                     const habitToDelete = habits[indexToDelete];
                     // Вызываем функцию удаления, передавая уникальный ID этой привычки
                     handleDeleteHabit(habitToDelete.id);
                     console.log(`Deleted habit number ${habitNumberToDelete} with ID: ${habitToDelete.id}`);
                 } else {
                     console.warn('Received delete_habit action with invalid or out-of-range number:', habitNumberToDelete);
                     // Возможно, отправить голосовой ответ пользователю: "Извините, привычки с номером {habitNumberToDelete} нет."
                     // assistantRef.current?.sendData({ type: 'tts', value: `Извините, привычки с номером ${habitNumberToDelete} нет.` });
                 }
        // Добавьте здесь другие else if для обработки других action.type, если они будут
      } else {
                 console.warn('Received delete_habit action without a valid number:', event.action);
                 // Возможно, отправить голосовой ответ пользователю: "Извините, я не понял номер привычки, которую нужно удалить."
             }
        }
        // Здесь можно добавить обработку других типов action
      }
      // Здесь можно обрабатывать другие типы событий data, не связанные с action
    });

    // ... остальные обработчики assistant.on

    return () => {
        // Функция очистки при размонтировании
    };

  }, [habits]);


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
            <Route path="/" element={<Home habits={habits}  onDeleteHabit={handleDeleteHabit}/>} />
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
