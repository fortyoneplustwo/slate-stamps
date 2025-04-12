import { useState } from 'react'
import './App.css'
import { Editor } from './components/Editor'
import { useCallback } from 'react'

function App() {
  const [count, setCount] = useState(0)

  const onStampInsert = useCallback(() => {
    return {
      label: count.toString(),
      value: count,
    }
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
      <div style={{ width: '500px' }}>
        <Editor onStampClick={onStampClick} onStampInsert={onStampInsert} />
      </div>
    </>
  )
}

export default App
