import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Home from './Home'

export default function App() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // login
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  // cadastro
  const [name, setName] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])

  async function handleLogin() {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) setError(error.message)
  }

  async function handleRegister() {
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      return
    }

    if (data.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        name,
        is_premium: false,
      })
    }
  }

  if (loading) {
    return <p style={{ color: '#fff', textAlign: 'center' }}>Carregando...</p>
  }

  if (user) {
    return <Home />
  }

  return (
    <div style={container}>
      <div style={card}>
        <h1>Estoicismo AI</h1>
        <p style={{ opacity: 0.6 }}>
          {isRegister ? 'Criar conta' : 'Entrar'}
        </p>

        {isRegister && (
          <input
            placeholder="Nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={input}
          />
        )}

        <input
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
        />

        {error && <p style={{ color: '#f87171' }}>{error}</p>}

        <button
          onClick={isRegister ? handleRegister : handleLogin}
          style={button}
        >
          {isRegister ? 'Criar conta' : 'Entrar'}
        </button>

        <button
          onClick={() => setIsRegister(!isRegister)}
          style={link}
        >
          {isRegister
            ? 'Já tenho conta'
            : 'Criar uma nova conta'}
        </button>

        <button
          onClick={() =>
            supabase.auth.signInWithOAuth({ provider: 'google' })
          }
          style={google}
        >
          Entrar com Google
        </button>
      </div>
    </div>
  )
}

/* estilos */
const container: React.CSSProperties = {
  minHeight: '100vh',
  background: '#0b0d10',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#e5e7eb',
}

const card: React.CSSProperties = {
  width: 360,
  background: '#111318',
  padding: 24,
  borderRadius: 12,
}

const input: React.CSSProperties = {
  width: '100%',
  padding: 12,
  marginBottom: 10,
  borderRadius: 8,
  border: '1px solid #2a2d33',
  background: '#0b0d10',
  color: '#e5e7eb',
}

const button: React.CSSProperties = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: 'none',
  background: '#f59e0b',
  color: '#000',
  fontWeight: 'bold',
  marginBottom: 10,
  cursor: 'pointer',
}

const link: React.CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#9ca3af',
  cursor: 'pointer',
  marginBottom: 10,
}

const google: React.CSSProperties = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: '1px solid #2a2d33',
  background: '#0b0d10',
  color: '#e5e7eb',
  cursor: 'pointer',
}
