import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
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
import myCustomIcon from '/iconxd.png';

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

const initializeAssistant = (
	getState: () => AssistantAppState,
	getRecoveryState: () => unknown,
) => {
	if (isDev) {
		return createSmartappDebugger({
			token: import.meta.env.VITE_SMARTAPP_TOKEN!,
			initPhrase: `Запусти ${import.meta.env.VITE_APP_SMARTAPP}`,
			getState,
			getRecoveryState,
			nativePanel: {
				defaultText: 'Запусти меня!',
				screenshotMode: false,
				tabIndex: -1,
			},
		});
	}
	return createAssistant({ getState, getRecoveryState });
};

const STORAGE_KEY = 'habitTrackerData';

const loadFromStorage = (): { habits: Habit[] } => {
	try {
		const data = localStorage.getItem(STORAGE_KEY);
		if (data) {
			const parsed = JSON.parse(data);
			const habits = parsed.habits.map((habit: Habit) => ({
				...habit,
				lastCompletedDate: habit.lastCompletedDate ? habit.lastCompletedDate : undefined,
			}));
			return { habits };
		}
	} catch (e) {
		console.error('Failed to load data', e);
	}
	return { habits: DEFAULT_HABITS };
};

const saveToStorage = (allHabits: Habit[]) => {
	try {
		const data = {
			habits: allHabits,
			savedAt: new Date().toISOString(),
		};
		localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
	} catch (e) {
		console.error('Failed to save data', e);
	}
};

