import { useEffect, useRef, useState } from 'react';
import { createAssistant, createSmartappDebugger } from '@salutejs/client';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import AddHabit from './pages/AddHabit/AddHabit';
import Stats from './pages/Stats';
import './styles/App.scss';
import { Habit } from './components/HabitCard';






const initializeAssistant = () => {
  const assistantParams = {
    token: import.meta.env.VITE_SMARTAPP_TOKEN || '',  // Получаем токен из переменных окружения
    initPhrase: 'запусти Трекер_Привычек',
    getState: () => {
      // Здесь возвращаем нужное состояние
      return {
        // Здесь твое состояние или пустой объект
      };
    }
  };

  return createSmartappDebugger(assistantParams); // Отправляем параметры с getState
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
						<Link to="/add" className="nav-link">Добавить</Link>
						<Link to="/stats" className="nav-link">Статистика</Link>
					</div>
				</nav>

				<main className="main-content">
					<Routes>
						<Route path="/" element={<Home habits={habits} />} />
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
						<Route path="/stats" element={<Stats />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
};

export default App;
