import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'

export default function MoviePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  
  const containerRef = useRef(null)
  const backdropRef = useRef(null)
  const contentRef = useRef(null)
  const posterRef = useRef(null)

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`
    }
  }

  useEffect(() => {
    async function fetchMovie() {
      try {
        setLoading(true)
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?language=en-US`, options)
        const data = await res.json()
        console.log(data)
        setMovie(data)
      } catch (e) {
        console.error(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMovie()
  }, [id])

  useGSAP(() => {
    if (!loading && movie) {
      const tl = gsap.timeline()
      
      tl.fromTo(backdropRef.current, 
        { opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out' }
      )
      .fromTo(posterRef.current,
        { opacity: 0, y: 60, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'back.out(1.7)' },
        '-=0.8'
      )
      .fromTo('.movie-info > *',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
        '-=0.5'
      )
    }
  }, [loading, movie])

  function formatRuntime(minutes) {
    const hrs = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hrs}h ${mins}m`
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="movie-page-loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="movie-page-error">
        <h2>Movie not found</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    )
  }

  return (
    <div className="movie-page" ref={containerRef}>
      {/* Backdrop */}
      <div 
        className="movie-backdrop" 
        ref={backdropRef}
        style={{ 
          backgroundImage: movie.backdrop_path 
            ? `url(${TMDB_IMAGE_BASE_URL}original${movie.backdrop_path})` 
            : 'none' 
        }}
      >
        <div className="backdrop-overlay"></div>
      </div>

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate('/')}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#eaeaeaff"><path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/></svg>
      </button>

      {/* Content */}
      <div className="movie-content" ref={contentRef}>
        <div className="movie-poster" ref={posterRef}>
          <img 
            src={movie.poster_path 
              ? `${TMDB_IMAGE_BASE_URL}w500${movie.poster_path}` 
              : '/placeholder.jpg'
            } 
            alt={movie.title}
          />
        </div>

        <div className="movie-info">
          <span className="movie-tagline">{movie.tagline}</span>
          <h1 className="movie-title">{movie.title}</h1>
          
          <div className="movie-meta">
            <span className="movie-year">{movie.release_date?.split('-')[0]}</span>
            <span className="meta-divider">•</span>
            <span className="movie-runtime">{formatRuntime(movie.runtime)}</span>
            <span className="meta-divider">•</span>
            <span className="movie-rating">
              <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#fbbf24">
                <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
              </svg>
              {movie.vote_average?.toFixed(1)}
            </span>
          </div>

          <div className="movie-genres">
            {movie.genres?.map(genre => (
              <span key={genre.id} className="genre-tag">{genre.name}</span>
            ))}
          </div>

          <p className="movie-overview">{movie.overview}</p>

          <div className="movie-details">
            <div className="detail-item">
              <span className="detail-label">Release Date</span>
              <span className="detail-value">{formatDate(movie.release_date)}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Status</span>
              <span className="detail-value">{movie.status}</span>
            </div>
            {movie.budget > 0 && (
              <div className="detail-item">
                <span className="detail-label">Budget</span>
                <span className="detail-value">${movie.budget?.toLocaleString()}</span>
              </div>
            )}
            {movie.revenue > 0 && (
              <div className="detail-item">
                <span className="detail-label">Revenue</span>
                <span className="detail-value">${movie.revenue?.toLocaleString()}</span>
              </div>
            )}
          </div>

          {movie.homepage && (
            <a href={movie.homepage} target="_blank" rel="noopener noreferrer" className="movie-homepage-link">
              Visit Official Site
              <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="currentColor">
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h560v-280h80v280q0 33-23.5 56.5T760-120H200Zm188-212-56-56 372-372H560v-80h280v280h-80v-144L388-332Z"/>
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
