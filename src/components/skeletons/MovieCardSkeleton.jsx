import ContentLoader from 'react-content-loader';
export default function MovieCardSkeleton() {
    return (
        <div className="movie-card-skeleton">
            <ContentLoader
                speed={2}
                width="100%"
                height={340}
                backgroundColor={'#1a1a1a'}
                foregroundColor={'#2a2a2a'}
            >
                {/* Movie poster placeholder */}
                <rect x="0" y="0" rx="12" ry="12" width="100%" height="300" />
                
                {/* Rating bar placeholder */}
              
            </ContentLoader>
        </div>
    )
}