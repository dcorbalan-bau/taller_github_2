import { useEffect, useMemo, useState } from 'react'

const TOKEN_KEY = 'session_access_token'
const USER_KEY = 'session_username'
const LOGIN_PATH = '/login'
const WELCOME_PATH = '/welcome'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

function App() {
  const [currentPath, setCurrentPath] = useState(() => {
    if (window.location.pathname === WELCOME_PATH) {
      return WELCOME_PATH
    }

    return LOGIN_PATH
  })
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY) || '')
  const [savedUsername, setSavedUsername] = useState(
    () => sessionStorage.getItem(USER_KEY) || '',
  )

  const isAuthenticated = Boolean(token)
  const activePath =
    currentPath === WELCOME_PATH && isAuthenticated ? WELCOME_PATH : LOGIN_PATH

  const navigate = (path, replace = false) => {
    const method = replace ? 'replaceState' : 'pushState'
    window.history[method](null, '', path)
    setCurrentPath(path)
  }

  useEffect(() => {
    const onPopState = () => {
      setCurrentPath(window.location.pathname)
    }

    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (window.location.pathname !== activePath) {
      window.history.replaceState(null, '', activePath)
    }
  }, [activePath])

  const title = useMemo(
    () => (activePath === WELCOME_PATH ? 'Bienvenida' : 'Iniciar sesión'),
    [activePath],
  )

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      })

      if (!response.ok) {
        throw new Error('Usuario o contraseña inválidos.')
      }

      const data = await response.json()
      sessionStorage.setItem(TOKEN_KEY, data.access_token)
      sessionStorage.setItem(USER_KEY, username)
      setSavedUsername(username)
      setToken(data.access_token)
      setPassword('')
      navigate(WELCOME_PATH)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    setToken('')
    setSavedUsername('')
    setUsername('')
    setPassword('')
    setError('')
    navigate(LOGIN_PATH)
  }

  const renderLogin = () => (
    <form className="form-card" onSubmit={handleSubmit}>
      <label className="field">
        Usuario
        <input
          autoComplete="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          required
        />
      </label>
      <label className="field">
        Contraseña
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      {error ? <p className="error-message">{error}</p> : null}
      <button type="submit" disabled={loading}>
        {loading ? 'Ingresando...' : 'Ingresar'}
      </button>
    </form>
  )

  const renderWelcome = () => (
    <section className="welcome-card">
      <p className="welcome-text">¡Bienvenido/a, {savedUsername || 'usuario'}!</p>
      <p className="token-state">Sesión activa con token JWT en sessionStorage.</p>
      <button type="button" onClick={handleLogout}>
        Cerrar sesión
      </button>
    </section>
  )

  return (
    <main className="page">
      <header className="header">
        <h1>{title}</h1>
      </header>
      {activePath === WELCOME_PATH ? renderWelcome() : renderLogin()}
    </main>
  )
}

export default App
