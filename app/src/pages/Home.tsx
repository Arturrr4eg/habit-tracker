import HabitCard, { Habit } from '../components/HabitCard';

// Типизация пропсов для компонента Home
type HomeProps = {
  habits: Habit[];
};

const Home: React.FC<HomeProps> = ({ habits }) => {
  return (
    <div>
      {habits.map((habit, index) => (
        <HabitCard key={index} {...habit} />
      ))}
    </div>
  );
};

export default Home;
