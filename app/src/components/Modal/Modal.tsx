import React from 'react';
import styles from './Modal.module.scss';

type ModalProps = {
	children: React.ReactNode;
	onClose: () => void;
};

const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
	return (
		<div className={styles.modalOverlay} onClick={onClose}>
			<div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
				<button className={styles.closeButton} onClick={onClose}>
					&times;
				</button>
				{children}
			</div>
		</div>
	);
};

export default Modal;
