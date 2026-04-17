import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className="header">
        <h1>Oranum Clone</h1>
        <nav>
          <a href="#">Accueil</a>
          <a href="#">Voyants</a>
          <a href="#">Services</a>
          <a href="#">Connexion</a>
        </nav>
      </div>
      
      <main className="hero-section">
        <h2>Bienvenue sur notre plateforme de voyance</h2>
        <p>Connectez-vous avec nos voyants professionnels</p>
        <button className="cta-button">Commencer maintenant</button>
      </main>

      <section className="features">
        <div className="feature-card">
          <h3>Voyance par Chat</h3>
          <p>Discutez en direct avec nos voyants</p>
        </div>
        <div className="feature-card">
          <h3>Voyance par Téléphone</h3>
          <p>Appelez nos experts 24/7</p>
        </div>
        <div className="feature-card">
          <h3>Voyance par Email</h3>
          <p>Recevez des réponses détaillées</p>
        </div>
      </section>

      <footer>
        <p>&copy; 2024 Oranum Clone - Tous droits réservés</p>
      </footer>
    </>
  )
}

export default App
