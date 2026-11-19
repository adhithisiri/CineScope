
import { useEffect, useState } from "react";
import {
  Search,
  Bookmark,
  Play,
  Star,
  Film,
  Clapperboard,
  LoaderCircle
} from "lucide-react";

import "./App.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_URL = "https://api.themoviedb.org/3";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";

function Navbar() {
  return (
    <nav className="navbar">
      <a className="logo" href="#home">
        <Clapperboard size={27} />
        <span>
          Cine<span className="logo-highlight">Scope</span>
        </span>
      </a>

      <div className="nav-links">
        <a href="#home">Home</a>
        <a href="#trending">Explore</a>
        <a href="#about">About</a>
      </div>

      <a href="#trending" className="watchlist-link">
        <Bookmark size={17} />
        Movies
      </a>
    </nav>
  );
}

function MovieCard({ movie }) {
  const poster = movie.poster_path
    ? `${IMAGE_URL}${movie.poster_path}`
    : null;

  return (
    <article className="movie-card">
      <div className="movie-poster">
        {poster ? (
          <img
            src={poster}
            alt={`${movie.title} poster`}
            loading="lazy"
          />
        ) : (
          <div className="poster-content">
            <Film size={35} />
            <span>{movie.title}</span>
          </div>
        )}

        <div className="poster-rating">
          <Star size={14} fill="currentColor" />
          <span>
            {movie.vote_average?.toFixed(1) || "N/A"}
          </span>
        </div>
      </div>

      <div className="movie-info">
        <h3>{movie.title}</h3>
        <p>
          {movie.release_date
            ? movie.release_date.slice(0, 4)
            : "Release date unavailable"}
        </p>
      </div>
    </article>
  );
}

function App() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!API_KEY) {
      setError("TMDB API key is missing. Please check your .env file.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");

      try {
        const url = new URL(
          search.trim()
            ? `${API_URL}/search/movie`
            : `${API_URL}/movie/popular`
        );

        url.searchParams.set("api_key", API_KEY);

        if (search.trim()) {
          url.searchParams.set("query", search.trim());
        }

        const response = await fetch(url.toString(), {
          signal: controller.signal
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.status_message ||
            `TMDB request failed (${response.status}).`
          );
        }

        setMovies(data.results || []);

      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Unable to load movies.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search]);

  return (
    <div className="app">
      <Navbar />

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">
              <span className="live-dot"></span>
              YOUR MOVIE DESTINATION
            </span>

            <h1>
              Every movie has
              <br />
              a <span>story.</span>
            </h1>

            <p>
              Discover unforgettable stories, explore new worlds
              and find your next favourite movie.
            </p>

            <a href="#trending" className="hero-button">
              <Play size={18} fill="currentColor" />
              Explore Movies
            </a>
          </div>

          <div className="hero-decoration">
            <div className="hero-circle">
              <Clapperboard size={90} strokeWidth={1} />
            </div>
            <span className="hero-caption">
              THE WORLD OF CINEMA
            </span>
          </div>
        </section>

        <section className="movies-section" id="trending">
          <div className="section-heading">
            <div>
              <span className="section-label">
                CURATED FOR YOU
              </span>
              <h2>Explore Movies</h2>
            </div>

            <div className="search-box">
              <Search size={19} />
              <input
                type="text"
                placeholder="Search movies..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {loading && (
            <div className="status-message">
              <LoaderCircle className="loader" size={28} />
              <p>Loading movies...</p>
            </div>
          )}

          {error && (
            <div className="status-message error-message">
              <p>{error}</p>
            </div>
          )}

          {!loading && !error && (
            <div className="movie-grid">
              {movies.length > 0 ? (
                movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))
              ) : (
                <p className="empty-message">
                  No movies found. Try another title.
                </p>
              )}
            </div>
          )}
        </section>
      </main>

      <footer id="about">
        <p>© 2026 CineScope. Made for movie lovers.</p>
        <p>DISCOVER · EXPLORE · ENJOY</p>
      </footer>

      <div className="tmdb-attribution">
        This product uses the TMDB API but is not endorsed or certified by TMDB.
      </div>
    </div>
  );
}

export default App;
