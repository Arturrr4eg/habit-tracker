import HabitCard, { Habit } from '../components/HabitCard';

// Типизация пропсов для компонента Home
type HomeProps = {
  habits: Habit[];
	onDeleteHabit: (id: string) => void;

};

const Home: React.FC<HomeProps> = ({ habits, onDeleteHabit }) => { // Получаем функцию onDeleteHabit из пропсов
  return (
    <div className="home-container"> {/* Обертка для всего контента Home */}
      <h2>Мои привычки</h2> {/* Заголовок списка привычек */}

      {habits.length === 0 ? (
        // Сообщение, если привычек нет
        <p>У вас пока нет привычек. Добавьте первую!</p>
      ) : (
        // Список привычек, если они есть
        <div className="habits-list"> {/* Обертка для списка */}
          {habits.map((habit, index) => (
            // Обертка для номера, карточки и кнопки удаления
            // Используем index как key, так как порядок важен и меняется при удалении
            <div key={index} className="habit-item">
              {/* Выводим порядковый номер привычки (index начинается с 0, поэтому +1) */}
              <span className="habit-number">{index + 1}.</span>

              {/* Отрисовываем карточку привычки, передавая все свойства habit */}
              <HabitCard {...(habit as Omit<Habit, "id">)} />

              {/* Кнопка для удаления привычки */}
              <button
                onClick={() => onDeleteHabit(habit.id)} // При клике вызываем onDeleteHabit с текущим индексом
                className="delete-button" // Класс для стилизации кнопки
                aria-label={`Удалить привычку ${index + 1}: ${habit.title}`} // Атрибут для доступности
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
