import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import MovieCard from '../components/MovieCard'
import MovieCardSkeleton from '../components/skeletons/MovieCardSkeleton'

export default function GenrePage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const genreName = searchParams.get('name') || 'Movies'
  const navigate = useNavigate()
  
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const containerRef = useRef(null)
  const gridRef = useRef(null)

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`
    }
  }

  useEffect(() => {
    async function fetchMoviesByGenre() {
      try {
        setLoading(true)
        const res = await fetch(
          `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=popularity.desc&with_genres=${id}`,
          options
        )
        const data = await res.json()
        console.log('Genre Movies:', data)
        setMovies(data.results || [])
        setTotalPages(data.total_pages || 1)
      } catch (e) {
        console.error(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchMoviesByGenre()
  }, [id, page])

  useGSAP(() => {
    if (!loading && movies.length > 0) {
      gsap.fromTo(gridRef.current?.children || [],
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.5, 
          stagger: 0.05,
          ease: 'power2.out'
        }
      )
    }
  }, [loading, movies])

  return (
    <div className="genre-page" ref={containerRef}>
     <button className="back-button" onClick={() => navigate(-1)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#eaeaeaff"><path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/></svg>
      </button>

      <div className="genre-header">
        <h1>{genreName} Movies</h1>
        <p className="genre-subtitle">Discover popular {genreName.toLowerCase()} films</p>
      </div>

      <div className="movies-grid" ref={gridRef}>
        {loading 
          ? Array.from({ length: 20 }).map((_, index) => (
              <MovieCardSkeleton key={index} />
            ))
          : movies.map(movie => (
              <MovieCard movie={movie} key={movie.id} />
            ))
        }
      </div>

      {!loading && totalPages > 1 && (
        <div className="pagination">
          <button 
            className="pagination-btn"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
              <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
            </svg>
            Previous
          </button>
          <span className="pagination-info">Page {page} of {Math.min(totalPages, 500)}</span>
          <button 
            className="pagination-btn"
            disabled={page >= Math.min(totalPages, 500)}
            onClick={() => setPage(p => p + 1)}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
