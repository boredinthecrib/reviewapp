import fetch from "node-fetch";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

export async function fetchFromTMDB(endpoint: string) {
  const response = await fetch(`${TMDB_BASE_URL}${endpoint}`, {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

export async function getPopularMovies() {
  const data = await fetchFromTMDB("/movie/popular");
  return data.results.map(formatTMDBMovie);
}

export async function getMovie(id: number) {
  const [movie, credits] = await Promise.all([
    fetchFromTMDB(`/movie/${id}`),
    fetchFromTMDB(`/movie/${id}/credits`),
  ]);
  
  const director = credits.crew.find((person: any) => person.job === "Director");
  return formatTMDBMovie({
    ...movie,
    director: director?.name || "Unknown",
  });
}

function formatTMDBMovie(movie: any) {
  return {
    id: movie.id,
    title: movie.title,
    description: movie.overview,
    posterUrl: `${TMDB_IMAGE_BASE}${movie.poster_path}`,
    year: new Date(movie.release_date).getFullYear(),
    director: movie.director,
  };
}
