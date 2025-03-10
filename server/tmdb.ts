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

export async function getGenres() {
  const data = await fetchFromTMDB("/genre/movie/list");
  return data.genres;
}

export async function getPopularMovies(page = 1) {
  const data = await fetchFromTMDB(`/movie/popular?page=${page}`);
  return await Promise.all(data.results.map(formatTMDBMovie));
}

export async function searchMovies(query: string, page = 1) {
  const data = await fetchFromTMDB(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`);
  return await Promise.all(data.results.map(formatTMDBMovie));
}

export async function getMovie(id: number) {
  const [movie, credits, videos] = await Promise.all([
    fetchFromTMDB(`/movie/${id}`),
    fetchFromTMDB(`/movie/${id}/credits`),
    fetchFromTMDB(`/movie/${id}/videos`),
  ]);

  const director = credits.crew.find((person: any) => person.job === "Director");
  const trailer = videos.results?.find((video: any) => 
    video.type === "Trailer" && video.site === "YouTube"
  );

  return formatTMDBMovie({
    ...movie,
    director: director?.name || "Unknown",
    trailer_key: trailer?.key,
  });
}

async function formatTMDBMovie(movie: any) {
  const genres = await getGenres();

  return {
    id: movie.id,
    title: movie.title,
    description: movie.overview,
    posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : null,
    year: new Date(movie.release_date).getFullYear(),
    director: movie.director || "Unknown",
    genres: movie.genre_ids 
      ? movie.genre_ids.map((id: number) => 
          genres.find((g: any) => g.id === id)
        ).filter(Boolean)
      : movie.genres || [],
    trailerUrl: movie.trailer_key ? `https://www.youtube.com/watch?v=${movie.trailer_key}` : null,
    voteAverage: Math.round(movie.vote_average * 10),
  };
}