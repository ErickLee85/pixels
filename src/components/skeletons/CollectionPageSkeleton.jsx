import ContentLoader from 'react-content-loader'

export default function CollectionPageSkeleton() {
  return (
    <div className="collection-page">
      {/* Backdrop Skeleton */}
      <div className="collection-backdrop skeleton-backdrop">
        <div className="collection-backdrop-overlay"></div>
      </div>

      {/* Back Button */}
      <div className="back-button skeleton-btn"></div>

      {/* Header */}
      <div className="collection-header">
        {/* Poster Skeleton */}
        <div className="collection-poster skeleton-poster">
          <ContentLoader
            speed={2}
            width={280}
            height={420}
            viewBox="0 0 280 420"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
          >
            <rect x="0" y="0" rx="16" ry="16" width="280" height="420" />
          </ContentLoader>
        </div>

        {/* Info Skeleton */}
        <div className="collection-info">
          {/* Collection Label */}
          <ContentLoader
            speed={2}
            width={120}
            height={32}
            viewBox="0 0 120 32"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
            style={{ marginBottom: '12px' }}
          >
            <rect x="0" y="0" rx="6" ry="6" width="110" height="28" />
          </ContentLoader>

          {/* Title */}
          <ContentLoader
            speed={2}
            width={400}
            height={50}
            viewBox="0 0 400 50"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
            style={{ marginBottom: '24px' }}
          >
            <rect x="0" y="0" rx="6" ry="6" width="380" height="44" />
          </ContentLoader>

          {/* Stats */}
          <ContentLoader
            speed={2}
            width={300}
            height={60}
            viewBox="0 0 300 60"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
            style={{ marginBottom: '24px' }}
          >
            <rect x="0" y="0" rx="4" ry="4" width="30" height="36" />
            <rect x="0" y="44" rx="4" ry="4" width="50" height="14" />
            <rect x="80" y="0" rx="4" ry="4" width="1" height="50" />
            <rect x="110" y="0" rx="4" ry="4" width="30" height="36" />
            <rect x="110" y="44" rx="4" ry="4" width="70" height="14" />
            <rect x="210" y="0" rx="4" ry="4" width="1" height="50" />
            <rect x="240" y="0" rx="4" ry="4" width="50" height="36" />
            <rect x="240" y="44" rx="4" ry="4" width="80" height="14" />
          </ContentLoader>

          {/* Overview */}
          <ContentLoader
            speed={2}
            width={600}
            height={80}
            viewBox="0 0 600 80"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
          >
            <rect x="0" y="0" rx="4" ry="4" width="600" height="16" />
            <rect x="0" y="26" rx="4" ry="4" width="580" height="16" />
            <rect x="0" y="52" rx="4" ry="4" width="450" height="16" />
          </ContentLoader>
        </div>
      </div>

      {/* Movies Section Skeleton */}
      <div className="collection-movies">
        <div className="collection-movies-header">
          <ContentLoader
            speed={2}
            width={250}
            height={30}
            viewBox="0 0 250 30"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
          >
            <rect x="0" y="0" rx="4" ry="4" width="220" height="26" />
          </ContentLoader>
        </div>
        <div className="collection-movies-grid">
          {[...Array(6)].map((_, index) => (
            <div className="collection-movie-item" key={index}>
              <span className="movie-number skeleton-number">
                <ContentLoader
                  speed={2}
                  width={28}
                  height={28}
                  viewBox="0 0 28 28"
                  backgroundColor="rgb(187, 12, 12);"
                  foregroundColor="rgb(187, 12, 12);"
                >
                  <circle cx="14" cy="14" r="14" />
                </ContentLoader>
              </span>
              <div className="skeleton-movie-card">
                <ContentLoader
                  speed={2}
                  width={180}
                  height={270}
                  viewBox="0 0 180 270"
                  backgroundColor="#1a1a1a"
                  foregroundColor="#2a2a2a"
                >
                  <rect x="0" y="0" rx="12" ry="12" width="180" height="270" />
                </ContentLoader>
              </div>
              <div className="movie-release-year">
                <ContentLoader
                  speed={2}
                  width={50}
                  height={16}
                  viewBox="0 0 50 16"
                  backgroundColor="#1a1a1a"
                  foregroundColor="#2a2a2a"
                >
                  <rect x="0" y="0" rx="4" ry="4" width="50" height="14" />
                </ContentLoader>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gallery Section Skeleton */}
      <div className="collection-gallery">
        <div className="collection-gallery-header">
          <ContentLoader
            speed={2}
            width={100}
            height={30}
            viewBox="0 0 100 30"
            backgroundColor="#1a1a1a"
            foregroundColor="#2a2a2a"
          >
            <rect x="0" y="0" rx="4" ry="4" width="80" height="26" />
          </ContentLoader>
        </div>
        <div className="collection-gallery-grid">
          {[...Array(6)].map((_, index) => (
            <div className="gallery-image skeleton-gallery" key={index}>
              <ContentLoader
                speed={2}
                width={400}
                height={225}
                viewBox="0 0 400 225"
                backgroundColor="#1a1a1a"
                foregroundColor="#2a2a2a"
                style={{ width: '100%', height: '100%' }}
              >
                <rect x="0" y="0" rx="12" ry="12" width="400" height="225" />
              </ContentLoader>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
