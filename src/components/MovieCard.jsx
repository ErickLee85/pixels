import { useNavigate } from 'react-router-dom'

export default function MovieCard({movie}) {
    const navigate = useNavigate()
    const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'
    
    return (
          <div 
            key={movie.id} 
            className="movie-card"
            onClick={() => navigate(`/movie/${movie.id}`)}
          >
            <img 
              src={`${TMDB_IMAGE_BASE_URL}${movie.poster_path}`} 
              alt={movie.title}
            />
            <div className="movie-card-title">
              {/* <h3>{movie.title}</h3> */}
              <h3>Rating: <span>{movie.vote_average.toFixed(1)}</span></h3>
            </div>
          </div>
    )
}