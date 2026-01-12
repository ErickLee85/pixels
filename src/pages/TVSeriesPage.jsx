import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'

export default function TVSeriesPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [series, setSeries] = useState(null)
  const [credits, setCredits] = useState(null)
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedSeason, setExpandedSeason] = useState(null)
  const [seasonEpisodes, setSeasonEpisodes] = useState({})

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
    async function fetchSeries() {
      try {
        setLoading(true)
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}`, options)
        const data = await res.json()
        console.log('TV Series:', data)
        setSeries(data)
      } catch (e) {
        console.error(e.message)
      } finally {
        setLoading(false)
      }
    }

    async function fetchCredits() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/credits`, options)
        const data = await res.json()
        console.log('TV Credits:', data)
        setCredits(data)
      } catch (e) {
        console.error(e.message)
      }
    }

    async function fetchVideos() {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/videos`, options)
        const data = await res.json()
        console.log('TV Videos:', data)
        const trailer = data.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube')
        setVideos(trailer ? [trailer] : data.results?.slice(0, 1) || [])
      } catch (e) {
        console.error(e.message)
      }
    }

    fetchSeries()
    fetchCredits()
    fetchVideos()
  }, [id])

  async function fetchSeasonEpisodes(seasonNumber) {
    if (seasonEpisodes[seasonNumber]) {
      // Already fetched, just toggle
      setExpandedSeason(expandedSeason === seasonNumber ? null : seasonNumber)
      return
    }

    try {
      const res = await fetch(`https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}`, options)
      const data = await res.json()
      console.log(`Season ${seasonNumber}:`, data)
      setSeasonEpisodes(prev => ({ ...prev, [seasonNumber]: data.episodes || [] }))
      setExpandedSeason(seasonNumber)
    } catch (e) {
      console.error(e.message)
    }
  }

  if (loading) {
    return (
      <div className="tv-page-loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!series) {
    return (
      <div className="tv-page-error">
        <h2>Series not found</h2>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    )
  }

  const trailer = videos[0]
  const mainSeasons = series.seasons?.filter(s => s.season_number > 0) || []
  const specials = series.seasons?.find(s => s.season_number === 0)

  return (
    <div className="tv-page">
      {/* Backdrop */}
      <div 
        className="tv-backdrop"
        style={{ 
          backgroundImage: series.backdrop_path 
            ? `url(${TMDB_IMAGE_BASE_URL}original${series.backdrop_path})` 
            : 'none' 
        }}
      >
        <div className="tv-backdrop-overlay"></div>
      </div>

      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
          <path d="M560-240 320-480l240-240 56 56-184 184 184 184-56 56Z"/>
        </svg>
      </button>

      {/* Main Content */}
      <div className="tv-content">
        {/* Poster */}
        <div className="tv-poster">
          {series.poster_path ? (
            <img 
              src={`${TMDB_IMAGE_BASE_URL}w500${series.poster_path}`} 
              alt={series.name}
            />
          ) : (
            <div className="tv-poster-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" height="80px" viewBox="0 -960 960 960" width="80px" fill="rgba(255,255,255,0.2)">
                <path d="M320-120v-80h80v-80H160q-33 0-56.5-23.5T80-360v-400q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v400q0 33-23.5 56.5T800-280H560v80h80v80H320Z"/>
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="tv-info">
          {series.tagline && (
            <p className="tv-tagline">"{series.tagline}"</p>
          )}

          <h1 className="tv-title">{series.name}</h1>

          <div className="tv-meta">
            <span className="tv-year">
              {series.first_air_date ? new Date(series.first_air_date).getFullYear() : 'TBA'}
              {series.last_air_date && series.status === 'Ended' && (
                <> - {new Date(series.last_air_date).getFullYear()}</>
              )}
            </span>
            <span className="tv-separator">•</span>
            <span className="tv-seasons-count">{series.number_of_seasons} Season{series.number_of_seasons !== 1 ? 's' : ''}</span>
            <span className="tv-separator">•</span>
            <span className="tv-episodes-count">{series.number_of_episodes} Episodes</span>
            {series.vote_average > 0 && (
              <>
                <span className="tv-separator">•</span>
                <span className="tv-rating">
                  <svg xmlns="http://www.w3.org/2000/svg" height="16px" viewBox="0 -960 960 960" width="16px" fill="#fbbf24">
                    <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
                  </svg>
                  {series.vote_average.toFixed(1)}
                </span>
              </>
            )}
          </div>

          <div className="tv-status-badge" data-status={series.status?.toLowerCase().replace(' ', '-')}>
            {series.status}
          </div>

          {series.genres?.length > 0 && (
            <div className="tv-genres">
              {series.genres.map(genre => (
                <span key={genre.id} className="tv-genre">{genre.name}</span>
              ))}
            </div>
          )}

          {series.overview && (
            <p className="tv-overview">{series.overview}</p>
          )}

          {/* Networks */}
          {series.networks?.length > 0 && (
            <div className="tv-networks">
              <span className="networks-label">Available on</span>
              <div className="networks-logos">
                {series.networks.map(network => (
                  network.logo_path ? (
                    <img 
                      key={network.id}
                      src={`${TMDB_IMAGE_BASE_URL}w92${network.logo_path}`}
                      alt={network.name}
                      title={network.name}
                    />
                  ) : (
                    <span key={network.id} className="network-name">{network.name}</span>
                  )
                ))}
              </div>
            </div>
          )}

          {/* Created By */}
          {series.created_by?.length > 0 && (
            <div className="tv-creators">
              <span className="creators-label">Created by</span>
              <div className="creators-list">
                {series.created_by.map((creator, index) => (
                  <Link key={creator.id} to={`/person/${creator.id}`} className="creator-link">
                    {creator.name}{index < series.created_by.length - 1 ? ', ' : ''}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Homepage Link */}
          {series.homepage && (
            <a 
              href={series.homepage} 
              target="_blank" 
              rel="noopener noreferrer"
              className="tv-homepage-link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="currentColor">
                <path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z"/>
              </svg>
              Official Website
            </a>
          )}
        </div>
      </div>

      {/* Trailer Section */}
      {trailer && (
        <div className="tv-trailer-section">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/>
            </svg>
            Trailer
          </h2>
          <div className="tv-trailer-container">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}`}
              title={trailer.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* Cast Section */}
      {credits?.cast?.length > 0 && (
        <div className="tv-cast-section">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
              <path d="M40-160v-112q0-34 17.5-62.5T104-378q62-31 126-46.5T360-440q66 0 130 15.5T616-378q29 15 46.5 43.5T680-272v112H40Zm720 0v-120q0-44-24.5-84.5T666-434q51 6 96 20.5t84 35.5q36 20 55 44.5t19 53.5v120H760ZM360-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm400-160q0 66-47 113t-113 47q-11 0-28-2.5t-28-5.5q27-32 41.5-71t14.5-81q0-42-14.5-81T544-792q14-5 28-6.5t28-1.5q66 0 113 47t47 113Z"/>
            </svg>
            Cast
          </h2>
          <div className="tv-cast-scroll">
            {credits.cast.slice(0, 20).map(person => (
              <Link key={person.id} to={`/person/${person.id}`} className="tv-cast-card">
                <div className="cast-photo">
                  {person.profile_path ? (
                    <img 
                      src={`${TMDB_IMAGE_BASE_URL}w185${person.profile_path}`}
                      alt={person.name}
                    />
                  ) : (
                    <div className="cast-photo-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="rgba(255,255,255,0.2)">
                        <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="cast-info">
                  <span className="cast-name">{person.name}</span>
                  <span className="cast-character">{person.character}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Seasons Section */}
      <div className="tv-seasons-section">
        <h2>
          <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
            <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520Z"/>
          </svg>
          Seasons
        </h2>
        
        <div className="seasons-list">
          {mainSeasons.map(season => (
            <div key={season.id} className="season-item">
              <div 
                className="season-header"
                onClick={() => fetchSeasonEpisodes(season.season_number)}
              >
                <div className="season-poster">
                  {season.poster_path ? (
                    <img 
                      src={`${TMDB_IMAGE_BASE_URL}w154${season.poster_path}`}
                      alt={season.name}
                    />
                  ) : (
                    <div className="season-poster-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="rgba(255,255,255,0.2)">
                        <path d="M320-120v-80h80v-80H160q-33 0-56.5-23.5T80-360v-400q0-33 23.5-56.5T160-840h640q33 0 56.5 23.5T880-760v400q0 33-23.5 56.5T800-280H560v80h80v80H320Z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="season-info">
                  <h3>{season.name}</h3>
                  <div className="season-meta">
                    <span>{season.episode_count} Episodes</span>
                    {season.air_date && (
                      <>
                        <span className="meta-dot">•</span>
                        <span>{new Date(season.air_date).getFullYear()}</span>
                      </>
                    )}
                    {season.vote_average > 0 && (
                      <>
                        <span className="meta-dot">•</span>
                        <span className="season-rating">
                          <svg xmlns="http://www.w3.org/2000/svg" height="14px" viewBox="0 -960 960 960" width="14px" fill="#fbbf24">
                            <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
                          </svg>
                          {season.vote_average.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>
                  {season.overview && (
                    <p className="season-overview">{season.overview}</p>
                  )}
                </div>
                <div className={`season-expand-icon ${expandedSeason === season.season_number ? 'expanded' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/>
                  </svg>
                </div>
              </div>

              {/* Episodes List */}
              {expandedSeason === season.season_number && seasonEpisodes[season.season_number] && (
                <div className="episodes-list">
                  {seasonEpisodes[season.season_number].map(episode => (
                    <div key={episode.id} className="episode-item">
                      <div className="episode-still">
                        {episode.still_path ? (
                          <img 
                            src={`${TMDB_IMAGE_BASE_URL}w300${episode.still_path}`}
                            alt={episode.name}
                          />
                        ) : (
                          <div className="episode-still-placeholder">
                            <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="rgba(255,255,255,0.2)">
                              <path d="m380-300 280-180-280-180v360Z"/>
                            </svg>
                          </div>
                        )}
                        <span className="episode-number">E{episode.episode_number}</span>
                      </div>
                      <div className="episode-info">
                        <h4>{episode.name}</h4>
                        <div className="episode-meta">
                          {episode.runtime && <span>{episode.runtime} min</span>}
                          {episode.air_date && (
                            <>
                              {episode.runtime && <span className="meta-dot">•</span>}
                              <span>{new Date(episode.air_date).toLocaleDateString()}</span>
                            </>
                          )}
                          {episode.vote_average > 0 && (
                            <>
                              <span className="meta-dot">•</span>
                              <span className="episode-rating">
                                <svg xmlns="http://www.w3.org/2000/svg" height="12px" viewBox="0 -960 960 960" width="12px" fill="#fbbf24">
                                  <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
                                </svg>
                                {episode.vote_average.toFixed(1)}
                              </span>
                            </>
                          )}
                        </div>
                        {episode.overview && (
                          <p className="episode-overview">{episode.overview}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Specials */}
          {specials && specials.episode_count > 0 && (
            <div className="season-item specials">
              <div 
                className="season-header"
                onClick={() => fetchSeasonEpisodes(0)}
              >
                <div className="season-poster">
                  {specials.poster_path ? (
                    <img 
                      src={`${TMDB_IMAGE_BASE_URL}w154${specials.poster_path}`}
                      alt={specials.name}
                    />
                  ) : (
                    <div className="season-poster-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="rgba(255,255,255,0.2)">
                        <path d="m233-120 65-281L80-590l288-25 112-265 112 265 288 25-218 189 65 281-247-149-247 149Z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="season-info">
                  <h3>{specials.name}</h3>
                  <div className="season-meta">
                    <span>{specials.episode_count} Episodes</span>
                  </div>
                </div>
                <div className={`season-expand-icon ${expandedSeason === 0 ? 'expanded' : ''}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor">
                    <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/>
                  </svg>
                </div>
              </div>

              {expandedSeason === 0 && seasonEpisodes[0] && (
                <div className="episodes-list">
                  {seasonEpisodes[0].slice(0, 20).map(episode => (
                    <div key={episode.id} className="episode-item">
                      <div className="episode-still">
                        {episode.still_path ? (
                          <img 
                            src={`${TMDB_IMAGE_BASE_URL}w300${episode.still_path}`}
                            alt={episode.name}
                          />
                        ) : (
                          <div className="episode-still-placeholder">
                            <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="rgba(255,255,255,0.2)">
                              <path d="m380-300 280-180-280-180v360Z"/>
                            </svg>
                          </div>
                        )}
                        <span className="episode-number">S{episode.episode_number}</span>
                      </div>
                      <div className="episode-info">
                        <h4>{episode.name}</h4>
                        <div className="episode-meta">
                          {episode.runtime && <span>{episode.runtime} min</span>}
                          {episode.air_date && (
                            <>
                              {episode.runtime && <span className="meta-dot">•</span>}
                              <span>{new Date(episode.air_date).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                        {episode.overview && (
                          <p className="episode-overview">{episode.overview}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
