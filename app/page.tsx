'use client'

import { useState, FormEvent } from 'react'

type UserType = 'tenant' | 'professional'

export default function LoginPage() {
  const [selectedUserType, setSelectedUserType] = useState<UserType>('tenant')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          role: selectedUserType,
        }),
      })

      const data = await response.json()

      if (data.success && data.token && data.user) {
        // Stocker le token et les infos utilisateur
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        // Rediriger vers le dashboard approprié
        if (selectedUserType === 'tenant') {
          window.location.href = '/tenant/dashboard'
        } else {
          window.location.href = '/professional/dashboard'
        }
      } else {
        setErrorMessage(data.error || 'Identifiants invalides')
      }
    } catch (error) {
      setErrorMessage('Erreur de connexion au serveur')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .container {
          display: flex;
          max-width: 1200px;
          width: 100%;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .left-panel {
          flex: 1;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 60px 40px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .logo {
          font-size: 32px;
          font-weight: bold;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-icon {
          width: 50px;
          height: 50px;
          background: white;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .left-panel h1 {
          font-size: 36px;
          margin-bottom: 20px;
          line-height: 1.2;
        }

        .left-panel p {
          font-size: 18px;
          line-height: 1.6;
          opacity: 0.95;
          margin-bottom: 30px;
        }

        .features {
          list-style: none;
          margin-top: 20px;
        }

        .features li {
          padding: 15px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          gap: 15px;
          font-size: 16px;
        }

        .features li:last-child {
          border-bottom: none;
        }

        .feature-icon {
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .right-panel {
          flex: 1;
          padding: 60px 50px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .right-panel h2 {
          font-size: 28px;
          color: #333;
          margin-bottom: 10px;
        }

        .subtitle {
          color: #666;
          margin-bottom: 40px;
          font-size: 16px;
        }

        .user-type-selector {
          display: flex;
          gap: 15px;
          margin-bottom: 30px;
        }

        .user-type-btn {
          flex: 1;
          padding: 15px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;
          font-size: 16px;
          font-weight: 600;
          color: #666;
        }

        .user-type-btn:hover {
          border-color: #667eea;
          color: #667eea;
        }

        .user-type-btn.active {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-color: #667eea;
          color: white;
        }

        .form-group {
          margin-bottom: 25px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 500;
          font-size: 14px;
        }

        .form-group input {
          width: 100%;
          padding: 15px;
          border: 2px solid #e0e0e0;
          border-radius: 10px;
          font-size: 16px;
          transition: all 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #667eea;
        }

        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          font-size: 14px;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #666;
        }

        .remember-me input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .forgot-password {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .login-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .login-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .login-btn:active {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background-color: #fee;
          border: 1px solid #fcc;
          color: #c33;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          font-size: 14px;
        }

        .signup-link {
          text-align: center;
          margin-top: 25px;
          color: #666;
          font-size: 14px;
        }

        .signup-link a {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .signup-link a:hover {
          text-decoration: underline;
        }

        @media (max-width: 968px) {
          .container {
            flex-direction: column;
          }

          .left-panel {
            padding: 40px 30px;
          }

          .left-panel h1 {
            font-size: 28px;
          }

          .right-panel {
            padding: 40px 30px;
          }

          .features {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .user-type-selector {
            flex-direction: column;
          }

          .logo {
            font-size: 24px;
          }

          .logo-icon {
            width: 40px;
            height: 40px;
            font-size: 24px;
          }
        }
      `}</style>

      <div className="container">
        <div className="left-panel">
          <div className="logo">
            <div className="logo-icon">🏢</div>
            ResidConnect
          </div>
          <h1>Bienvenue sur votre espace résidence</h1>
          <p>La plateforme qui connecte locataires et professionnels pour une gestion simplifiée de votre résidence.</p>
          <ul className="features">
            <li>
              <div className="feature-icon">📢</div>
              <span>Actualités et annonces en temps réel</span>
            </li>
            <li>
              <div className="feature-icon">🔧</div>
              <span>Gestion des demandes de maintenance</span>
            </li>
            <li>
              <div className="feature-icon">💬</div>
              <span>Communication directe avec les gestionnaires</span>
            </li>
            <li>
              <div className="feature-icon">📄</div>
              <span>Documents et informations importants</span>
            </li>
          </ul>
        </div>

        <div className="right-panel">
          <h2>Connexion</h2>
          <p className="subtitle">Accédez à votre espace personnel</p>

          <div className="user-type-selector">
            <button
              className={`user-type-btn ${selectedUserType === 'tenant' ? 'active' : ''}`}
              onClick={() => setSelectedUserType('tenant')}
              type="button"
            >
              👤 Locataire
            </button>
            <button
              className={`user-type-btn ${selectedUserType === 'professional' ? 'active' : ''}`}
              onClick={() => setSelectedUserType('professional')}
              type="button"
            >
              💼 Professionnel
            </button>
          </div>

          <form onSubmit={handleLogin}>
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Adresse e-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="votre@email.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  id="remember"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Se souvenir de moi</span>
              </label>
              <a href="#" className="forgot-password">Mot de passe oublié ?</a>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <div className="signup-link">
            Pas encore de compte ? <a href="/register">Créer un compte</a>
          </div>
        </div>
      </div>
    </>
  )
}
