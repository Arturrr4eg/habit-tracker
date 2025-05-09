import { useEffect, useRef, useState } from 'react';
import { createAssistant, createSmartappDebugger, AssistantAppState } from '@salutejs/client';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Stats from './pages/Stats';
import './styles/App.scss';
import { Habit } from './components/HabitCard';
import Modal from './components/Modal/Modal';
import AddHabitForm from './pages/AddHabit/AddHabitForm';


const isDev = import.meta.env.MODE === 'development';



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



const handleDeleteHabit = (indexToDelete: number) => {
      console.log('Attempting to delete habit at index:', indexToDelete);
      // Проверяем, что индекс корректен
      if (indexToDelete >= 0 && indexToDelete < habits.length) {
          setHabits(prevHabits => {
              // Создаем новый массив привычек, исключая привычку по указанному индексу
              const newHabits = prevHabits.filter((_, index) => index !== indexToDelete);
              console.log('New habits list after deletion:', newHabits);
              return newHabits;
          });
      } else {
          console.warn('Invalid index for deletion:', indexToDelete);
          // Можно добавить обратную связь пользователю, если индекс некорректен
      }
  };




  // Функции для открытия и закрытия модального окна
  const handleOpenModal = () => setShowAddHabitModal(true);
  const handleCloseModal = () => {
    setShowAddHabitModal(false);
    // Очищаем начальное название при закрытии модального окна
    setInitialHabitTitle(undefined);
  };


  // Обработчик добавления привычки, который также закрывает модальное окно
  const handleAddHabit = (newHabit: Habit) => {
    console.log('Новая привычка вручную:', newHabit);
    setHabits((prev) => [...prev, newHabit]);
    handleCloseModal(); // Закрываем модальное окно после добавления
  };


   useEffect(() => {
    const assistant = initializeAssistant(() => {
        // ... ваша функция getStateForAssistant, возможно пустая если не нужна
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
        // Добавьте здесь другие else if для обработки других action.type, если они будут
      }
      // ... обработка других типов событий, если нужно
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
          <h1 className="navbar-title">🧠 Хабит Трекер</h1>
          <div className="navbar-links">
            <Link to="/" className="nav-link">Главная</Link>
            {/* Изменяем Link на div или button и добавляем onClick */}
            <div className="nav-link" onClick={handleOpenModal} style={{ cursor: 'pointer' }}>
              Добавить
            </div>
            <Link to="/stats" className="nav-link">Статистика</Link>
          </div>
        </nav>

        <main className="main-content">
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
