import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { getMyReflections, Reflection } from './services/reflections'

export default function Home() {
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReflections()
  }, [])

  async function loadReflections() {
    try {
      const data = await getMyReflections()
      setReflections(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div style={{ padding: 32, maxWidth: 700, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2>📖 Suas reflexões</h2>
        <button onClick={handleLogout} style={logoutStyle}>
          Sair
        </button>
      </header>

      {loading && <p>Carregando...</p>}

      {!loading && reflections.length === 0 && (
        <p style={{ opacity: 0.6 }}>Você ainda não escreveu nenhuma reflexão.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {reflections.map((item) => (
          <div key={item.id} style={cardStyle}>
            <small style={{ opacity: 0.5 }}>
              {new Date(item.created_at).toLocaleDateString('pt-BR')}
            </small>
            <p style={{ marginTop: 8 }}>{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const cardStyle: React.CSSProperties = {
  backgroundColor: '#111827',
  borderRadius: 12,
  padding: 16,
  border: '1px solid #1f2937',
}

const logoutStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid #374151',
  color: '#e5e7eb',
  padding: '6px 12px',
  borderRadius: 6,
  cursor: 'pointer',
}
