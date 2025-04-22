import { useState } from 'react';
import styles from './AddHabit.module.scss';
import { Habit } from '../../components/HabitCard';

const AddHabit = ({ onAdd }: { onAdd: (habit: Habit) => void }) => {
  const [title, setTitle] = useState('');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(21);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('20:00');
  const [icon, setIcon] = useState('🔥');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newHabit = {
      title,
      goal,
      duration,
      startTime,
      endTime,
      progress: 0,
      icon,
      completedToday: false,
    };
    onAdd(newHabit);
    // сброс формы
    setTitle('');
    setGoal('');
    setDuration(21);
    setStartTime('08:00');
    setEndTime('20:00');
    setIcon('🔥');
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

export default AddHabit;
