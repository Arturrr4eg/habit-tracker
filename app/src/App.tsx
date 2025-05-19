import { useEffect, useRef, useState, useCallback } from 'react';
import {
	createAssistant,
	createSmartappDebugger,
	AssistantAppState,
} from '@salutejs/client';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home/Home';
import Stats from './pages/Stats/Stats';
import './styles/App.scss';
import { Habit } from './components/HabitCard';
import Modal from './components/Modal/Modal';
import AddHabitForm from './pages/AddHabit/AddHabitForm';
import DeleteConfirmation from './components/DeleteConfirmation/DeleteConfirmation';
import CompletionModal from './components/CompletionModal/CompletionModal';


const STORAGE_KEY = 'habitTrackerData';

const loadFromStorage = (): { habits: Habit[] } | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to parse stored data', e);
    return null;
  }
};

const saveToStorage = (habits: Habit[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ habits }));
  } catch (e) {
    console.error('Failed to save data', e);
  }
};

const DEFAULT_HABITS: Habit[] = [
  {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    title: 'Пить воду',
    duration: 21,
    startTime: '07:00',
    endTime: '08:00',
    progress: 7,
    goal: 'Пить 2 литра воды каждый день',
    icon: '💧',
    lastCompletedDate: undefined,
  },
  {
    id: Date.now().toString() + Math.random().toString(16).slice(2),
    title: 'Читать книгу',
    duration: 30,
    startTime: '20:00',
    endTime: '21:00',
    progress: 15,
    goal: 'Прочитать 10 страниц каждый день',
    icon: '📚',
    lastCompletedDate: undefined,
  },
];


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

const initializeAssistant = (getState: () => AssistantAppState, getRecoveryState: () => unknown) => {
	if (isDev) {
		return createSmartappDebugger({
			token: import.meta.env.VITE_SMARTAPP_TOKEN ?? '',
			initPhrase: 'запусти Трекер Привычек',
			getState,
			getRecoveryState,
			nativePanel: {
				defaultText: 'Поговори со мной братишка',
				screenshotMode: false,
				tabIndex: -1,
			},
		});
	}
	return createAssistant({ getState, getRecoveryState });
};

