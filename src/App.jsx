import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MoviePage from './pages/MoviePage'
import PersonPage from './pages/PersonPage'
import GenrePage from './pages/GenrePage'
import MovieImagesPage from './pages/MovieImagesPage'
import Navigation from './components/Navigation'
import './App.css'
import './pages/MoviePage.css'
import './pages/PersonPage.css'
import './pages/GenrePage.css'
import './pages/MovieImagesPage.css'

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
      </Routes>
    </>
  )
}

export default App
