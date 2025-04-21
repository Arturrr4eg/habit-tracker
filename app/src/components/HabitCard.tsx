import React from 'react';
import styles from './HabitCard.module.scss';

export type Habit = { // Habibi card ahahaha
  title: string;
  duration: number; // в днях
  startTime: string; // формат 'HH:MM'
  endTime: string;
  progress: number; // 0–100
  goal: string;
  icon?: string; // Emoji или SVG путь
  completedToday: boolean;
};

const HabitCard: React.FC<Habit> = ({
  title,
  duration = 21,
  startTime = "19:30",
  endTime = "23:40",
  progress,
  goal = "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Qui esse amet asperiores voluptatum unde et, labore vel animi nam consectetur ipsam quidem itaque nostrum ab sapiente iste neque, nulla sequi.",
  icon = '🔥',
  completedToday,
}) => {
  return (
    <div className={styles.card}>
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

