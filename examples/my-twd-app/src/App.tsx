import { useState } from 'react'
import viteLogo from '/vite.svg'
import './App.css'
import Jokes from './Jokes'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save
        </p>
      </div>
      <Jokes />
      <form>
        <label htmlFor="simple-input">Enter text:</label>
        <input
          type="text"
          id="simple-input"
          name="simple-input"
        />
      </form>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
