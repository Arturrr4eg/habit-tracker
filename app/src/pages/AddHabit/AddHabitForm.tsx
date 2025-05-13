import { useState, useEffect } from 'react'; // Импортируем useEffect для сброса формы при закрытии модалки
import styles from './AddHabit.module.scss';
import { Habit } from '../../components/HabitCard';

// Добавляем initialTitle в тип пропсов, делаем его необязательным
type AddHabitFormProps = {
  onAdd: (habitData: HabitFormData) => void;
  onClose: () => void;
  initialTitle?: string; // <-- Добавляем сюда, делаем необязательным с помощью '?'
}
type HabitFormData = Omit<Habit, 'id' | 'completedToday'>;

const AddHabitForm: React.FC<AddHabitFormProps> = ({ onAdd, initialTitle }) => {
  // Используем initialTitle для установки начального значения
  const [title, setTitle] = useState(initialTitle || '');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(21);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');
  const [icon, setIcon] = useState('🔥');

  // Эффект для сброса формы, когда модальное окно закрывается (initialTitle становится undefined)
  // Или когда initialTitle меняется извне (например, при новой голосовой команде без закрытия модалки)
  useEffect(() => {
    setTitle(initialTitle || '');
    if (!initialTitle) { // Сбрасываем остальные поля только если initialTitle пустой (т.е. модалка закрылась или открыта вручную)
      setGoal('');
      setDuration(21);
      setStartTime('08:00');
      setEndTime('20:00');
      setIcon('🔥');
    }
  }, [initialTitle]); // Зависимость от initialTitle


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Проверка на пустое название перед добавлением, хотя поле и так required
    if (!title.trim()) {
      alert('Название привычки не может быть пустым');
      return;
    }

    const newHabit = {
      title: title.trim(), // Убираем лишние пробелы
      goal,
      duration,
      startTime,
      endTime,
      progress: 0,
      icon,
      completedToday: false,
    };
    onAdd(newHabit);
    // onClose() вызывается внутри handleAddHabit в App.tsx
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>Добавить привычку</h2>

      <label>
        Название:
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </label>

      <label>
        Цель:
        <input
          type="text"
          value={goal}
          onChange={e => setGoal(e.target.value)}
        />
      </label>

      <label>
        Срок (в днях):
        <input
          type="number"
          value={duration}
          onChange={e => setDuration(Number(e.target.value))}
          min={1}
          max={365}
        />
      </label>

      <label>
        Время начала:
        <input
          type="time"
          value={startTime}
          onChange={e => setStartTime(e.target.value)}
        />
      </label>

      <label>
        Время окончания:
        <input
          type="time"
          value={endTime}
          onChange={e => setEndTime(e.target.value)}
        />
      </label>

      <label>
        Иконка (emoji):
        <input
          type="text"
          value={icon}
          onChange={e => setIcon(e.target.value)}
          maxLength={2}
        />
      </label>

      <button type="submit">Сохранить</button>
    </form>
  );
};

export default AddHabitForm;

