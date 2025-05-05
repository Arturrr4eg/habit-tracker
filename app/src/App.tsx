import { useEffect, useRef, useState } from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
// Удаляем импорт страницы AddHabit, так как мы будем использовать компонент напрямую
// import AddHabit from './pages/AddHabit/AddHabit';
// Импортируем компонент AddHabit
import AddHabitForm from './pages/AddHabit/AddHabitForm'; // Переименовал импорт, чтобы избежать путаницы
import Stats from './pages/Stats';
import './styles/App.scss';
import { Habit } from './components/HabitCard';
import Modal from './components/Modal/Modal'; // Будем использовать отдельный компонент для модального окна


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

  // Функции для открытия и закрытия модального окна
  const handleOpenModal = () => setShowAddHabitModal(true);
  const handleCloseModal = () => setShowAddHabitModal(false);

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
      if (event.type === 'smart_app_data' && event.smart_app_data?.type === 'ADD_HABIT') {
        const newHabit = event.smart_app_data.payload;
        console.log('Добавлена привычка голосом:', newHabit);

        // Добавляем новую привычку в состояние
        setHabits((prev) => [...prev, newHabit]);
      }
    });
  }, []);



  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <h1 className="navbar-title">🧠 Хабит Трекер</h1>
          <div className="navbar-links">
            <Link to="/" className="nav-link">Главная</Link>
            {/* Изменяем Link на div или button и добавляем onClick */}
            <button type='button' className="nav-link" onClick={handleOpenModal} style={{ cursor: 'pointer' }}>
              Добавить
            </button>
            <Link to="/stats" className="nav-link">Статистика</Link>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home habits={habits} />} />
            {/* Удаляем маршрут /add */}
            {/*
            <Route
              path="/add"
              element={
                <AddHabit
                  onAdd={(habit) => {
                    console.log('Новая привычка вручную:', habit);
                    setHabits((prev) => [...prev, habit]);
                  }}
                />
              }
            />
          */}
            <Route path="/stats" element={<Stats />} />
          </Routes>

          {/* Условное отображение модального окна */}
          {showAddHabitModal && (
            <Modal onClose={handleCloseModal}>
              <AddHabitForm onAdd={handleAddHabit} onClose={handleCloseModal}/>
            </Modal>
          )}

        </main>
      </div>
    </Router>
  );
};

export default App;
