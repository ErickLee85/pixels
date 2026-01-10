import { useState, useEffect, useRef, useCallback } from 'react'
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
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  
  const containerRef = useRef(null)
  const gridRef = useRef(null)
  const sentinelRef = useRef(null)
  const newMoviesStartIndex = useRef(0)

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

  // Initial load
  useEffect(() => {
    async function fetchMoviesByGenre() {
      try {
        setLoading(true)
        setMovies([])
        setPage(1)
        const res = await fetch(
          `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${id}`,
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
  }, [id])

  // Load more function
  const loadMoreMovies = useCallback(async () => {
    if (loadingMore || page >= Math.min(totalPages, 500)) return
    
    try {
      setLoadingMore(true)
      newMoviesStartIndex.current = movies.length
      const nextPage = page + 1
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${nextPage}&sort_by=popularity.desc&with_genres=${id}`,
        options
      )
      const data = await res.json()
      console.log('More Genre Movies:', data)
      setMovies(prev => [...prev, ...(data.results || [])])
      setPage(nextPage)
    } catch (e) {
      console.error(e.message)
    } finally {
      setLoadingMore(false)
    }
  }, [loadingMore, page, totalPages, movies.length, id])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && !loadingMore && page < Math.min(totalPages, 500)) {
          loadMoreMovies()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [loading, loadingMore, page, totalPages, loadMoreMovies])

  // Animate initial load
  useGSAP(() => {
    if (!loading && movies.length > 0 && !loadingMore) {
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
  }, [loading])

  // Animate newly loaded movies
  useEffect(() => {
    if (!loadingMore && movies.length > 0 && newMoviesStartIndex.current > 0) {
      const gridChildren = gridRef.current?.children
      if (gridChildren) {
        const newItems = Array.from(gridChildren).slice(newMoviesStartIndex.current)
        gsap.fromTo(newItems,
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
    }
  }, [movies.length, loadingMore])

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
        {loadingMore && Array.from({ length: 20 }).map((_, index) => (
          <MovieCardSkeleton key={`loading-${index}`} />
        ))}
      </div>

      {/* Sentinel element for infinite scroll */}
      {!loading && page < Math.min(totalPages, 500) && (
        <div ref={sentinelRef} className="scroll-sentinel" />
      )}
    </div>
  )
}