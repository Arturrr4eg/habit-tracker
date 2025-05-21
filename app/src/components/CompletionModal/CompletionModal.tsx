import { Habit } from '../HabitCard';
import styles from './CompletionModal.module.scss';

type CompletionModalProps = {
	habit: Habit;
	onConfirm: () => void;
};

const CompletionModal: React.FC<CompletionModalProps> = ({ habit, onConfirm }) => {
	return (
		<div className={styles.completionContainer}>
			<h2>Поздравляем!</h2>
			<p>Вы успешно выполнили привычку:</p>

			<div className={styles.completedHabitInfo}>
				<span className={styles.icon}>{habit.icon}</span>
				<span className={styles.title}>{habit.title}</span>
			</div>
			<p>Отличная работа! 🎉</p>
			<button className={styles.confirmButton} onClick={onConfirm}>
				Отлично!
			</button>
		</div>
	);
};

export default CompletionModal;
