// components/DeleteConfirmation/DeleteConfirmation.tsx
// Возможно, вам потребуются стили для этого компонента
import styles from './DeleteConfirmation.module.scss';

// Типы пропсов для компонента подтверждения
type DeleteConfirmationProps = {
    habitTitle: string | null; // Название привычки для отображения в сообщении
    onConfirm: () => void; // Функция, вызываемая при подтверждении
    onCancel: () => void; // Функция, вызываемая при отмене
};

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ habitTitle, onConfirm, onCancel }) => {
    return (
        <div className={styles.confirmationContainer}>
            <h2>Подтверждение удаления</h2>
            <p>
                Вы уверены, что хотите удалить привычку
                {habitTitle ? <strong> "{habitTitle}"</strong> : " эту привычку"}?
            </p>
            <div className={styles.buttonGroup}>
                {/* Кнопка подтверждения */}
                <button className={styles.confirmButton} onClick={onConfirm}>
                    Да
                </button>
                {/* Кнопка отмены */}
                <button className={styles.cancelButton} onClick={onCancel}>
                    Отмена
                </button>
            </div>
        </div>
    );
};

export default DeleteConfirmation;
