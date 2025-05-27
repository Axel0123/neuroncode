import React, { useEffect, useState } from 'react'
import axios from 'axios'

function Dashboard() {
  const [username, setUsername] = useState('')
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (token) {
      axios.get('https://neuroncode.onrender.com/me', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => setUsername(res.data.username))
        .catch(() => setUsername('Invalid token'))
    }
  }, [token])

  return (
    <div>
      <h2 className="text-xl font-semibold">Dashboard</h2>
      {token ? <p>Welcome, {username}!</p> : <p>Please log in first.</p>}
    </div>
  )
}

export default Dashboard