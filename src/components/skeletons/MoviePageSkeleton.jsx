import ContentLoader from 'react-content-loader'

export default function MoviePageSkeleton() {
  return (
    <div className="movie-page">
      {/* Backdrop Skeleton */}
      <div className="movie-backdrop skeleton-backdrop">
        <div className="backdrop-overlay"></div>
      </div>

      {/* Back Button */}
      <div className="back-button skeleton-btn"></div>

      {/* Content */}
      <div className="movie-content">
        {/* Poster Skeleton */}
        <div className="movie-poster skeleton-poster">
          <ContentLoader
            speed={2}
            width={300}
            height={450}
            viewBox="0 0 300 450"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
          >
            <rect x="0" y="0" rx="12" ry="12" width="300" height="450" />
          </ContentLoader>
        </div>

        {/* Info Skeleton */}
        <div className="movie-info">
          {/* Tagline */}
          <ContentLoader
            speed={2}
            width={400}
            height={20}
            viewBox="0 0 400 20"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
            style={{ marginBottom: '16px' }}
          >
            <rect x="0" y="0" rx="4" ry="4" width="350" height="16" />
          </ContentLoader>

          {/* Title */}
          <ContentLoader
            speed={2}
            width={500}
            height={60}
            viewBox="0 0 500 60"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
            style={{ marginBottom: '20px' }}
          >
            <rect x="0" y="0" rx="6" ry="6" width="450" height="50" />
          </ContentLoader>

          {/* Meta (year, runtime, rating) */}
          <ContentLoader
            speed={2}
            width={300}
            height={24}
            viewBox="0 0 300 24"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
            style={{ marginBottom: '20px' }}
          >
            <rect x="0" y="0" rx="4" ry="4" width="50" height="20" />
            <rect x="70" y="0" rx="4" ry="4" width="70" height="20" />
            <rect x="160" y="0" rx="4" ry="4" width="60" height="20" />
          </ContentLoader>

          {/* Genres */}
          <ContentLoader
            speed={2}
            width={300}
            height={36}
            viewBox="0 0 300 36"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
            style={{ marginBottom: '24px' }}
          >
            <rect x="0" y="0" rx="18" ry="18" width="100" height="32" />
            <rect x="115" y="0" rx="18" ry="18" width="90" height="32" />
          </ContentLoader>

          {/* Overview */}
          <ContentLoader
            speed={2}
            width={600}
            height={100}
            viewBox="0 0 600 100"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
            style={{ marginBottom: '32px' }}
          >
            <rect x="0" y="0" rx="4" ry="4" width="600" height="16" />
            <rect x="0" y="26" rx="4" ry="4" width="580" height="16" />
            <rect x="0" y="52" rx="4" ry="4" width="550" height="16" />
            <rect x="0" y="78" rx="4" ry="4" width="400" height="16" />
          </ContentLoader>

          {/* Details Grid */}
          <ContentLoader
            speed={2}
            width={600}
            height={80}
            viewBox="0 0 600 80"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
            style={{ marginBottom: '32px' }}
          >
            {/* Row 1 */}
            <rect x="0" y="0" rx="3" ry="3" width="80" height="12" />
            <rect x="0" y="18" rx="3" ry="3" width="110" height="16" />
            <rect x="150" y="0" rx="3" ry="3" width="50" height="12" />
            <rect x="150" y="18" rx="3" ry="3" width="80" height="16" />
            <rect x="300" y="0" rx="3" ry="3" width="50" height="12" />
            <rect x="300" y="18" rx="3" ry="3" width="90" height="16" />
            <rect x="450" y="0" rx="3" ry="3" width="55" height="12" />
            <rect x="450" y="18" rx="3" ry="3" width="95" height="16" />
          </ContentLoader>

          {/* Watch Providers Title */}
          <ContentLoader
            speed={2}
            width={150}
            height={20}
            viewBox="0 0 150 20"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
            style={{ marginBottom: '16px' }}
          >
            <rect x="0" y="0" rx="3" ry="3" width="130" height="14" />
          </ContentLoader>

          {/* Watch Provider Logos */}
          <ContentLoader
            speed={2}
            width={300}
            height={44}
            viewBox="0 0 300 44"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
            style={{ marginBottom: '32px' }}
          >
            <rect x="0" y="0" rx="8" ry="8" width="40" height="40" />
            <rect x="50" y="0" rx="8" ry="8" width="40" height="40" />
            <rect x="100" y="0" rx="8" ry="8" width="40" height="40" />
            <rect x="150" y="0" rx="8" ry="8" width="40" height="40" />
            <rect x="200" y="0" rx="8" ry="8" width="40" height="40" />
          </ContentLoader>

          {/* Action Button */}
          <ContentLoader
            speed={2}
            width={180}
            height={50}
            viewBox="0 0 180 50"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
          >
            <rect x="0" y="0" rx="12" ry="12" width="170" height="48" />
          </ContentLoader>
        </div>
      </div>
    </div>
  )
}
