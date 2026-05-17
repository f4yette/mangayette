import "./css/App.css";
import Favourites from "./pages/Favourites";
import Home from "./pages/Home";
import MangaDetail from "./pages/MangaDetail";
import ChapterReader from "./pages/ChapterReader";
import Login from "./pages/Login";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/Navbar";
function App() {
return (
<div>
      <NavBar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/manga/:id" element={<MangaDetail />} />
          <Route path="/manga/:id/chapter/:chapterId" element={<ChapterReader />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </div>
);
}
export default App;