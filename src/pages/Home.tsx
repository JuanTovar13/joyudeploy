import '../styles/home.css'

// Importaciones de iconos desde la nueva carpeta
import burbujaChat from '../assets/home-icons/Burbuja de Chat con Carita.svg'
import caraFrase from '../assets/home-icons/Cara sonriente(frase motivadora).svg'
import enojado from '../assets/home-icons/EnojadoMolesto (AmarilloVerde).svg'
import feliz from '../assets/home-icons/FelizRadiante (MoradoLila).svg'
import iconoCalendario from '../assets/home-icons/icono de Calendario.svg'
import logoJoyuOscuro from '../assets/home-icons/Logo de Joyu oscuro.svg'
import neutral from '../assets/home-icons/NeutralCalmado (Verde claro).svg'
import triste from '../assets/home-icons/TristeCansado (Azul).svg'


import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import type { JoyuItem } from '../types'

export const Home = () => {
  const [joyuItems, setJoyuItems] = useState<JoyuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActivities() {
      const { data, error } = await supabase
        .from('activities')
        .select('*');
      console.log('Supabase data:', data);
      console.log('Supabase error:', error);

      if (error) {
        console.error('Error fetching activities:', error);
      } else {
        setJoyuItems(data || []);
      }
      setLoading(false);
    }

    fetchActivities();
  }, []);

  if (loading) {
    return <div className="home-screen">Loading activities...</div>;
  }
  return (
    <div className="home-screen">
      {/* Contenedor blanco redondeado al fondo */}
      <div className="home-white-background"></div>

      {/* Header Superior */}
      <header className="home-header">
        <div className="user-greeting">
          <h1 className="title-font">Hi, Juanes</h1>
          <p>How are you feeling today?</p>
        </div>
        <img src={logoJoyuOscuro} alt="Joyu Logo" className="home-logo" />
      </header>

      <main className="home-content">
        {/* Sección Izquierda */}
        <div className="home-left-column">
          <section className="check-in-card">
            <h2>Ready to check in?</h2>
            <p>Take this quick test</p>
            <div className="emotions-grid">
              <img src={triste} alt="Triste" />
              <img src={enojado} alt="Enojado" />
              <img src={neutral} alt="Neutral" />
              <img src={feliz} alt="Feliz" />
            </div>
          </section>

          <section className="quote-card">
            <p>Listen to your emotions, take care of your mind, and bloom.</p>
            <img src={caraFrase} alt="Smiley" />
          </section>

        </div>

        {/* Sección Derecha */}
        <div className="home-right-column">
          <section className="activities-card">
            <div className="activities-header">
              <h2>Next recommended activities</h2>
              <button className="view-all">See all</button>
            </div>
            <div className="activities-grid">
{joyuItems.map((item) => (
                <div key={item.id} className="activity-item">
                  <img src={item.image} alt={item.title} />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <section className="home-actions-row">
        <button className="action-card action-card-schedule">
          <span>Schedule Appointment</span>
          <img src={iconoCalendario} alt="Calendar" />
        </button>
        <button className="action-card action-card-see">
          <span>See Appointments</span>
          <img src={burbujaChat} alt="Chat" />
        </button>
      </section>

      {/* Decoración inferior (Colinas) */}
      <div className="decor-hills"></div>
    </div>
  )
}