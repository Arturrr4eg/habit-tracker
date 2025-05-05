import React from 'react';
import styles from './Modal.module.scss';

interface ModalProps {
  isOpen: boolean; // Флаг, показывающий, видимо ли модальное окно
  onClose: () => void; // Функция, вызываемая при попытке закрыть окно (клик по фону, кнопка)
  children: React.ReactNode; // Содержимое модального окна
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) {
    return null; // Если окно не открыто, ничего не рендерим
  }

  // При клике на фон модального окна, вызываем onClose
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Убедимся, что клик был именно по оверлею, а не по содержимому внутри
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modalContent}>
        {/* Сюда будет передан компонент AddHabit */}
        {children}
        {/* Опционально можно добавить кнопку закрытия */}
        {/* <button className={styles.closeButton} onClick={onClose}>X</button> */}
      </div>
    </div>
  );
};

export default Modal;
