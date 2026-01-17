import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('🚀 App starting...');

const rootElement = document.getElementById("root");
console.log('📍 Root element:', rootElement);

if (rootElement) {
  try {
    createRoot(rootElement).render(<App />);
    console.log('✅ App rendered successfully');
  } catch (error) {
    console.error('❌ Error rendering app:', error);
  }
} else {
  console.error('❌ Root element not found!');
}
