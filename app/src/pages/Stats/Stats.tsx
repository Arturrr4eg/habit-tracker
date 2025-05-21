import React from 'react';
import { Habit } from '../../components/HabitCard';

import styles from './Stats.module.scss';

type StatsProps = {
	completedHabits: Habit[];
};

const Stats: React.FC<StatsProps> = ({ completedHabits }) => {
	return (
		<div className={styles.statsContainer}>
			<h2>Статистика</h2>

			<h3>Выполненные привычки:</h3>
			{completedHabits.length === 0 ? (
				<p>У вас пока нет выполненных привычек.</p>
			) : (
				<ul className={styles.completedList}>
					{completedHabits.map((habit) => (
						<li key={habit.id} className={styles.completedItem}>
							<div className={styles.itemHeader}>
								<span className={styles.icon}>{habit.icon}</span>
								<span className={styles.title}>{habit.title}</span>
							</div>
							<div className={styles.itemDetails}>
								<div>
									<strong>Цель:</strong> {habit.goal}
								</div>
								<div>
									<strong>Срок:</strong> {habit.duration} дней
								</div>
								<div>
									<strong>Выполнено:</strong> {habit.progress} дней
								</div>
								<div>
									<strong>Время:</strong> {habit.startTime} – {habit.endTime}
								</div>
								<div className={styles.completionDate}>
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
