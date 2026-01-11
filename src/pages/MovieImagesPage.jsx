import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'

export default function MovieImagesPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const movieTitle = searchParams.get('title') || 'Movie'
  const navigate = useNavigate()
  
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

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => {
    async function fetchImages() {
      try {
        setLoading(true)
        const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/images`, options)
        const data = await res.json()

        // Filter all images for US only
        const usBackdrops = (data.backdrops || []).filter((item) => item.iso_3166_1 === 'US')
        const usLogos = (data.logos || []).filter((item) => item.iso_3166_1 === 'US')
        const usPosters = (data.posters || []).filter((item) => item.iso_3166_1 === 'US')
        const allImages = [...usBackdrops, ...usLogos, ...usPosters]
        console.log('Movie Images...:', { backdrops: usBackdrops, logos: usLogos, posters: usPosters })
        setImages(allImages)
      } catch (e) {
        console.error(e.message)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [id])

  useGSAP(() => {
    if (!loading && images.length > 0) {
      gsap.fromTo('.image-grid-item',
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.5, 
          stagger: 0.03,
          ease: 'power2.out'
        }
      )
    }
  }, [loading, images])

  return (
    <div className="images-page">
      <button className="back-button" onClick={() => navigate(-1)}>
             <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#eaeaeaff"><path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/></svg>
      </button>

      <div className="images-header">
        <h1>{movieTitle}</h1>
        <p className="images-subtitle">{images.length} images</p>
      </div>

      {loading ? (
        <div className="images-loading">
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <div className="images-grid">
          {images.map((image, index) => (
            <div 
              key={`${image.file_path}-${index}`}
              className="image-grid-item"
              onClick={() => setSelectedImage(image)}
            >
              <img 
                src={`${TMDB_IMAGE_BASE_URL}w500${image.file_path}`}
                alt={`${movieTitle} image ${index + 1}`}
                loading="lazy"
              />
            </div>
          ))}
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
