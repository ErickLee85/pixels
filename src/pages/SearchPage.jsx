import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import PersonCard from '../components/PersonCard'

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = searchParams.get('q') || ''
  const navigate = useNavigate()
  
  const [results, setResults] = useState({ movies: [], people: [], tv: [] })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('movies')

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [query])

  useEffect(() => {
    async function searchAll() {
      if (!query) {
        setResults({ movies: [], people: [], tv: [] })
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`,
          options
        )
        const data = await res.json()
        console.log('Search Results:', data)

        // Separate results by media type
        const movies = data.results?.filter(item => item.media_type === 'movie') || []
        const people = data.results?.filter(item => item.media_type === 'person') || []
        const tv = data.results?.filter(item => item.media_type === 'tv') || []

        setResults({ movies, people, tv })

        // Set active tab to first non-empty category
        if (movies.length > 0) setActiveTab('movies')
        else if (tv.length > 0) setActiveTab('tv')
        else if (people.length > 0) setActiveTab('people')
      } catch (e) {
        console.error(e.message)
      } finally {
        setLoading(false)
      }
    }

    searchAll()
  }, [query])

  const totalResults = results.movies.length + results.people.length + results.tv.length

  return (
    <div className="search-page">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
        </svg>
      </button>

      {/* Header */}
      <div className="search-header">
        <h1>Search Results</h1>
        <p className="search-query">
          {query ? (
            <>
              Showing results for "<span>{query}</span>"
            </>
          ) : (
            'Enter a search term'
          )}
        </p>
      </div>

      {loading ? (
        <div className="search-loading">
          <div className="loading-spinner"></div>
        </div>
      ) : totalResults === 0 && query ? (
        <div className="search-no-results">
          <svg xmlns="http://www.w3.org/2000/svg" height="80px" viewBox="0 -960 960 960" width="80px" fill="rgba(255,255,255,0.2)">
            <path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/>
          </svg>
          <h2>No results found</h2>
          <p>Try a different search term</p>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="search-tabs">
            {results.movies.length > 0 && (
              <button 
                className={`search-tab ${activeTab === 'movies' ? 'active' : ''}`}
                onClick={() => setActiveTab('movies')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                  <path d="M160-80q-33 0-56.5-23.5T80-160v-640q0-33 23.5-56.5T160-880h640q33 0 56.5 23.5T880-800v640q0 33-23.5 56.5T800-80H160Zm0-80h640v-640H160v640Zm40-40v-200h80v200h-80Zm240 0v-200h80v200h-80Zm240 0v-200h80v200h-80Zm-480-280v-200h80v200h-80Zm240 0v-200h80v200h-80Zm240 0v-200h80v200h-80ZM160-160v-640 640Z"/>
                </svg>
                Movies
                <span className="tab-count">{results.movies.length}</span>
              </button>
            )}
            {results.tv.length > 0 && (
              <button 
                className={`search-tab ${activeTab === 'tv' ? 'active' : ''}`}
                onClick={() => setActiveTab('tv')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                  <path d="M320-120v-80h80v-80H160q-33 0-56.5-23.5T80-360v-400q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v400q0 33-23.5 56.5T800-280H560v80h80v80H320ZM160-360h640v-400H160v400Zm0 0v-400 400Z"/>
                </svg>
                TV Shows
                <span className="tab-count">{results.tv.length}</span>
              </button>
            )}
            {results.people.length > 0 && (
              <button 
                className={`search-tab ${activeTab === 'people' ? 'active' : ''}`}
                onClick={() => setActiveTab('people')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                  <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
                </svg>
                People
                <span className="tab-count">{results.people.length}</span>
              </button>
            )}
          </div>

          {/* Results Grid */}
          <div className="search-results">
            {activeTab === 'movies' && (
              <div className="search-grid movies-grid">
                {results.movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}

            {activeTab === 'tv' && (
              <div className="search-grid tv-grid">
                {results.tv.map(show => (
                  <div 
                    key={show.id} 
                    className="tv-card"
                    onClick={() => navigate(`/tv/${show.id}`)}
                  >
                    <div className="tv-poster">
                      {show.poster_path ? (
                        <img 
                          src={`${TMDB_IMAGE_BASE_URL}w342${show.poster_path}`}
                          alt={show.name}
                        />
                      ) : (
                        <div className="tv-poster-placeholder">
                          <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="rgba(255,255,255,0.2)">
                            <path d="M320-120v-80h80v-80H160q-33 0-56.5-23.5T80-360v-400q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v400q0 33-23.5 56.5T800-280H560v80h80v80H320Z"/>
                          </svg>
                        </div>
                      )}
                      <div className="tv-rating">
                        <svg xmlns="http://www.w3.org/2000/svg" height="12px" viewBox="0 -960 960 960" width="12px" fill="#fbbf24">
                          <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
                        </svg>
                        {show.vote_average?.toFixed(1)}
                      </div>
                    </div>
                    <div className="tv-info">
                      <h3 className="tv-title">{show.name}</h3>
                      <span className="tv-year">
                        {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'TBA'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'people' && (
              <div className="search-grid people-grid">
                {results.people.map(person => (
                  <PersonCard key={person.id} person={person} />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
