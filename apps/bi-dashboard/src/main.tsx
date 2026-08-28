import { createRoot } from 'react-dom/client';
import App from './app/App';
import './styles/index.css';

// 引入 mock 服务器（开发环境）
// import './api/mock/index';

createRoot(document.getElementById('root')!).render(<App />);
