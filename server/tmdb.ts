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
  const movies = await Promise.all(
    data.results.map(async (movie: any) => {
      // Fetch videos for each movie
      const videos = await fetchFromTMDB(`/movie/${movie.id}/videos`);
      return {
        ...movie,
        videos: videos.results,
      };
    })
  );
  return movies.map(formatTMDBMovie);
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

function formatTMDBMovie(movie: any) {
  const trailer = movie.videos?.find((video: any) => 
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
      ? movie.genre_ids.map((id: number) => ({
          id,
          name: "Loading..." // Genres will be fetched separately
        }))
      : movie.genres || [],
    trailerUrl: trailer?.key ? `https://www.youtube.com/watch?v=${trailer.key}` : null,
    voteAverage: Math.round((movie.vote_average || 0) * 10),
  };
}