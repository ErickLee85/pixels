import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Navigation() {
  const navigate = useNavigate()
  const [movieGenres, setMovieGenres] = useState([])
  const [selectedGenre, setSelectedGenre] = useState('')
  const [searchText, setSearchText] = useState('')

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`
    }
  }

  useEffect(() => {
    async function getMovieGenres() {
      try {
        const res = await fetch('https://api.themoviedb.org/3/genre/movie/list', options)
        const data = await res.json()
        setMovieGenres(data.genres)
      } catch (e) {
        console.error(e.message)
      }
    }
    getMovieGenres()
  }, [])

  return (
    <nav className="navigation">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          <span>Vicarious</span>
        </Link>

        <div className="nav-controls">
          <div className="nav-genre-container">
            <select
              value={selectedGenre}
              onChange={(e) => {
                const genreId = e.target.value
                const genre = movieGenres.find(g => g.id.toString() === genreId)
                if (genre) {
                  navigate(`/genre/${genreId}?name=${encodeURIComponent(genre.name)}`)
                  setSelectedGenre('')
                }
              }}
            >
              <option value="" disabled>Genres</option>
              {movieGenres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </div>

          <div className="nav-search-container">
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor" className="search-icon">
              <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
            </svg>
            <input 
              type="text" 
              value={searchText} 
              onChange={e => setSearchText(e.target.value)} 
              placeholder="Search movies..." 
            />
            {searchText.length > 0 && (
              <button className="nav-search-clear" onClick={() => setSearchText('')}>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                  <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
