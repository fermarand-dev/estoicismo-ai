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
        padding: 24,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <header style={{ marginBottom: 24 }}>
        <h1>Estoicismo AI</h1>
        <p style={{ opacity: 0.6 }}>{user.email}</p>
      </header>

      <main>
        <p>
          Bem-vindo ao seu espaço de reflexão estoica.
        </p>

        <button
          onClick={logout}
          style={{
            marginTop: 24,
            padding: '10px 14px',
            backgroundColor: '#f59e0b',
            border: 'none',
            borderRadius: 8,
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Sair
        </button>
      </main>
    </div>
  )
}

