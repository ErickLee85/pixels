import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import MovieCard from '../components/MovieCard'
import CollectionPageSkeleton from '../components/skeletons/CollectionPageSkeleton'

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'

export default function CollectionPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [collection, setCollection] = useState(null)
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      authorization: `Bearer ${import.meta.env.VITE_TMDB_READ_ACCESS_TOKEN}`
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    async function fetchCollection() {
      try {
        setLoading(true)
        const res = await fetch(`https://api.themoviedb.org/3/collection/${id}`, options)
        const data = await res.json()
        console.log('Collection:', data)
        // Sort parts by release date
        if (data.parts) {
          data.parts.sort((a, b) => new Date(a.release_date) - new Date(b.release_date))
        }
        setCollection(data)
      } catch (e) {
        console.error(e.message)
      } finally {
        setLoading(false)
      }
    }

    async function fetchImages() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/collection/${id}/images`, options)
        const data = await res.json()
        console.log('Collection Images:', data)
        setImages(data.backdrops || [])
      } catch (e) {
        console.error(e.message)
      }
    }

    fetchCollection()
    fetchImages()
  }, [id])

  if (loading) {
    return <CollectionPageSkeleton />
  }

  if (!collection) {
    return (
      <div className="collection-page-error">
        <h2>Collection not found</h2>
        <button onClick={() => navigate('/')}>Go Back</button>
      </div>
    )
  }

  // Calculate collection stats
  const totalMovies = collection.parts?.length || 0
  const releasedMovies = collection.parts?.filter(m => new Date(m.release_date) <= new Date()).length || 0
  const avgRating = collection.parts?.length 
    ? (collection.parts.reduce((sum, m) => sum + (m.vote_average || 0), 0) / collection.parts.length).toFixed(1)
    : 0

  return (
    <div className="collection-page">
      {/* Backdrop */}
      <div 
        className="collection-backdrop"
        style={{ 
          backgroundImage: collection.backdrop_path 
            ? `url(${TMDB_IMAGE_BASE_URL}original${collection.backdrop_path})` 
            : 'none' 
        }}
      >
        <div className="collection-backdrop-overlay"></div>
      </div>

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
        </svg>
      </button>

      {/* Header */}
      <div className="collection-header">
        <div className="collection-poster">
          {collection.poster_path ? (
            <img 
              src={`${TMDB_IMAGE_BASE_URL}w500${collection.poster_path}`} 
              alt={collection.name}
            />
          ) : (
            <div className="collection-poster-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" height="80px" viewBox="0 -960 960 960" width="80px" fill="rgba(255,255,255,0.2)">
                <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Z"/>
              </svg>
            </div>
          )}
        </div>

        <div className="collection-info">
          <span className="collection-label">Collection</span>
          <h1 className="collection-title">{collection.name}</h1>
          
          <div className="collection-stats">
            <div className="stat-item">
              <span className="stat-value">{totalMovies}</span>
              <span className="stat-label">Films</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">{releasedMovies}</span>
              <span className="stat-label">Released</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">
                <svg xmlns="http://www.w3.org/2000/svg" height="18px" viewBox="0 -960 960 960" width="18px" fill="#fbbf24">
                  <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
                </svg>
                {avgRating}
              </span>
              <span className="stat-label">Avg Rating</span>
            </div>
          </div>

          {collection.overview && (
            <p className="collection-overview">{collection.overview}</p>
          )}
        </div>
      </div>

      {/* Movies Grid */}
      <div className="collection-movies">
        <div className="collection-movies-header">
          <h2>Films in this Collection</h2>
        </div>
        <div className="collection-movies-grid">
          {collection.parts?.map((movie, index) => (
            <div className="collection-movie-item" key={movie.id}>
              <span className="movie-number">{index + 1}</span>
              <MovieCard movie={movie} />
              <div className="movie-release-year">
                {movie.release_date ? new Date(movie.release_date).getFullYear() : 'TBA'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collection Images Gallery */}
      {images.length > 0 && (
        <div className="collection-gallery">
          <div className="collection-gallery-header">
            <h2>Gallery</h2>
            <span className="gallery-count">{images.length} images</span>
          </div>
          <div className="collection-gallery-grid">
            {images.slice(0, 12).map((image, index) => (
              <div 
                className="gallery-image" 
                key={index}
                onClick={() => setSelectedImage(image)}
              >
                <img 
                  src={`${TMDB_IMAGE_BASE_URL}w780${image.file_path}`} 
                  alt={`${collection.name} backdrop ${index + 1}`}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="lightbox-modal" onClick={() => setSelectedImage(null)}>
          <button className="lightbox-close" onClick={() => setSelectedImage(null)}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/>
            </svg>
          </button>
          <img 
            src={`${TMDB_IMAGE_BASE_URL}original${selectedImage.file_path}`}
            alt="Enlarged view"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
