import { useState, useEffect } from 'react';
import styles from './AddHabit.module.scss';
import { Habit } from '../../components/HabitCard';

type AddHabitFormProps = {
	onAdd: (habitData: HabitFormData) => void;
	onClose: () => void;
	initialTitle?: string;
};
type HabitFormData = Omit<Habit, 'id' | 'completedToday' | 'lastCompletedDate'>;

const AddHabitForm: React.FC<AddHabitFormProps> = ({ onAdd, initialTitle }) => {
	const [title, setTitle] = useState(initialTitle || '');
	const [goal, setGoal] = useState('');
	const [duration, setDuration] = useState(21);
	const [startTime, setStartTime] = useState('08:00');
	const [endTime, setEndTime] = useState('20:00');
	const [icon, setIcon] = useState('🔥');


	const setVH = () => {
	const vh = window.innerHeight * 0.01;
	document.documentElement.style.setProperty("--vh", `${vh}px`);
};

useEffect(() => {
	setVH();
	window.addEventListener("resize", setVH);

	return () => window.removeEventListener("resize", setVH);
}, []);

	useEffect(() => {
		setTitle(initialTitle || '');
		if (!initialTitle) {
			setGoal('');
			setDuration(21);
			setStartTime('08:00');
			setEndTime('20:00');
			setIcon('🔥');
		}
	}, [initialTitle]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) {
			alert('Название привычки не может быть пустым');
			return;
		}

		const newHabitData: HabitFormData = {
			title: title.trim(),
			goal,
			duration,
			startTime,
			endTime,
			progress: 0,
			icon,
		};

		onAdd(newHabitData);
	};

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<h2>Добавить привычку</h2>

			<label>
				Название:
				<input
					type="text"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					required
				/>
			</label>

			<label>
				Цель:
				<input type="text" value={goal} onChange={(e) => setGoal(e.target.value)} />
			</label>

			<label>
				Срок (в днях):
				<input
					type="number"
					value={duration}
					onChange={(e) => setDuration(Number(e.target.value))}
					min={1}
					max={365}
				/>
			</label>

			<label>
				Время начала:
				<input
					type="time"
					value={startTime}
					onChange={(e) => setStartTime(e.target.value)}
				/>
			</label>

			<label>
				Время окончания:
				<input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
			</label>

			<label>
				Иконка (emoji):
				<input
					type="text"
					value={icon}
					onChange={(e) => setIcon(e.target.value)}
					maxLength={2}
				/>
			</label>

			<button type="submit">Сохранить</button>
		</form>
	);
};

export default AddHabitForm;