const App = () => {
	const assistantRef = useRef<ReturnType<typeof createAssistant>>();
	const [allHabits, setAllHabits] = useState<Habit[]>(() => {
		const { habits } = loadFromStorage();
		return habits;
	});

	// Производные состояния
	const activeHabits = useMemo(
		() => allHabits.filter((habit) => habit.progress < habit.duration),
		[allHabits],
	);

	const completedHabits = useMemo(
		() => allHabits.filter((habit) => habit.progress >= habit.duration),
		[allHabits],
	);

	useEffect(() => {
		saveToStorage(allHabits);
	}, [allHabits]);

	// Состояние для управления видимостью модального окна
	const [showAddHabitModal, setShowAddHabitModal] = useState(false);
	// Новое состояние для хранения названия привычки от ассистента
	const [initialHabitTitle, setInitialHabitTitle] = useState<string | undefined>(
		undefined,
	);
	const getRecoveryState = useCallback(() => {
		return { allHabits };
	}, [allHabits]);

	const [showDeleteConfirmationModal, setShowDeleteConfirmationModal] = useState(false);
	const [habitToDeleteId, setHabitToDeleteId] = useState<string | null>(null);
	const [habitToDeleteTitle, setHabitToDeleteTitle] = useState<string | null>(null); // Для отображения названия в модалке

	const [showCompletionModal, setShowCompletionModal] = useState(false);
	const [completedHabitDetails, setCompletedHabitDetails] = useState<Habit | null>(null); // Детали выполненной привычки

	const handleDeleteHabit = useCallback(
		(id: string) => {
			console.log('Requesting deletion confirmation for habit with ID:', id);
			const habit = activeHabits.find((h) => h.id === id);
			if (habit) {
				setHabitToDeleteId(id);
				setHabitToDeleteTitle(habit.title);
				setShowDeleteConfirmationModal(true);
			} else {
				console.warn('Attempted to delete non-existent habit with ID:', id);
			}
		},
		[activeHabits],
	);

	const confirmDeleteHabit = (idToDelete: string | null) => {
		if (idToDelete) {
			console.log('Confirming deletion for habit with ID:', idToDelete);
			setAllHabits((prev) => prev.filter((h) => h.id !== idToDelete));
			setHabitToDeleteId(null);
			setHabitToDeleteTitle(null);
			setShowDeleteConfirmationModal(false);
		}
	};

	const cancelDeleteHabit = () => {
		console.log('Deletion cancelled.');
		setHabitToDeleteId(null);
		setHabitToDeleteTitle(null);
		setShowDeleteConfirmationModal(false);
	};

	const handleOpenModal = () => setShowAddHabitModal(true);
	const handleCloseModal = () => {
		setShowAddHabitModal(false);
		setInitialHabitTitle(undefined);
	};

	const handleAddHabit = (newHabitData: Omit<Habit, 'id' | 'lastCompletedDate'>) => {
		const habitWithId: Habit = {
			...newHabitData,
			id: generateUniqueId(),
			lastCompletedDate: undefined,
		};

		setAllHabits((prev) => [...prev, habitWithId]);
		handleCloseModal();
	};

	const handleCompleteToday = (idToComplete: string) => {
		console.log('Attempting to mark habit as completed today for ID:', idToComplete);
		const todayString = getTodayDateString();

		setAllHabits((prevHabits) => {
			const habitToUpdate = prevHabits.find((habit) => habit.id === idToComplete);

			if (!habitToUpdate) {
				console.warn(`Habit with ID ${idToComplete} not found.`);
				return prevHabits;
			}

			if (habitToUpdate.progress < habitToUpdate.duration) {
				const newProgress = habitToUpdate.progress + 1;
				const updatedHabit = {
					...habitToUpdate,
					progress: newProgress,
					lastCompletedDate: todayString,
				};

				if (newProgress >= updatedHabit.duration) {
					console.log(`Habit with ID ${updatedHabit.id} completed!`);

					setCompletedHabitDetails(updatedHabit);
					setShowCompletionModal(true);
				}

				return prevHabits.map((habit) =>
					habit.id === idToComplete ? updatedHabit : habit,
				);
			}

			console.log(`Habit with ID ${habitToUpdate.id} already completed.`);
			return prevHabits;
		});
	};

	const confirmCompletion = () => {
		console.log('Completion modal confirmed (habit already moved).');

		setCompletedHabitDetails(null);
		setShowCompletionModal(false);
	};

	const cancelCompletionModal = () => {
		console.log('Completion modal closed (habit already moved).');

		setCompletedHabitDetails(null);
		setShowCompletionModal(false);
	};

	useEffect(() => {
		const assistant = initializeAssistant(() => {
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
			console.log('assistant.on(data)', event);

			if (event.action) {
				console.log('Assistant action received:', event.action);

				if (event.action.type === 'add_habit' && typeof event.action.title === 'string') {
					const habitTitleFromAssistant = event.action.title;
					console.log('Название привычки от ассистента:', habitTitleFromAssistant);

					setInitialHabitTitle(habitTitleFromAssistant);

					setShowAddHabitModal(true);
				} else if (event.action.type === 'delete_habit') {
					if (typeof event.action.id === 'string' && event.action.id) {
						const habitIdToDelete = event.action.id;
						console.log('Received delete_habit action for ID:', habitIdToDelete);
						handleDeleteHabit(habitIdToDelete);
						console.log(`Requested deletion for habit with ID: ${habitIdToDelete}`);
					} else {
						console.warn(
							'Received delete_habit action without a valid ID:',
							event.action,
						);
					}
				} else if (event.action.type === 'complete_habit_voice') {
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
						handleCompleteToday(habitIdToComplete);
					} else {
						console.warn(
							'Received complete_habit_voice action without a valid ID:',
							event.action,
						);
					}
				}
			}
		});

		return () => {};
	}, [activeHabits, handleDeleteHabit, getRecoveryState]); // Оставляем habits в зависимостях, если getStateForAssistant его использует

	return (
		<Router>
			<div className="app-container">
				<nav className="navbar">
					<h1 className="navbar-title">
						<img src={myCustomIcon} alt="Моя иконка" className="navbar-icon" />
						Трекер Привычек
					</h1>
					<div className="navbar-links">
						<Link to="/" className="nav-link">
							Главная
						</Link>
						<Link to="/stats" className="nav-link">
							Статистика
						</Link>
					</div>
				</nav>

				<main className="main-content">
					<button onClick={handleOpenModal} style={{ cursor: 'pointer' }}>
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

					{showAddHabitModal && (
						<Modal onClose={handleCloseModal}>
							<AddHabitForm
								onAdd={handleAddHabit}
								onClose={handleCloseModal}
								initialTitle={initialHabitTitle}
							/>
						</Modal>
					)}

					{showDeleteConfirmationModal && (
						<Modal onClose={cancelDeleteHabit}>
							{' '}
							<DeleteConfirmation
								habitTitle={habitToDeleteTitle}
								onConfirm={() => confirmDeleteHabit(habitToDeleteId)}
								onCancel={cancelDeleteHabit}
							/>
						</Modal>
					)}

					{showCompletionModal && completedHabitDetails && (
						<Modal onClose={cancelCompletionModal}>
							<CompletionModal
								habit={completedHabitDetails}
								onConfirm={confirmCompletion}
							/>
						</Modal>
					)}
				</main>
			</div>
		</Router>
	);
};

export default App;