const App = () => {
	const assistantRef = useRef<ReturnType<typeof createAssistant>>();
	const [habits, setHabits] = useState<Habit[]>(() => {
  const savedData = loadFromStorage();
    return savedData?.habits || DEFAULT_HABITS;
  });

	const [completedHabits, setCompletedHabits] = useState<Habit[]>(
		// Фильтруем начальный список, чтобы разделить активные и выполненные
		habits.filter((habit) => habit.progress >= habit.duration),
	);

	const [activeHabits, setActiveHabits] = useState<Habit[]>(
		habits.filter((habit) => habit.progress < habit.duration),
	);



	// Состояние для управления видимостью модального окна
	const [showAddHabitModal, setShowAddHabitModal] = useState(false);
	// Новое состояние для хранения названия привычки от ассистента
	const [initialHabitTitle, setInitialHabitTitle] = useState<string | undefined>(
		undefined,
	);



useEffect(() => {
    saveToStorage(habits);
  }, [habits]);

	const getRecoveryState = useCallback(() => {
    return { habits };
  }, [habits]);

	const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
	const [habitToDeleteId, setHabitToDeleteId] = useState<string | null>(null);
	const [habitToDeleteTitle, setHabitToDeleteTitle] = useState<string | null>(null); // Для отображения названия в модалке

	const [showCompletionModal, setShowCompletionModal] = useState(false);
	const [completedHabitDetails, setCompletedHabitDetails] = useState<Habit | null>(null); // Детали выполненной привычки

	const handleDeleteHabit = useCallback(
		(id: string) => {
			console.log('Requesting deletion confirmation for habit with ID:', id);
			// Используем актуальное состояние activeHabits из замыкания useCallback
			const habit = activeHabits.find((h) => h.id === id);
			if (habit) {
				setHabitToDeleteId(id);
				setHabitToDeleteTitle(habit.title);
				setShowDeleteConfirmationModal(true);
			} else {
				console.warn('Attempted to delete non-existent habit with ID:', id);
			}
		},
		[activeHabits], // Зависит от activeHabits
	);

	const confirmDeleteHabit = (idToDelete: string | null) => {
		if (idToDelete) {
			console.log('Confirming deletion for habit with ID:', idToDelete);
			// Выполняем фактическое удаление
			setHabits((prevHabits) => prevHabits.filter((habit) => habit.id !== idToDelete));
		setActiveHabits((prevActive) => prevActive.filter((habit) => habit.id !== idToDelete));
		setCompletedHabits((prevCompleted) =>
			prevCompleted.filter((habit) => habit.id !== idToDelete),
			);
			// Сбрасываем состояние модального окна
			setHabitToDeleteId(null);
			setHabitToDeleteTitle(null);
			setShowDeleteConfirmationModal(false);
		}
	};

	const cancelDeleteHabit = () => {
		console.log('Deletion cancelled.');
		// Сбрасываем состояние модального окна без удаления
		setHabitToDeleteId(null);
		setHabitToDeleteTitle(null);
		setShowDeleteConfirmationModal(false);
		// Возможно, отправить голосовой ответ пользователю: "Удаление отменено."
	};

	// Функции для открытия и закрытия модального окна
	const handleOpenModal = () => setShowAddHabitModal(true);
	const handleCloseModal = () => {
		setShowAddHabitModal(false);
		// Очищаем начальное название при закрытии модального окна
		setInitialHabitTitle(undefined);
	};

	// Обработчик добавления привычки, который также закрывает модальное окно
	const handleAddHabit = (
		newHabitData: Omit<Habit, 'id' | 'lastCompletedDate'>,
	) => {
		// Создаем полный объект Habit с уникальным ID
		const habitWithId: Habit = {
			...newHabitData,
			id: generateUniqueId(), // Генерируем и присваиваем уникальный ID
			lastCompletedDate: undefined,
		};

		setHabits((prev) => [...prev, habitWithId]);
		handleCloseModal();
	};

	const handleCompleteToday = (idToComplete: string) => {
		console.log('Attempting to mark habit as completed today for ID:', idToComplete);
		const todayString = getTodayDateString();

		setActiveHabits((prevActiveHabits) => {
			// Находим привычку, которую нужно обновить
			const habitToUpdate = prevActiveHabits.find((habit) => habit.id === idToComplete);

			if (!habitToUpdate) {
				console.warn(`Habit with ID ${idToComplete} not found in active habits.`);
				return prevActiveHabits; // Возвращаем список без изменений
			}

			// Только если прогресс меньше длительности
			if (habitToUpdate.progress < habitToUpdate.duration) {
				console.log(
					`Increasing progress and marking date for habit with ID: ${idToComplete}.`,
				);
				const newProgress = habitToUpdate.progress + 1;
				const updatedHabit = {
					...habitToUpdate,
					progress: newProgress, // Увеличиваем прогресс
					lastCompletedDate: todayString, // Записываем сегодняшнюю дату
				};

				// *** ПРОВЕРКА НА ПОЛНОЕ ЗАВЕРШЕНИЕ И АВТОМАТИЧЕСКОЕ ПЕРЕМЕЩЕНИЕ ***
				if (newProgress >= updatedHabit.duration) {
					console.log(
						`Habit with ID ${updatedHabit.id} completed! Moving to completed list.`,
					);

					// *** Добавляем выполненную привычку в список выполненных СРАЗУ ***
					setCompletedHabits((prevCompleted) => [...prevCompleted, updatedHabit]);

					// *** Удаляем выполненную привычку из списка активных СРАЗУ ***
					const newActiveHabits = prevActiveHabits.filter(
						(habit) => habit.id !== idToComplete,
					);

					// *** Сохраняем детали для модалки и показываем модалку (УЖЕ ПОСЛЕ ОБНОВЛЕНИЯ СОСТОЯНИЙ) ***
					setCompletedHabitDetails(updatedHabit); // Сохраняем детали выполненной привычки
					setShowCompletionModal(true); // Показываем модальное окно поздравления

					// Возвращаем НОВЫЙ список активных привычек (без выполненной)
					return newActiveHabits;
				} else {
					// Если цель еще не достигнута, возвращаем обновленную привычку в списке активных
					return prevActiveHabits.map((habit) =>
						habit.id === idToComplete ? updatedHabit : habit,
					);
				}
				// *** КОНЕЦ ПРОВЕРКИ НА ПОЛНОЕ ЗАВЕРШЕНИЕ И АВТОМАТИЧЕСКОЕ ПЕРЕМЕЩЕНИЕ ***
			} else {
				// Если прогресс уже достиг или превысил длительность (хотя кнопка должна быть disabled)
				console.log(
					`Habit with ID ${habitToUpdate.id} has already reached its duration goal.`,
				);
				return prevActiveHabits; // Возвращаем список без изменений
			}
		});
	};
	// *** КОНЕЦ МОДИФИКАЦИИ handleCompleteToday ***

	// *** МОДИФИЦИРОВАНА confirmCompletion - теперь она только закрывает модалку ***
	const confirmCompletion = () => {
		console.log('Completion modal confirmed (habit already moved).');
		// Привычка уже перемещена в handleCompleteToday
		// Просто сбрасываем состояние модального окна поздравления
		setCompletedHabitDetails(null);
		setShowCompletionModal(false);
		// Возможно, отправить голосовой ответ: "Поздравляю с выполнением привычки!"
		// assistantRef.current?.sendData({ type: 'tts', value: `Поздравляю с выполнением привычки "${completedHabitDetails?.title}"!` }); // Пример с голосовым ответом
	};
	// *** КОНЕЦ МОДИФИКАЦИИ confirmCompletion ***

	// *** МОДИФИЦИРОВАНА cancelCompletionModal - теперь она только закрывает модалку ***
	const cancelCompletionModal = () => {
		console.log('Completion modal closed (habit already moved).');
		// Привычка уже перемещена в handleCompleteToday
		// Просто сбрасываем состояние модального окна поздравления
		setCompletedHabitDetails(null);
		setShowCompletionModal(false);
	};

	useEffect(() => {
		const assistant = initializeAssistant(() => {
			// ... ваша функция getStateForAssistant, возможно пустая если не нужна
			return {
				item_selector: {
					items: activeHabits.map((habit, index) => ({
						id: habit.id,
						title: habit.title,
						number: index + 1,
					})),
					ignored_words: ['удалить', 'удали', 'номер', 'привычку'],
				},
			};
		}, getRecoveryState);
		assistantRef.current = assistant;
		/* eslint-disable  @typescript-eslint/no-explicit-any */
		assistant.on('data', (event: any) => {
			// Теперь event может содержать event.action
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
				} else if (event.action.type === 'delete_habit') {
					// Проверяем, что поле id существует и является непустой строкой
					// Тип HandledActions уже подсказывает TypeScript, что у delete_habit есть id// Приводим к типу удаления

					// *** Проверяем наличие и тип поля id ***
					if (typeof event.action.id === 'string' && event.action.id) {
						const habitIdToDelete = event.action.id; // Получаем ID напрямую из action

						console.log('Received delete_habit action for ID:', habitIdToDelete);

						// *** ВЫЗЫВАЕМ handle delete habit НАПРЯМУЮ С ПОЛУЧЕННЫМ ID ***
						// Логика поиска по номеру и индексу больше не нужна, так как бэкенд прислал ID
						handleDeleteHabit(habitIdToDelete);
						console.log(`Requested deletion for habit with ID: ${habitIdToDelete}`);
					} else {
						// Если поле id отсутствует или некорректно пришло от бэкенда
						console.warn(
							'Received delete_habit action without a valid ID:',
							event.action,
						);
						// Возможно, отправить голосовой ответ пользователю: "Извините, я не получил идентификатор привычки, которую нужно удалить."
						// assistantRef.current?.sendData({ type: 'tts', value: "Извините, не удалось определить, какую привычку удалить." });
					}
				}
				// --- КОНЕЦ ИСПРАВЛЕННОЙ Обработки действия удаления привычки по ID ---

				// Здесь можно добавить обработку других типов action
				else if (event.action.type === 'complete_habit_voice') {
					// Используем тип CompleteHabitVoiceAction
					if (
						'id' in event.action &&
						typeof event.action.id === 'string' &&
						event.action.id
					) {
						const habitIdToComplete = event.action.id;
						console.log(
							'Received complete_habit_voice action for ID:',
							habitIdToComplete,
						);
						// Вызываем нашу функцию отметки выполнения
						handleCompleteToday(habitIdToComplete);
					} else {
						console.warn(
							'Received complete_habit_voice action without a valid ID:',
							event.action,
						);
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
	}, [activeHabits, handleDeleteHabit, getRecoveryState]); // Оставляем habits в зависимостях, если getStateForAssistant его использует

useEffect(() => {
    setActiveHabits(habits.filter(habit => habit.progress < habit.duration));
    setCompletedHabits(habits.filter(habit => habit.progress >= habit.duration));
  }, [habits]);

	return (
		<Router>
			<div className="app-container">
				<nav className="navbar">
					<h1 className="navbar-title">🧠 Трекер Привычек</h1>
					<div className="navbar-links">
						<Link to="/" className="nav-link">
							Главная
						</Link>
						{/* Изменяем Link на div или button и добавляем onClick */}
						<Link to="/stats" className="nav-link">
							Статистика
						</Link>
					</div>
				</nav>

				<main className="main-content">
					<button
						className="nav-link"
						onClick={handleOpenModal}
						style={{ cursor: 'pointer' }}
					>
						Добавить привычку
					</button>
					<Routes>
						<Route
							path="/"
							element={
								<Home
									habits={activeHabits}
									onDeleteHabit={handleDeleteHabit}
									onCompleteToday={handleCompleteToday}
								/>
							}
						/>
						<Route path="/stats" element={<Stats completedHabits={completedHabits} />} />
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

					{showDeleteConfirmationModal && (
						<Modal onClose={cancelDeleteHabit}>
							{' '}
							{/* Закрываем модалку при клике вне или на крестик */}
							<DeleteConfirmation
								habitTitle={habitToDeleteTitle} // Передаем название привычки
								onConfirm={() => confirmDeleteHabit(habitToDeleteId)} // Функция для подтверждения
								onCancel={cancelDeleteHabit} // Функция для отмены
							/>
						</Modal>
					)}

					{showCompletionModal &&
						completedHabitDetails && ( // Показываем, только если есть детали выполненной привычки
							<Modal onClose={cancelCompletionModal}>
								{/* Можно закрыть модалку поздравления */}
								<CompletionModal
									habit={completedHabitDetails} // Передаем детали выполненной привычки
									onConfirm={confirmCompletion} // Функция для подтверждения (перемещения в статистику)
									// В этом случае нет кнопки "Отмена", пользователь должен подтвердить
								/>
							</Modal>
						)}
				</main>
			</div>
		</Router>
	);
};

export default App;
