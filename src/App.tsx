import { useState } from 'react'

function App() {
  const [mode, setMode] = useState<'login' | 'register'>('login')

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
      <div style={{ textAlign: 'center', width: '100%' }}>
        {/* Logo */}
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            backgroundColor: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            fontWeight: 'bold',
            fontSize: 24,
            color: '#0b0d10',
          }}
        >
          E
        </div>

        <h1 style={{ fontSize: 28, marginBottom: 4 }}>Estoicismo AI</h1>
        <p style={{ opacity: 0.6, marginBottom: 32 }}>
          A virtude como bússola
        </p>

        {/* Card */}
        <div
          style={{
            maxWidth: 360,
            margin: '0 auto',
            background: 'linear-gradient(180deg, #14161a, #0f1115)',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
          }}
        >
          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#0b0d10',
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            <button
              onClick={() => setMode('login')}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 12,
                border: 'none',
                backgroundColor: mode === 'login' ? '#ffffff' : 'transparent',
                color: mode === 'login' ? '#0b0d10' : '#9ca3af',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Entrar
            </button>
            <button
              onClick={() => setMode('register')}
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 12,
                border: 'none',
                backgroundColor:
                  mode === 'register' ? '#ffffff' : 'transparent',
                color: mode === 'register' ? '#0b0d10' : '#9ca3af',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cadastrar
            </button>
          </div>

          {/* Inputs */}
          <input
            type="email"
            placeholder="E-mail"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Senha"
            style={inputStyle}
          />

          {/* Action */}
          <button
            style={{
              width: '100%',
              padding: 14,
              marginTop: 12,
              borderRadius: 12,
              border: 'none',
              backgroundColor: '#ffffff',
              color: '#0b0d10',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {mode === 'login' ? 'Entrar agora' : 'Criar conta'}
          </button>

          {/* Divider */}
          <div
            style={{
              margin: '20px 0',
              fontSize: 12,
              opacity: 0.4,
            }}
          >
            ou rápido com
          </div>

          {/* Google */}
          <button
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 12,
              border: '1px solid #2a2d33',
              backgroundColor: '#0b0d10',
              color: '#e5e7eb',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            ✨ Entrar com Google
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: 12,
  marginBottom: 10,
  borderRadius: 12,
  border: '1px solid #2a2d33',
  backgroundColor: '#0b0d10',
  color: '#e5e7eb',
  outline: 'none',
}

export default App
