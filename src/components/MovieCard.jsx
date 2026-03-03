import { useNavigate } from 'react-router-dom'

export default function MovieCard({movie}) {
    const navigate = useNavigate()
    const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'
    const PLACEHOLDER_IMAGE = '/placeholder.jpg'
    
    const imageUrl = movie.poster_path 
      ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` 
      : PLACEHOLDER_IMAGE
    
    return (
          <div 
            key={movie.id} 
            className="movie-card"
            onClick={() => navigate(`/movie/${movie.id}`)}
          >
            <img 
              src={imageUrl} 
              alt={movie.title}
              onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
            />
            {/* <div className="movie-card-title">
              <h3>Rating: <span>{movie.vote_average.toFixed(1)}</span></h3>
            </div> */}
          </div>
    )
}