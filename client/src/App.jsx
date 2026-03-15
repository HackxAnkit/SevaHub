import { useState, useEffect } from 'react'

function App() {
  const [message, setMessage] = useState('loading...')

  useEffect(() => {
    fetch('http://localhost:5000/test')
      .then(res => res.json())
      .then(data => setMessage(data.message))
  }, [])

  return <h1>{message}</h1>
}

export default App