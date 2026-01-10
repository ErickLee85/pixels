import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'

export default function PersonPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [person, setPerson] = useState(null)
  const [images, setImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  
  const containerRef = useRef(null)
  const imageRef = useRef(null)
  const infoRef = useRef(null)

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`
    }
  }

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    async function fetchPerson() {
      try {
        setLoading(true)
        const res = await fetch(`https://api.themoviedb.org/3/person/${id}?language=en-US`, options)
        const data = await res.json()
        console.log('Person:', data)
        setPerson(data)
      } catch (e) {
        console.error(e.message)
      } finally {
        setLoading(false)
      }
    }

    async function fetchImages() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/person/${id}/images`, options)
        const data = await res.json()
        console.log('Person Images:', data)
        setImages(data.profiles || [])
      } catch (e) {
        console.error(e.message)
      }
    }

    fetchPerson()
    fetchImages()
  }, [id])

  useGSAP(() => {
    if (!loading && person) {
      const tl = gsap.timeline()
      
      tl.fromTo(imageRef.current,
        { opacity: 0, scale: 0.8, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'back.out(1.4)' }
      )
      .fromTo('.person-info > *',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' },
        '-=0.4'
      )
    }
  }, [loading, person])

  function calculateAge(birthday, deathday = null) {
    const birth = new Date(birthday)
    const end = deathday ? new Date(deathday) : new Date()
    let age = end.getFullYear() - birth.getFullYear()
    const monthDiff = end.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  function formatDate(dateString) {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  function getGender(genderCode) {
    switch(genderCode) {
      case 1: return 'Female'
      case 2: return 'Male'
      case 3: return 'Non-binary'
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="person-page-loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!person) {
    return (
      <div className="person-page-error">
        <h2>Person not found</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    )
  }

  return (
    <div className="person-page" ref={containerRef}>
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
        </svg>
      </button>

      <div className="person-content">
        {/* Profile Image Carousel */}
        <div className="person-profile" ref={imageRef}>
          <div className="profile-carousel">
            {images.length > 0 ? (
              <img 
                src={`${TMDB_IMAGE_BASE_URL}w500${images[currentImageIndex].file_path}`} 
                alt={`${person.name} - Photo ${currentImageIndex + 1}`}
                key={currentImageIndex}
              />
            ) : person.profile_path ? (
              <img 
                src={`${TMDB_IMAGE_BASE_URL}w500${person.profile_path}`} 
                alt={person.name}
              />
            ) : (
              <div className="person-profile-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" height="80px" viewBox="0 -960 960 960" width="80px" fill="rgba(255,255,255,0.2)">
                  <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
                </svg>
              </div>
            )}
            
            {/* Carousel Controls */}
            {images.length > 1 && (
              <>
                <button 
                  className="carousel-btn carousel-btn-prev"
                  onClick={() => setCurrentImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
                  </svg>
                </button>
                <button 
                  className="carousel-btn carousel-btn-next"
                  onClick={() => setCurrentImageIndex(prev => prev === images.length - 1 ? 0 : prev + 1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                  </svg>
                </button>
                <div className="carousel-indicators">
                  <span className="carousel-counter">{currentImageIndex + 1} / {images.length}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Person Info */}
        <div className="person-info" ref={infoRef}>
          {/* <span className="person-department-tag">{person.known_for_department}</span> */}
          <h1 className="person-name-title">{person.name}</h1>
          
          <div className="person-meta">
            {person.birthday && (
              <>
                <span className="person-age">
                  {calculateAge(person.birthday, person.deathday)} years old
                  {person.deathday && ' (deceased)'}
                </span>
                <span className="meta-divider">•</span>
              </>
            )}
            {getGender(person.gender) && (
              <span className="person-gender">{getGender(person.gender)}</span>
            )}
            {person.popularity && (
              <>
                <span className="meta-divider">•</span>
                <span className="person-popularity">
                  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#22c55e">
                    <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/>
                  </svg>
                  {person.popularity.toFixed(1)}
                </span>
              </>
            )}
          </div>

          {person.biography && (
            <div className="person-biography">
              <h2>Biography</h2>
              <p>{person.biography}</p>
            </div>
          )}

          <div className="person-details">
            {person.birthday && (
              <div className="detail-item">
                <span className="detail-label">Born</span>
                <span className="detail-value">{formatDate(person.birthday)}</span>
              </div>
            )}
            {person.deathday && (
              <div className="detail-item">
                <span className="detail-label">Died</span>
                <span className="detail-value">{formatDate(person.deathday)}</span>
              </div>
            )}
            {person.place_of_birth && (
              <div className="detail-item">
                <span className="detail-label">Birthplace</span>
                <span className="detail-value">{person.place_of_birth}</span>
              </div>
            )}
          </div>

          {person.also_known_as?.length > 0 && (
            <div className="person-aliases">
              <h3>Also Known As</h3>
              <div className="aliases-list">
                {person.also_known_as.slice(0, 8).map((alias, index) => (
                  <span key={index} className="alias-tag">{alias}</span>
                ))}
              </div>
            </div>
          )}

          {person.imdb_id && (
            <a 
              href={`https://www.imdb.com/name/${person.imdb_id}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="imdb-link"
            >
              <svg viewBox="0 0 64 32" xmlns="http://www.w3.org/2000/svg" width="40" height="20">
                <rect fill="#F5C518" width="64" height="32" rx="4"/>
                <text x="32" y="22" textAnchor="middle" fill="black" fontSize="14" fontWeight="bold" fontFamily="Arial">IMDb</text>
              </svg>
              View on IMDb
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
