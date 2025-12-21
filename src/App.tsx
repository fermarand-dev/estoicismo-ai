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

        <h1 style={{ fontSize: 28, marginBotto
