import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { CitizenHomePage } from './pages/CitizenHomePage'
import { AuthorityHomePage } from './pages/AuthorityHomePage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import './App.css'

function App() {
 return (
 <Router>
 <Toaster position="top-right"/>
 <Routes>
 <Route path="/"element={<LandingPage />} />
 <Route path="/login"element={<LoginPage />} />
 <Route path="/register"element={<RegisterPage />} />
 <Route path="/home"element={<CitizenHomePage />} />
 <Route path="/authority/home"element={<AuthorityHomePage />} />
 <Route path="/leaderboard"element={<LeaderboardPage />} />
 </Routes>
 </Router>
 )
}

export default App


