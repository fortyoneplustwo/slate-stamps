import { useState } from 'react'
import './App.css'
import { Editor } from './components/Editor'
import { useCallback } from 'react'

function App() {
  const [count, setCount] = useState(0)

  const onStampInsert = useCallback(() => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          label: count.toString(),
          value: count,
        })
      }, 2 * 1000)
    })
  }, [count])

  const onStampClick = useCallback((_, value) => {
    console.log(value)
  }, [])


  return (
    <>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
      </div>
      <div>
        <Editor onStampClick={onStampClick} onStampInsert={onStampInsert} />
      </div>
    </>
  )
}

export default App
