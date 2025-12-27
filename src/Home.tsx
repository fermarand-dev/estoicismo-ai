import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import {
  getMyReflections,
  createReflection,
  Reflection,
} from './services/reflections'

export default function Home() {
  const [reflections, setReflections] = useState<Reflection[]>([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadReflections()
  }, [])

  async function loadReflections() {
    setLoading(true)
    const data = await getMyReflections()
    setReflections(data)
    setLoading(false)
  }

  async function handleSave() {
    if (!content.trim()) return

    try {
      setSaving(true)
      await createReflection(content)
      setContent('')
      await loadReflections()
    } catch (err) {
      alert('Erro ao salvar reflexão')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div style={{ padding: 32, maxWidth: 700, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2>📖 Diário Estoico</h2>
        <button onClick={handleLogout} style={logoutStyle}>
          Sair
        </button>
      </header>

      <textarea
        placeholder="Escreva sua reflexão do dia..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={textareaStyle}
      />

      <button
        onClick={handleSave}
        disabled={saving}
        style={buttonStyle}
      >
        {saving ? 'Salvando...' : 'Salvar reflexão'}
      </button>

      <hr style={{ margin: '32px 0', opacity: 0.2 }} />

      {loading && <p>Carregando...</p>}

      {!loading && reflections.length === 0 && (
        <p style={{ opacity: 0.6 }}>Nenhuma reflexão ainda.</p>
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

const textareaStyle: React.CSSProperties = {
  width: '100%',
  minHeight: 120,
  padding: 12,
  borderRadius: 12,
  border: '1px solid #1f2937',
  backgroundColor: '#020617',
  color: '#e5e7eb',
  marginBottom: 12,
}

const buttonStyle: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: 8,
  border: 'none',
  backgroundColor: '#f59e0b',
  color: '#020617',
  fontWeight: 'bold',
  cursor: 'pointer',
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
