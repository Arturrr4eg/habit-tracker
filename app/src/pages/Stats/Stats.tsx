// pages/Stats.tsx
import React from 'react';
import { Habit } from '../../components/HabitCard';
// Возможно, вам потребуются стили для этой страницы
import styles from './Stats.module.scss'; // Пример импорта стилей

// *** Типизация пропсов для компонента Stats ***
type StatsProps = {
    completedHabits: Habit[]; // Список выполненных привычек
};
// *** КОНЕЦ Типизации ***


const Stats: React.FC<StatsProps> = ({ completedHabits }) => { // Получаем список выполненных привычек
    return (
        <div className={styles.statsContainer}>
            <h2>Статистика</h2>

            <h3>Выполненные привычки:</h3>
            {completedHabits.length === 0 ? (
                <p>У вас пока нет выполненных привычек.</p>
            ) : (
                <ul className={styles.completedList}>
                    {completedHabits.map(habit => (
                        // Отображаем каждую выполненную привычку
                        <li key={habit.id} className={styles.completedItem}>
                            <div className={styles.itemHeader}>
                                <span className={styles.icon}>{habit.icon}</span>
                                <span className={styles.title}>{habit.title}</span>
                            </div>
                            <div className={styles.itemDetails}>
                                {/* Отображаем дополнительную информацию */}
                                <div><strong>Цель:</strong> {habit.goal}</div>
                                <div><strong>Срок:</strong> {habit.duration} дней</div>
                                <div><strong>Выполнено:</strong> {habit.progress} дней</div> {/* progress должен быть равен duration */}
                                <div><strong>Время:</strong> {habit.startTime} – {habit.endTime}</div>
                                <div className={styles.completionDate}>
                                    {/* Отображаем дату завершения, если она есть */}
                                    {habit.lastCompletedDate ? `Завершено: ${habit.lastCompletedDate}` : ''}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* Здесь можно добавить другие разделы статистики в будущем */}

        </div>
    );
};

export default Stats;
