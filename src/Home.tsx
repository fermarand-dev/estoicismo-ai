import { supabase } from './supabaseClient'

type HomeProps = {
  user: any
}

export default function Home({ user }: HomeProps) {
  async function logout() {
    await supabase.auth.signOut()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f1115',
        color: '#e5e7eb',
        fontFamily: 'Inter, sans-serif',
        padding: 24,
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 32,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              backgroundColor: '#f59e0b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              color: '#0f1115',
              fontSize: 20,
            }}
          >
            E
          </div>

          <div>
            <h1 style={{ margin: 0 }}>Estoicismo AI</h1>
            <p style={{ margin: 0, opacity: 0.6, fontSize: 13 }}>
              {user.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          style={{
            background: 'transparent',
            border: '1px solid #2a2d33',
            color: '#e5e7eb',
            padding: '8px 12px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Sair
        </button>
      </header>

      {/* Main */}
      <main
        style={{
          maxWidth: 640,
          margin: '0 auto',
          backgroundColor: '#111827',
          padding: 24,
          borderRadius: 16,
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          Bem-vindo ao seu Diário Estoico
        </h2>

        <p style={{ opacity: 0.7 }}>
          Use este espaço para refletir sobre o seu dia, seus desafios
          e como agir com virtude diante das situações.
        </p>

        <textarea
          placeholder="Escreva sua reflexão de hoje..."
          style={{
            width: '100%',
            minHeight: 140,
            marginTop: 16,
            padding: 12,
            borderRadius: 12,
            border: '1px solid #2a2d33',
            backgroundColor: '#0f1115',
            color: '#e5e7eb',
            resize: 'none',
          }}
        />

        <button
          style={{
            marginTop: 16,
            padding: '12px 16px',
            backgroundColor: '#f59e0b',
            border: 'none',
            borderRadius: 12,
            fontWeight: 'bold',
            cursor: 'pointer',
            color: '#0f1115',
          }}
        >
          Refletir
        </button>
      </main>
    </div>
  )
}
