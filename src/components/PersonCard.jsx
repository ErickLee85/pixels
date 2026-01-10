import { useNavigate } from 'react-router-dom'

export default function PersonCard({ person }) {
    const navigate = useNavigate()
    const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500'
    
    // Get the first thing they're known for
    const knownFor = person.known_for?.[0]
    const knownForTitle = knownFor?.title || knownFor?.name || ''
    
    return (
        <div 
            className="person-card"
            onClick={() => navigate(`/person/${person.id}`)}
        >
            <div className="person-image-container">
                {person.profile_path ? (
                    <img 
                        src={`${TMDB_IMAGE_BASE_URL}${person.profile_path}`} 
                        alt={person.name}
                    />
                ) : (
                    <div className="person-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" height="48px" viewBox="0 -960 960 960" width="48px" fill="rgba(255,255,255,0.3)">
                            <path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 15 46.5 43.5T800-272v112H160Z"/>
                        </svg>
                    </div>
                )}
            </div>
            <div className="person-info">
                <h3 className="person-name">{person.name}</h3>
                {/* {knownForTitle && (
                    <span className="person-known-for">{knownForTitle}</span>
                )} */}
            </div>
        </div>
    )
}
