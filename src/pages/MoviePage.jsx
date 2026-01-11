import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import MovieCard from '../components/MovieCard'
import MoviePageSkeleton from '../components/skeletons/MoviePageSkeleton'

gsap.registerPlugin(useGSAP)

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'

export default function MoviePage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [trailer, setTrailer] = useState(null)
  const [reviews, setReviews] = useState([])
  const [similarMovies, setSimilarMovies] = useState([])
  const [watchProviders, setWatchProviders] = useState(null)
  const [movieImages, setMovieImages] = useState([])
  const [showTrailer, setShowTrailer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [backdropLoaded, setBackdropLoaded] = useState(false)
  
  const containerRef = useRef(null)
  const backdropRef = useRef(null)
  const contentRef = useRef(null)
  const posterRef = useRef(null)
  const similarScrollRef = useRef(null)

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

    async function fetchVideos() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?language=en-US`, options)
        const data = await res.json()
        console.log('Videos:', data)
        // Find official trailer first, then any trailer, then any YouTube video
        const videos = data.results || []
        const officialTrailer = videos.find(v => v.type === 'Trailer' && v.official && v.site === 'YouTube')
        const anyTrailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
        const anyVideo = videos.find(v => v.site === 'YouTube')
        setTrailer(officialTrailer || anyTrailer || anyVideo || null)
      } catch (e) {
        console.error(e.message)
      }
    }

    async function fetchReviews() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/reviews?language=en-US&page=1`, options)
        const data = await res.json()
        console.log('Reviews:', data)
        setReviews(data.results || [])
      } catch (e) {
        console.error(e.message)
      }
    }

    async function fetchSimilarMovies() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/similar?language=en-US&page=1`, options)
        const data = await res.json()
        console.log('Similar Movies:', data)
        // Filter out movies without poster and limit to 10
        const filtered = (data.results || []).filter(m => m.poster_path).slice(0, 10)
        setSimilarMovies(filtered)
      } catch (e) {
        console.error(e.message)
      }
    }

    async function fetchWatchProviders() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers`, options)
        const data = await res.json()
        console.log('Watch Providers:', data)
        // Get US providers only and combine all into one unique list
        const usData = data.results?.US
        if (usData) {
          const allProviders = [
            ...(usData.flatrate || []),
            ...(usData.rent || []),
            ...(usData.buy || [])
          ]
          // Remove duplicates by provider_id
          const uniqueProviders = allProviders.filter(
            (provider, index, self) => 
              index === self.findIndex(p => p.provider_id === provider.provider_id)
          )
          setWatchProviders({ providers: uniqueProviders, link: usData.link })
        } else {
          setWatchProviders(null)
        }
      } catch (e) {
        console.error(e.message)
      }
    }

    fetchMovie()
    fetchVideos()
    fetchReviews()
    fetchSimilarMovies()
    fetchWatchProviders()
    fetchMovieImages()
  }, [id])

  async function fetchMovieImages() {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/images`, options)
      const data = await res.json()
      console.log('Movie Images:', data)
      // Combine backdrops and posters, prioritize backdrops
      const images = [...(data.backdrops || []), ...(data.posters || [])]
      setMovieImages(images)
    } catch (e) {
      console.error(e.message)
    }
  }

  // Preload backdrop image
  useEffect(() => {
    if (movie?.backdrop_path) {
      const img = new Image()
      img.src = `${TMDB_IMAGE_BASE_URL}original${movie.backdrop_path}`
      img.onload = () => setBackdropLoaded(true)
    } else if (movie) {
      setBackdropLoaded(true)
    }
  }, [movie])

  useGSAP(() => {
    if (!loading && movie && backdropLoaded) {
      const tl = gsap.timeline()
      
      tl.fromTo(backdropRef.current, 
        { opacity: 0, scale: 1.1 },
        { opacity: 1, scale: 1, duration: 1.2 }
      )
      .fromTo(posterRef.current,
        { opacity: 0, y: 60, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        '-=0.8'
      )
      .fromTo('.movie-info > *',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.1},
        '-=0.5'
      )
    }
  }, [loading, movie, backdropLoaded])

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

  function formatReviewDate(dateString) {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months} month${months !== 1 ? 's' : ''} ago`
    } else {
      const years = Math.floor(diffDays / 365)
      return `${years} year${years !== 1 ? 's' : ''} ago`
    }
  }

  function showGenre(genre) {
        if (genre) {
                  navigate(`/genre/${genre.id}?name=${encodeURIComponent(genre.name)}`)
        }
  }

  if (loading || !backdropLoaded) {
    return <MoviePageSkeleton />
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
      <button className="back-button" onClick={() => navigate(-1)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#eaeaeaff"><path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/></svg>
      </button>

      {/* Content */}
      <div className="movie-content" ref={contentRef}>
        <div 
          className="movie-poster" 
          ref={posterRef}
          onClick={() => movieImages.length > 0 && navigate(`/movie/${id}/images?title=${encodeURIComponent(movie.title)}`)}
          style={{ cursor: movieImages.length > 0 ? 'pointer' : 'default' }}
        >
          {movieImages.length > 0 && (
            <div className="poster-gallery-hint">
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z"/>
              </svg>
              <span>{movieImages.length} images</span>
            </div>
          )}
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
              <span key={genre.id} className="genre-tag" onClick={() => showGenre(genre)}>{genre.name}</span>
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

          {/* Watch Providers */}
          {watchProviders && watchProviders.providers?.length > 0 && (
            <div className="watch-providers">
              <h3 className="watch-providers-title">Where to Watch</h3>
              <div className="provider-logos">
                {watchProviders.providers.map(provider => (
                  <a 
                    key={provider.provider_id} 
                    href={watchProviders.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="provider-logo"
                    title={provider.provider_name}
                  >
                    <img 
                      src={`${TMDB_IMAGE_BASE_URL}w92${provider.logo_path}`} 
                      alt={provider.provider_name}
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="movie-actions">
            {trailer && (
              <button className="trailer-button" onClick={() => setShowTrailer(true)}>
               <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m160-800 80 160h120l-80-160h80l80 160h120l-80-160h80l80 160h120l-80-160h120q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800Zm0 240v320h640v-320H160Zm0 0v320-320Z"/></svg>
                Watch Trailer
              </button>
            )}
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

      {/* Similar Movies Section */}
      {similarMovies.length > 0 && (
        <div className="similar-movies-section">
          <div className="similar-movies-container">
            <h2 className="similar-movies-title">
              Similar Movies
            </h2>
            <div className="similar-movies-wrapper">
              <button 
                className="scroll-arrow scroll-arrow-left" 
                onClick={() => similarScrollRef.current?.scrollBy({ left: -600, behavior: 'smooth' })}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                  <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
                </svg>
              </button>
              <div className="similar-movies-scroll" ref={similarScrollRef}>
                {similarMovies.map(movie => (
                  <MovieCard movie={movie} key={movie.id} />
                ))}
              </div>
              <button 
                className="scroll-arrow scroll-arrow-right" 
                onClick={() => similarScrollRef.current?.scrollBy({ left: 600, behavior: 'smooth' })}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                  <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="reviews-section">
          <div className="reviews-container">
            <h2 className="reviews-title">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="M240-400h480v-80H240v80Zm0-120h480v-80H240v80Zm0-120h480v-80H240v80ZM80-80v-720q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H240L80-80Zm126-240h594v-480H160v525l46-45Zm-46 0v-480 480Z"/>
              </svg>
              Reviews ({reviews.length})
            </h2>
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="review-author-avatar">
                      {review.author_details?.avatar_path ? (
                        <img 
                          src={review.author_details.avatar_path.startsWith('/http') 
                            ? review.author_details.avatar_path.slice(1) 
                            : `${TMDB_IMAGE_BASE_URL}w45${review.author_details.avatar_path}`
                          } 
                          alt={review.author}
                        />
                      ) : (
                        <div className="avatar-placeholder">
                          {review.author?.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="review-author-info">
                      <span className="review-author-name">{review.author}</span>
                      <span className="review-date">{formatReviewDate(review.created_at)}</span>
                    </div>
                    {review.author_details?.rating && (
                      <div className="review-rating">
                        <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="#fbbf24">
                          <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
                        </svg>
                        {review.author_details.rating}/10
                      </div>
                    )}
                  </div>
                  <p className="review-content">{review.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trailer Modal */}
      {showTrailer && trailer && (
        <div className="trailer-modal" onClick={() => setShowTrailer(false)}>
          <div className="trailer-modal-content" onClick={e => e.stopPropagation()}>
            <button className="trailer-close-button" onClick={() => setShowTrailer(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
              </svg>
            </button>
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
              title={trailer.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  )
}
