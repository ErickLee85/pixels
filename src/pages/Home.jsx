import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import PersonCard from '../components/PersonCard'
import MovieCardSkeleton from '../components/skeletons/MovieCardSkeleton'

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
    } catch(e) {
      console.log(e.message)
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
