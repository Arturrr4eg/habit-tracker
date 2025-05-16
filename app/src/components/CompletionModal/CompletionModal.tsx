import { Habit } from '../HabitCard'; // Импортируем тип Habit
// Возможно, вам потребуются стили для этого компонента
import styles from './CompletionModal.module.scss';

// Типы пропсов для компонента поздравления
type CompletionModalProps = {
    habit: Habit; // Детали выполненной привычки
    onConfirm: () => void; // Функция, вызываемая при подтверждении (перемещения в статистику)
};

const CompletionModal: React.FC<CompletionModalProps> = ({ habit, onConfirm }) => {
    return (
        <div className={styles.completionContainer}>
            <h2>Поздравляем!</h2>
            <p>Вы успешно выполнили привычку:</p>
            {/* Отображаем название и иконку выполненной привычки */}
            <div className={styles.completedHabitInfo}>
                <span className={styles.icon}>{habit.icon}</span>
                <span className={styles.title}>{habit.title}</span>
            </div>
            <p>Отличная работа! 🎉</p>
            {/* Кнопка подтверждения */}
            <button className={styles.confirmButton} onClick={onConfirm}>
                Отлично!
            </button>
        </div>
    );
};

export default CompletionModal;
