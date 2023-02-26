import './app.css'
import App from './App.svelte'

let app;

try {
  app = new App({
    target: document.getElementById('app'),
  })
} catch (error) {
  console.error(error);
  localStorage.clear();
  app = new App({
    target: document.getElementById('app'),
  })
}

export default app
