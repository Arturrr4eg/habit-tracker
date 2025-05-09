import { useEffect, useRef, useState } from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Stats from './pages/Stats';
import './styles/App.scss';
import { Habit } from './components/HabitCard';
import Modal from './components/Modal/Modal';
import AddHabitForm from './pages/AddHabit/AddHabitForm';


const isDev = import.meta.env.MODE === 'development';

const initializeAssistant = () => {
  const getState = () => {
    return {}; // здесь можно потом вставить state, если нужно
  };

  if (isDev) {
    return createSmartappDebugger({
      token: import.meta.env.VITE_SMARTAPP_TOKEN ?? '',
      initPhrase: 'запусти Трекер Привычек',
      getState,
      nativePanel:{
        defaultText: "Поговори со мной братишка"
      }
    });
  } else {
    return createAssistant({ getState });
  }
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
    const assistant = initializeAssistant();
    assistantRef.current = assistant;

    // Обработчик событий от ассистента
    assistant.on('data', (event) => {
      if (event.type === 'smart_app_data' && event.smart_app_data?.type === 'add_habit') {
        const newHabitPayload = event.smart_app_data.payload.title;
        console.log('Добавлена привычка голосом:', newHabitPayload);

        // Проверяем, есть ли в payload название привычки
        if (newHabitPayload && typeof newHabitPayload.title === 'string') {
          // Устанавливаем начальное название в состояние
          setInitialHabitTitle(newHabitPayload.title);
        } else {
            // Если названия нет, очищаем старое (если было)
            setInitialHabitTitle(undefined);
        }

        // Открываем модальное окно
        setShowAddHabitModal(true);

        // ВАЖНО: Само добавление привычки теперь будет происходить через форму в модальном окне,
        // а не напрямую из обработчика ассистента, чтобы пользователь мог дозаполнить поля.
      }
      // Здесь могут быть другие обработчики голосовых команд
    });

    // Очистка при размонтировании компонента}

  }, []); // Пустой массив зависимостей, чтобы эффект выполнился один раз при монтировании



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
            <Route path="/" element={<Home habits={habits} />} />
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
