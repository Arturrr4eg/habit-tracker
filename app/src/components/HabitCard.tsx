import styles from './HabitCard.module.scss';

export type Habit = {
	id: string;
	title: string;
	duration: number;
	startTime: string;
	endTime: string;
	progress: number;
	goal: string;
	icon?: string;
	lastCompletedDate?: string;
};
type HabitCardProps = Omit<Habit, 'completedToday'> & {
	onDeleteHabit: (id: string) => void;
	onCompleteToday: (id: string) => void;
};

const HabitCard: React.FC<HabitCardProps> = ({
	id,
	onDeleteHabit,
	onCompleteToday,
	title = 'wiwiw',
	duration = 21,
	startTime = '19:30',
	endTime = '23:40',
	progress = 7,
	goal = 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Qui esse amet asperiores voluptatum unde et, labore vel animi nam consectetur ipsam quidem itaque nostrum ab sapiente iste neque, nulla sequi.',
	icon = '🔥',

	lastCompletedDate,
}) => {
	const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

	const isCompleted = progress >= duration;

	const displayLastCompletedDate = lastCompletedDate
		? `Последнее выполнение: ${lastCompletedDate}`
		: 'Еще не выполнялась';

	return (
		<div className={styles.card}>
			<button
				onClick={() => onDeleteHabit(id)}
				className={styles.deleteButton}
				aria-label={`Удалить привычку: ${title}`}
			>
				&times;
			</button>

			<div className={styles.header}>
				<span className={styles.icon}>{icon}</span>
				<h3 className={styles.title}>{title}</h3>
			</div>

			<div className={styles.meta}>
				<div>
					<strong>Цель:</strong> {goal}
				</div>
				<div>
					<strong>Срок:</strong> {duration} дней
				</div>
				<div>
					<strong>Время:</strong> {startTime} – {endTime}
				</div>
			</div>
			<div className={styles.lastCompletedDate}>{displayLastCompletedDate}</div>

			<div className={styles.progressBar}>
				<div className={styles.progress} style={{ width: `${progressPercent}%` }} />
			</div>
			<div className={styles.progressText}>Прогресс: {Math.round(progressPercent)}%</div>

			<button
				onClick={() => {
					if (!isCompleted) {
						onCompleteToday(id);
					}
				}}
				className={styles.completeButton}
				disabled={isCompleted}
				aria-label={isCompleted ? 'Цель достигнута' : 'Отметить выполнение сегодня'}
			>
				{isCompleted ? 'Цель достигнута!' : 'Выполнить сегодня'}
			</button>
		</div>
	);
};

export default HabitCard;
