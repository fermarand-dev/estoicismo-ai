import { useState } from 'react'

function App() {
  const [reflection, setReflection] = useState('')

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f1115',
        color: '#e2e8f0',
        padding: '24px',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>
        Estoicismo AI
      </h1>

      <p style={{ opacity: 0.8, marginBottom: '24px' }}>
        Sua bússola diária de clareza, disciplina e autodomínio.
      </p>

      <textarea
        placeholder="Escreva sua reflexão do dia…"
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        style={{
          width: '100%',
          minHeight: '150px',
          padding: '12px',
          backgroundColor: '#111827',
          color: '#e5e7eb',
          border: '1px solid #374151',
          borderRadius: '8px',
          resize: 'none',
        }}
      />

      <button
        style={{
          marginTop: '16px',
          padding: '12px 16px',
          backgroundColor: '#f59e0b',
          color: '#0f1115',
          border: 'none',
          borderRadius: '8px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        Refletir
      </button>
    </div>
  )
}

export default App
