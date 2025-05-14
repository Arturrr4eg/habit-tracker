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
  //completedToday: boolean;
	lastCompletedDate?: string;
};
type HabitCardProps = Omit<Habit, 'completedToday'> & {
    onDeleteHabit: (id: string) => void; // Функция для удаления
    onCompleteToday: (id: string) => void; // *** ИЗМЕНЕНО: Функция для отметки выполнения сегодня ***
};

const HabitCard: React.FC<HabitCardProps> = ({
	id,
	onDeleteHabit,
	onCompleteToday,
  title = "wiwiw",
  duration = 21,
  startTime = "19:30",
  endTime = "23:40",
  progress = 7,
  goal = "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Qui esse amet asperiores voluptatum unde et, labore vel animi nam consectetur ipsam quidem itaque nostrum ab sapiente iste neque, nulla sequi.",
  icon = '🔥',
  // completedToday больше не получаем
  lastCompletedDate, // *** Получаем дату последнего выполнения ***
}) => {

	const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

  // Проверяем, достигнут ли прогресс цели
  const isCompleted = progress >= duration;

	const displayLastCompletedDate = lastCompletedDate ?
    `Последнее выполнение: ${lastCompletedDate}` :
    'Еще не выполнялась';

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
			<div className={styles.lastCompletedDate}>{displayLastCompletedDate}</div>

      <div className={styles.progressBar}>
        <div
          className={styles.progress}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <div className={styles.progressText}>Прогресс: {Math.round(progressPercent)}%</div>

			<button
          onClick={() => {
              // Вызываем onCompleteToday только если прогресс не достиг цели
              if (!isCompleted) {
                  onCompleteToday(id);
              }
          }}
          // Добавляем класс для стилизации и состояние disabled
          className={styles.completeButton}
          disabled={isCompleted} // Кнопка отключена, если прогресс достиг цели
          aria-label={isCompleted ? 'Цель достигнута' : 'Отметить выполнение сегодня'}
      >
        {isCompleted ? 'Цель достигнута!' : 'Выполнить сегодня'}
      </button>
    </div>
  );
};

export default HabitCard;

