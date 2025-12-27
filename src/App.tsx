import { useState } from 'react'
import { supabase } from './supabaseClient'

function App() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      alert('Login realizado com sucesso')
    }

    setLoading(false)
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0b0d10',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#e5e7eb',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ width: 360 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 8 }}>
          Estoicismo AI
        </h1>
        <p style={{ textAlign: 'center', opacity: 0.6, marginBottom: 24 }}>
          A virtude como bússola
        </p>

        <input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />

        {error && (
          <p style={{ color: '#f87171', fontSize: 13 }}>{error}</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          style={buttonStyle}
        >
          {loading ? 'Aguarde...' : 'Entrar agora'}
        </button>

        <div style={{ textAlign: 'center', margin: '16px 0', opacity: 0.4 }}>
          ou
        </div>

        <button
          onClick={loginWithGoogle}
          style={googleButtonStyle}
        >
          Entrar com Google
        </button>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 12,
  marginBottom: 10,
  borderRadius: 8,
  border: '1px solid #2a2d33',
  backgroundColor: '#0b0d10',
  color: '#e5e7eb',
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: 'none',
  backgroundColor: '#f59e0b',
  color: '#0b0d10',
  fontWeight: 'bold',
  cursor: 'pointer',
}

const googleButtonStyle: React.CSSProperties = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: '1px solid #2a2d33',
  backgroundColor: '#0b0d10',
  color: '#e5e7eb',
  cursor: 'pointer',
}

export default App
