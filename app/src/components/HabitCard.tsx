import styles from './HabitCard.module.scss';

export type Habit = { // Habibi card ahahaha
	id: string;
  title: string;
  duration: number; // в днях
  startTime: string; // формат 'HH:MM'
  endTime: string;
  progress: number; // 0–100
  goal: string;
  icon?: string; // Emoji или SVG путь
  completedToday: boolean;
};
type HabitCardProps = Habit & {
    onDeleteHabit: (id: string) => void; // Функция для удаления
};

const HabitCard: React.FC<HabitCardProps> = ({
	id,
	onDeleteHabit,
  title = "wiwiw",
  duration = 21,
  startTime = "19:30",
  endTime = "23:40",
  progress = 50,
  goal = "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Qui esse amet asperiores voluptatum unde et, labore vel animi nam consectetur ipsam quidem itaque nostrum ab sapiente iste neque, nulla sequi.",
  icon = '🔥',
  completedToday = false,
}) => {
  return (

    <div className={styles.card}>
      {/* *** КНОПКА УДАЛЕНИЯ ВНУТРИ КАРТОЧКИ *** */}
      <button
        onClick={() => onDeleteHabit(id)} // Вызываем onDeleteHabit с id этой привычки
        className={styles.deleteButton} // Класс для стилизации (определим в SCSS)
        aria-label={`Удалить привычку: ${title}`} // Доступное описание кнопки
      >
        &times; {/* Символ крестика */}
      </button>
      {/* *** КОНЕЦ КНОПКИ УДАЛЕНИЯ *** */}

      <div className={styles.header}>
        <span className={styles.icon}>{icon}</span>
        <h3 className={styles.title}>{title}</h3>
      </div>

      <div className={styles.meta}>
        <div><strong>Цель:</strong> {goal}</div>
        <div><strong>Срок:</strong> {duration} дней</div>
        <div><strong>Время:</strong> {startTime} – {endTime}</div>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progress}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className={styles.progressText}>Прогресс: {progress}%</div>

      <div className={`${styles.status} ${completedToday ? styles.done : styles.missed}`}>
        {completedToday ? 'Выполнено сегодня' : 'Не выполнено'}
      </div>
    </div>
  );
};

export default HabitCard;

