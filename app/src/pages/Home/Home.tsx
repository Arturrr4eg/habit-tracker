import HabitCard, { Habit } from '../../components/HabitCard';

type HomeProps = {
	habits: Habit[];
	onDeleteHabit: (id: string) => void;
	onCompleteToday: (id: string) => void;
};

const Home: React.FC<HomeProps> = ({ habits, onDeleteHabit, onCompleteToday }) => {
	// console.log('Home: Rendering with habits:', habits);
	return (
		<div className="home-container">
			<h2>Мои привычки</h2>

			{habits.length === 0 ? (
				<p>У вас пока нет привычек. Добавьте первую!</p>
			) : (
				<div className="habits-list">
					{habits.map((habit) => (
						<div key={habit.id} className="habit-list-item-wrapper">
							<HabitCard
								{...habit}
								onDeleteHabit={onDeleteHabit}
								onCompleteToday={onCompleteToday}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Home;
