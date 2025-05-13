import HabitCard, { Habit } from '../../components/HabitCard';

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
          {habits.map((habit) => (
            // Обертка для номера, карточки и кнопки удаления
            // Используем index как key, так как порядок важен и меняется при удалении
            <div key={habit.id} className="habit-list-item-wrapper">
              <HabitCard
                 {...habit} // Передаем все поля habit, включая id
                 onDeleteHabit={onDeleteHabit} // Передаем функцию удаления
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
