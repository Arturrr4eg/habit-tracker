import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import  App  from './App.tsx';
import './styles/index.css';
import './styles/variables.scss';
import './styles/normalize.scss';
import './styles/class-names.scss';


createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>,
);
