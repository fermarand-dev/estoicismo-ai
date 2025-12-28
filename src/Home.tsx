import { useEffect, useState } from 'react'
import { salvarReflexao, listarReflexoes, Reflection } from './services/reflections'

export default function Home() {
  const [texto, setTexto] = useState('')
  const [reflexoes, setReflexoes] = useState<Reflection[]>([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [sucesso, setSucesso] = useState(false)

  async function carregarReflexoes() {
    try {
      const data = await listarReflexoes()
      setReflexoes(data)
    } catch (err) {
      console.error(err)
    }
  }

  async function handleSalvar() {
    if (!texto.trim()) return

    setLoading(true)
    setErro(null)
    setSucesso(false)

    try {
      await salvarReflexao(texto)
      setTexto('')
      setSucesso(true)
      await carregarReflexoes()
    } catch (err) {
      setErro('Não foi possível gerar a reflexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarReflexoes()
  }, [])

  return (
    <div
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: '40px 16px',
        color: '#e5e7eb',
      }}
    >
      <h1 style={{ marginBottom: 4 }}>Estoicismo AI</h1>
      <p style={{ opacity: 0.6, marginBottom: 24 }}>
        Sua bússola diária de clareza, disciplina e autodomínio.
      </p>

      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Escreva sua reflexão do dia..."
        style={{
          width: '100%',
          minHeight: 140,
          padding: 16,
          borderRadius: 10,
          border: '1px solid #2a2d33',
          backgroundColor: '#0b0d10',
          color: '#e5e7eb',
          marginBottom: 12,
        }}
      />

      {erro && (
        <p style={{ color: '#f87171', marginBottom: 12 }}>{erro}</p>
      )}

      {sucesso && (
        <p style={{ color: '#34d399', marginBottom: 12 }}>
          Reflexão salva com sucesso 🌱
        </p>
      )}

      <button
        onClick={handleSalvar}
        disabled={loading}
        style={{
          padding: '12px 24px',
          borderRadius: 8,
          border: 'none',
          backgroundColor: '#f59e0b',
          color: '#0b0d10',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Refletindo...' : 'Refletir'}
      </button>

      <hr style={{ margin: '40px 0', borderColor: '#1f2937' }} />

      <h2 style={{ marginBottom: 16 }}>Suas reflexões</h2>

      {reflexoes.length === 0 && (
        <p style={{ opacity: 0.5 }}>Nenhuma reflexão ainda.</p>
      )}

      {reflexoes.map((r) => (
        <div
          key={r.id}
          style={{
            backgroundColor: '#111827',
            padding: 16,
            borderRadius: 10,
            marginBottom: 12,
          }}
        >
          <p style={{ whiteSpace: 'pre-wrap' }}>{r.content}</p>
          <small style={{ opacity: 0.4 }}>
            {new Date(r.created_at).toLocaleString()}
          </small>
        </div>
      ))}
    </div>
  )
}
