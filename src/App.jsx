import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MoviePage from './pages/MoviePage'
import PersonPage from './pages/PersonPage'
import GenrePage from './pages/GenrePage'
import MovieImagesPage from './pages/MovieImagesPage'
import CollectionPage from './pages/CollectionPage'
import SearchPage from './pages/SearchPage'
import TVSeriesPage from './pages/TVSeriesPage'
import Navigation from './components/Navigation'
import './App.css'
import './pages/MoviePage.css'
import './pages/PersonPage.css'
import './pages/GenrePage.css'
import './pages/MovieImagesPage.css'
import './pages/CollectionPage.css'
import './pages/SearchPage.css'
import './pages/TVSeriesPage.css'

function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movie/:id" element={<MoviePage />} />
        <Route path="/movie/:id/images" element={<MovieImagesPage />} />
        <Route path="/person/:id" element={<PersonPage />} />
        <Route path="/genre/:id" element={<GenrePage />} />
        <Route path="/collection/:id" element={<CollectionPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/tv/:id" element={<TVSeriesPage />} />
      </Routes>
    </>
  )
}

export default App
