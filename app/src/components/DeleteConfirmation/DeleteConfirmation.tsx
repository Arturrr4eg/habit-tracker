import styles from './DeleteConfirmation.module.scss';

type DeleteConfirmationProps = {
	habitTitle: string | null;
	onConfirm: () => void;
	onCancel: () => void;
};

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
	habitTitle,
	onConfirm,
	onCancel,
}) => {
	return (
		<div className={styles.confirmationContainer}>
			<h2>Подтверждение удаления</h2>
			<p>
				Вы уверены, что хотите удалить привычку
				{habitTitle ? <strong> "{habitTitle}"</strong> : ' эту привычку'}?
			</p>
			<div className={styles.buttonGroup}>
				<button className={styles.confirmButton} onClick={onConfirm}>
					Да
				</button>
				<button className={styles.cancelButton} onClick={onCancel}>
					Отмена
				</button>
			</div>
		</div>
	);
};

export default DeleteConfirmation;
