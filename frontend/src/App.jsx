import { useState } from 'react'
import UserRegist from './components/UserRegist';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
      <>
          <div>
              <a href="https://vite.dev" target="_blank">
                  <img src={viteLogo} className="logo" alt="Vite logo"/>
              </a>
              <a href="https://react.dev" target="_blank">
                  <img src={reactLogo} className="logo react" alt="React logo"/>
              </a>
          </div>

          <div className="App">
              <UserRegist/>
          </div>

          <h1>Powered by Vite + React</h1>

      </>
  )
}

export default App
