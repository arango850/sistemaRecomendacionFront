import { useState, useEffect } from 'react'
import type { UserRecommendation } from './types'
import './App.css'

const API = `${import.meta.env.VITE_API_URL ?? ''}/recommendations`

function useAllRecommendations() {
  const [data, setData] = useState<UserRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(API)
      .then(r => {
        if (!r.ok) throw new Error(`Error ${r.status}`)
        return r.json() as Promise<UserRecommendation[]>
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return { data, loading, error }
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 4.5 ? 'badge-high' : score >= 4 ? 'badge-mid' : 'badge-low'
  return <span className={`badge ${color}`}>{score.toFixed(4)}</span>
}

function UserCard({ user }: { user: UserRecommendation }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="user-card">
      <button className="user-card-header" onClick={() => setExpanded(e => !e)}>
        <div className="user-card-title">
          <span className="user-id">Usuario #{user.user_id}</span>
          <span className="cluster-badge">Cluster {user.cluster}</span>
        </div>
        <div className="user-card-meta">
          <span className="rec-count">{user.recommendations.length} recomendaciones</span>
          <span className="chevron">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <ol className="rec-list">
          {user.recommendations.map((rec, i) => (
            <li key={rec.movie_id} className="rec-item">
              <span className="rec-rank">#{i + 1}</span>
              <span className="rec-title">{rec.movie_title}</span>
              <ScoreBadge score={rec.score} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function UserDetail({ userId, onBack }: { userId: number; onBack: () => void }) {
  const [user, setUser] = useState<UserRecommendation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`${API}/${userId}`)
      .then(r => {
        if (r.status === 404) throw new Error('Usuario no encontrado')
        if (!r.ok) throw new Error(`Error ${r.status}`)
        return r.json() as Promise<UserRecommendation>
      })
      .then(setUser)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [userId])

  return (
    <div className="detail-view">
      <button className="back-btn" onClick={onBack}>← Volver</button>

      {loading && <p className="status-msg">Cargando…</p>}
      {error && <p className="status-msg error">{error}</p>}

      {user && (
        <>
          <div className="detail-header">
            <h2>Usuario #{user.user_id}</h2>
            <span className="cluster-badge large">Cluster {user.cluster}</span>
          </div>
          <p className="detail-sub">{user.recommendations.length} películas recomendadas</p>
          <ol className="rec-list detailed">
            {user.recommendations.map((rec, i) => (
              <li key={rec.movie_id} className="rec-item">
                <span className="rec-rank">#{i + 1}</span>
                <span className="rec-title">{rec.movie_title}</span>
                <ScoreBadge score={rec.score} />
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}

export default function App() {
  const { data, loading, error } = useAllRecommendations()
  const [search, setSearch] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const id = parseInt(search, 10)
    if (!isNaN(id) && id > 0) setSelectedUserId(id)
  }

  if (selectedUserId !== null) {
    return (
      <div className="app">
        <header className="app-header">
          <h1>Sistema de Recomendación</h1>
          <p className="subtitle">MovieLens · K-Means Clustering</p>
        </header>
        <main className="app-main">
          <UserDetail userId={selectedUserId} onBack={() => setSelectedUserId(null)} />
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Sistema de Recomendación</h1>
        <p className="subtitle">MovieLens · K-Means Clustering</p>
      </header>

      <main className="app-main">
        <form className="search-form" onSubmit={handleSearch}>
          <input
            className="search-input"
            type="number"
            min="1"
            placeholder="Buscar por User ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="search-btn" type="submit">Buscar</button>
        </form>

        {loading && <p className="status-msg">Cargando recomendaciones…</p>}
        {error && <p className="status-msg error">Error al cargar datos: {error}</p>}

        {!loading && !error && (
          <p className="total-count">{data.length} usuarios cargados</p>
        )}

        <div className="user-list">
          {data.map(u => <UserCard key={u.user_id} user={u} />)}
        </div>
      </main>
    </div>
  )
}

