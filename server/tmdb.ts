import fetch from "node-fetch";
import { Movie } from "@shared/schema";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  genre_ids?: number[];
  genres?: { id: number; name: string }[];
  vote_average: number;
  videos?: {
    results: Array<{
      type: string;
      site: string;
      key: string;
    }>;
  };
}

interface TMDBResponse<T> {
  results: T[];
}

export async function fetchFromTMDB<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return await response.json() as T;
}

export async function getGenres() {
  const data = await fetchFromTMDB<{ genres: Array<{ id: number; name: string }> }>("/genre/movie/list");
  return data.genres;
}

export async function getPopularMovies(page = 1) {
  const data = await fetchFromTMDB<TMDBResponse<TMDBMovie>>(`/movie/popular?page=${page}`);
  const movies = await Promise.all(
    data.results.map(async (movie) => {
      try {
        const videos = await fetchFromTMDB<{ results: Array<{ type: string; site: string; key: string }> }>(`/movie/${movie.id}/videos`);
        return {
          ...movie,
          videos: videos.results,
        };
      } catch (error) {
        console.error(`Failed to fetch videos for movie ${movie.id}:`, error);
        return {
          ...movie,
          videos: [],
        };
      }
    })
  );
  return movies.map(formatTMDBMovie);
}

export async function searchMovies(query: string, page = 1) {
  const data = await fetchFromTMDB<TMDBResponse<TMDBMovie>>(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
  return await Promise.all(data.results.map(formatTMDBMovie));
}

export async function getMovie(id: number): Promise<Movie | undefined> {
  try {
    const [movie, credits, videos] = await Promise.all([
      fetchFromTMDB<TMDBMovie>(`/movie/${id}`),
      fetchFromTMDB<{ crew: Array<{ job: string; name: string }> }>(`/movie/${id}/credits`),
      fetchFromTMDB<{ results: Array<{ type: string; site: string; key: string }> }>(`/movie/${id}/videos`),
    ]);

    const director = credits.crew.find((person) => person.job === "Director");
    const trailer = videos.results.find((video) => 
      video.type === "Trailer" && video.site === "YouTube"
    );

    return formatTMDBMovie({
      ...movie,
      director: director?.name,
      trailer_key: trailer?.key,
    });
  } catch (error) {
    console.error(`Failed to fetch movie ${id}:`, error);
    return undefined;
  }
}

function formatTMDBMovie(movie: TMDBMovie & { director?: string; trailer_key?: string }): Movie {
  const trailer = movie.videos?.results?.find((video) => 
    video.type === "Trailer" && video.site === "YouTube"
  );

  return {
    id: movie.id,
    title: movie.title,
    description: movie.overview,
    posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : "/placeholder-poster.jpg",
    year: new Date(movie.release_date).getFullYear(),
    director: movie.director || "Unknown",
    genres: movie.genre_ids 
      ? movie.genre_ids.map((id) => ({
          id,
          name: "Loading..." // Genres will be fetched separately
        }))
      : movie.genres || [],
    trailerUrl: (trailer?.key || movie.trailer_key) ? `https://www.youtube.com/watch?v=${trailer?.key || movie.trailer_key}` : null,
    voteAverage: Math.round((movie.vote_average || 0) * 10),
  };
}