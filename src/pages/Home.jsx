import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import PersonCard from '../components/PersonCard'
import MovieCardSkeleton from '../components/skeletons/MovieCardSkeleton'

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'

export default function Home() {
  const navigate = useNavigate()
  const popularScrollRef = useRef(null)
  const [movies, setMovies] = useState([])
  const [popularMovies, setPopularMovies] = useState([])
  const [popularPeople, setPopularPeople] = useState([])
  const [movieGenres, setMovieGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
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

  async function getMovieGenres() {
    const res = await fetch('https://api.themoviedb.org/3/genre/movie/list', options)
    const data = await res.json()
    setMovieGenres(data.genres)
    console.log('genres: ', data.genres)
  }

  useEffect(() => {
    async function getMovies() {
      try {
        setLoading(true)
        await Promise.all([popMovies(), nowPlaying(), getMovieGenres(), popPeople()])
      } catch(e) {
        console.error(e.message)
      } finally {
        setLoading(false)
      }
    }

    getMovies()
  }, [])

  return (
    <div className="container">
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

      <div className="search-container">
        <h1>In Theatres Now</h1>
        <div className='options-container'>
          <div className="genre-container">
            <select 
              value={selectedGenre} 
              onChange={(e) => {
                const genreId = e.target.value
                const genre = movieGenres.find(g => g.id.toString() === genreId)
                if (genre) {
                  navigate(`/genre/${genreId}?name=${encodeURIComponent(genre.name)}`)
                }
              }}
            >
              <option value="" disabled>Movie Genres</option>
              {movieGenres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>
          <div className="input-container">
            <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder='Search...' />
            {searchText.length > 0 && <button className='search-input-close-btn' onClick={() => setSearchText('')}>
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="rgb(114,114,114)"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
            </button>}
          </div>
        </div>
      </div>
      <div className="movies-grid">
        {loading 
          ? Array.from({ length: 20 }).map((_, index) => (
              <MovieCardSkeleton key={index} />
            ))
          : movies.map(movie => (
              <MovieCard movie={movie} key={movie.id} />
            ))
        }
      </div>
      <div className="section-header"><h1>Popular Films</h1></div>
      <div className="horizontal-scroll-section">
        <button 
          className="scroll-arrow scroll-arrow-left" 
          onClick={() => popularScrollRef.current?.scrollBy({ left: -600, behavior: 'smooth' })}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
          </svg>
        </button>
        <div className="horizontal-scroll" ref={popularScrollRef}>
          {loading 
            ? Array.from({ length: 10 }).map((_, index) => (
                <div className="horizontal-card" key={index}>
                  <MovieCardSkeleton />
                </div>
              ))
            : popularMovies.map(movie => (
                <div className="horizontal-card" key={movie.id}>
                  <MovieCard movie={movie} />
                </div>
              ))
          }
        </div>
        <button 
          className="scroll-arrow scroll-arrow-right" 
          onClick={() => popularScrollRef.current?.scrollBy({ left: 600, behavior: 'smooth' })}
        >
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
          </svg>
        </button>
      </div>
      <div className="search-container"><h1>Trending People</h1></div>
      <div className="people-grid">
        {loading 
          ? Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="person-card-skeleton" />
            ))
          : popularPeople.map(person => (
              <PersonCard person={person} key={person.id} />
            ))
        }
      </div>
    </div>
  )
}
