import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import PersonCard from '../components/PersonCard'
import MovieCardSkeleton from '../components/skeletons/MovieCardSkeleton'

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'

export default function Home() {
  const navigate = useNavigate()
  const popularScrollRef = useRef(null)
  const tvScrollRef = useRef(null)
  const [movies, setMovies] = useState([])
  const [popularMovies, setPopularMovies] = useState([])
  const [popularPeople, setPopularPeople] = useState([])
  const [trendingTV, setTrendingTV] = useState([])
  const [loading, setLoading] = useState(false)
  const [featuredMovie, setFeaturedMovie] = useState(null)
  const [featuredTrailer, setFeaturedTrailer] = useState(null)
  
  const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`
      }
    }

  async function popPeople() {
    try {
        const res = await fetch('https://api.themoviedb.org/3/person/popular?language=en-US&page=1', options)
        const data = await res.json();
        console.log('Popular People: ', {popularPeople: data})
        setPopularPeople(data.results)
    } catch(e) {
        console.error(e.message)
    } finally {

    }
  }

  async function popMovies() {
    try {
      const res = await fetch('https://api.themoviedb.org/3/movie/popular?language=en-US&page=1', options)
      const data = await res.json()
      console.log({popularMovies: data.results})
      setPopularMovies(data.results)
    } catch(e) {
      console.log(e.message)
    }
  }

  async function fetchTrendingTV() {
    try {
      const res = await fetch('https://api.themoviedb.org/3/trending/tv/day?language=en-US', options)
      const data = await res.json()
      console.log('Trending TV:', data)
      setTrendingTV(data.results)
    } catch(e) {
      console.error(e.message)
    }
  }

  async function nowPlaying() {
    try {
      const res = await fetch('https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=1', options)
      const data = await res.json()
      console.log(data)
      setMovies(data.results)
      
      // Pick a random movie for the featured section
      if (data.results && data.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * Math.min(10, data.results.length))
        const randomMovie = data.results[randomIndex]
        setFeaturedMovie(randomMovie)
        
        // Fetch trailer for the featured movie
        fetchFeaturedTrailer(randomMovie.id)
      }
    } catch(e) {
      console.log(e.message)
    }
  }

  async function fetchFeaturedTrailer(movieId) {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/videos?language=en-US`, options)
      const data = await res.json()
      console.log('Featured Trailer:', data)
      const videos = data.results || []
      const officialTrailer = videos.find(v => v.type === 'Trailer' && v.official && v.site === 'YouTube')
      const anyTrailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
      const anyVideo = videos.find(v => v.site === 'YouTube')
      setFeaturedTrailer(officialTrailer || anyTrailer || anyVideo || null)
    } catch(e) {
      console.error(e.message)
    }
  }

  useEffect(() => {
    async function getMovies() {
      try {
        setLoading(true)
        await Promise.all([popMovies(), nowPlaying(), popPeople(), fetchTrendingTV()])
      } catch(e) {
        console.error(e.message)
      } finally {
        setLoading(false)
      }
    }

    getMovies()
  }, [])

  return (
    <div className="home-page">
      {/* Featured Movie Hero Section */}
      {featuredMovie && (
        <div className="featured-hero">
          <div 
            className="featured-backdrop"
            style={{ 
              backgroundImage: featuredMovie.backdrop_path 
                ? `url(${TMDB_IMAGE_BASE_URL}original${featuredMovie.backdrop_path})` 
                : 'none' 
            }}
          >
            <div className="featured-backdrop-overlay"></div>
          </div>
          <div className="featured-content">
            <div className="featured-poster" onClick={() => navigate(`/movie/${featuredMovie.id}`)}>
              <img 
                src={featuredMovie.poster_path 
                  ? `${TMDB_IMAGE_BASE_URL}w500${featuredMovie.poster_path}` 
                  : '/placeholder.jpg'
                } 
                alt={featuredMovie.title}
              />
            </div>
            <div className="featured-info">
              <span className="featured-label">Now Playing</span>
              <h1 className="featured-title" onClick={() => navigate(`/movie/${featuredMovie.id}`)}>
                {featuredMovie.title}
              </h1>
              <div className="featured-meta">
                <span className="featured-year">{featuredMovie.release_date?.split('-')[0]}</span>
                <span className="meta-divider">•</span>
                <span className="featured-rating">
                  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#fbbf24">
                    <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
                  </svg>
                  {featuredMovie.vote_average?.toFixed(1)}
                </span>
              </div>
              <p className="featured-overview">{featuredMovie.overview}</p>
              <button className="featured-details-btn" onClick={() => navigate(`/movie/${featuredMovie.id}`)}>
                View Details
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                  <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
                </svg>
              </button>
            </div>
            {featuredTrailer && (
              <div className="featured-trailer">
                <iframe
                  src={`https://www.youtube.com/embed/${featuredTrailer.key}?rel=0`}
                  title={featuredTrailer.name}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* In Theatres Section */}
      <section className="content-section">
        <div className="section-header-fancy" style={{borderBottom:'1px solid rgba(146, 38, 38, 1)'}}>
          <div className="section-title-group">
            <span className="section-icon">
              <svg xmlns="http://www.w3.org/2000/svg" height="36px" viewBox="0 -960 960 960" width="36px" fill="currentColor"><path d="M200-320h400L462-500l-92 120-62-80-108 140Zm-40 160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h480q33 0 56.5 23.5T720-720v180l160-160v440L720-420v180q0 33-23.5 56.5T640-160H160Zm0-80h480v-480H160v480Zm0 0v-480 480Z"/></svg>
            </span>
            <div>
              <h2 className="section-title">In Theatres</h2>
              <p className="section-subtitle">Currently showing in cinemas near you</p>
            </div>
          </div>
          <span className="section-count">{movies.length} films</span>
        </div>
        <div className="movies-grid-modern">
          {loading 
            ? Array.from({ length: 20 }).map((_, index) => (
                <MovieCardSkeleton key={index} />
              ))
            : movies.map((movie, index) => (
                <div className="movie-card-wrapper" key={movie.id} style={{ animationDelay: `${index * 0.05}s` }}>
                  <MovieCard movie={movie} />
                </div>
              ))
          }
        </div>
      </section>

      {/* Popular Films Section */}
      <section className="content-section popular-section">
        <div className="section-header-fancy" style={{borderBottom:'1px solid #9b7925ff'}}>
          <div className="section-title-group">
            <span className="section-icon trending">
              <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="currentColor">
                <path d="M120-120v-80l80-80v160h-80Zm160 0v-240l80-80v320h-80Zm160 0v-320l80 81v239h-80Zm160 0v-239l80-80v319h-80Zm160 0v-400l80-80v480h-80ZM120-327v-113l280-280 160 160 280-280v113L560-447 400-607 120-327Z"/>
              </svg>
            </span>
            <div>
              <h2 className="section-title">Trending Movies</h2>
              <p className="section-subtitle">Most popular films this week</p>
            </div>
          </div>
        </div>
        <div className="horizontal-scroll-modern">
          <button 
            className="scroll-btn scroll-btn-left" 
            onClick={() => popularScrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
            </svg>
          </button>
          <div className="horizontal-scroll-track" ref={popularScrollRef}>
            {loading 
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div className="scroll-card" key={index}>
                    <MovieCardSkeleton />
                  </div>
                ))
              : popularMovies.map((movie, index) => (
                  <div className="scroll-card" key={movie.id}>
                    <span className="rank-badge">{index + 1}</span>
                    <MovieCard movie={movie} />
                  </div>
                ))
            }
          </div>
          <button 
            className="scroll-btn scroll-btn-right" 
            onClick={() => popularScrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Trending TV Shows Section */}
      <section className="content-section tv-section">
        <div className="section-header-fancy" style={{borderBottom:'1px solid #9b7925ff'}}>
          <div className="section-title-group">
            <span className="section-icon tv">
              <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="currentColor">
                <path d="M320-120v-80h80v-80H160q-33 0-56.5-23.5T80-360v-400q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v400q0 33-23.5 56.5T800-280H560v80h80v80H320ZM160-360h640v-400H160v400Zm0 0v-400 400Z"/>
              </svg>
            </span>
            <div>
              <h2 className="section-title">Trending TV Shows</h2>
              <p className="section-subtitle">Binge-worthy series everyone's watching</p>
            </div>
          </div>
        </div>
        <div className="horizontal-scroll-modern">
          <button 
            className="scroll-btn scroll-btn-left" 
            onClick={() => tvScrollRef.current?.scrollBy({ left: -400, behavior: 'smooth' })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
            </svg>
          </button>
          <div className="horizontal-scroll-track" ref={tvScrollRef}>
            {loading 
              ? Array.from({ length: 8 }).map((_, index) => (
                  <div className="scroll-card" key={index}>
                    <MovieCardSkeleton />
                  </div>
                ))
              : trendingTV.map((show, index) => (
                  <div className="scroll-card" key={show.id} onClick={() => navigate(`/tv/${show.id}`)}>
                    <span className="rank-badge">{index + 1}</span>
                    <div className="tv-scroll-card">
                      <div className="tv-scroll-poster">
                        {show.poster_path ? (
                          <img 
                            src={`${TMDB_IMAGE_BASE_URL}w342${show.poster_path}`}
                            alt={show.name}
                          />
                        ) : (
                          <div className="tv-scroll-placeholder">
                            <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="rgba(255,255,255,0.2)">
                              <path d="M320-120v-80h80v-80H160q-33 0-56.5-23.5T80-360v-400q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v400q0 33-23.5 56.5T800-280H560v80h80v80H320Z"/>
                            </svg>
                          </div>
                        )}
                        <div className="tv-scroll-rating">
                          <svg xmlns="http://www.w3.org/2000/svg" height="12px" viewBox="0 -960 960 960" width="12px" fill="#fbbf24">
                            <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
                          </svg>
                          {show.vote_average?.toFixed(1)}
                        </div>
                      </div>
                      {/* <div className="tv-scroll-info">
                        <h3 className="tv-scroll-title">{show.name}</h3>
                        <span className="tv-scroll-year">
                          {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'TBA'}
                        </span>
                      </div> */}
                    </div>
                  </div>
                ))
            }
          </div>
          <button 
            className="scroll-btn scroll-btn-right" 
            onClick={() => tvScrollRef.current?.scrollBy({ left: 400, behavior: 'smooth' })}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </button>
        </div>
      </section>

      {/* Trending People Section */}
      <section className="content-section people-section">
        <div className="section-header-fancy">
          <div className="section-title-group">
            <span className="section-icon people">
              <svg xmlns="http://www.w3.org/2000/svg" height="28px" viewBox="0 -960 960 960" width="28px" fill="currentColor">
                <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113ZM120-240h480v-32q0-11-5.5-20T580-306q-54-27-109-40.5T360-360q-56 0-111 13.5T140-306q-9 5-14.5 14t-5.5 20v32Zm240-320q33 0 56.5-23.5T440-640q0-33-23.5-56.5T360-720q-33 0-56.5 23.5T280-640q0 33 23.5 56.5T360-560Zm0 320Zm0-400Z"/>
              </svg>
            </span>
            <div>
              <h2 className="section-title">Popular Stars</h2>
              <p className="section-subtitle">Actors and creators making waves</p>
            </div>
          </div>
        </div>
        <div className="people-grid-modern">
          {loading 
            ? Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="person-card-skeleton" />
              ))
            : popularPeople.map((person) => (
                <PersonCard person={person} key={person.id} />
              ))
          }
        </div>
      </section>
    </div>
  )
}
