import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Movie, Watchlist } from "@shared/schema";
import MovieCard from "@/components/movie-card";
import { Loader2 } from "lucide-react";

export default function WatchlistPage() {
  const { user } = useAuth();

  const { data: watchlist, isLoading: watchlistLoading } = useQuery<Watchlist[]>({
    queryKey: [`/api/users/${user?.id}/watchlist`],
  });

  // Fetch movies in parallel
  const { data: movies = [], isLoading: moviesLoading } = useQuery<Movie[]>({
    queryKey: ['/api/movies/batch', watchlist?.map(item => item.movieId)],
    enabled: !!watchlist?.length,
    queryFn: async () => {
      const responses = await Promise.all(
        watchlist!.map(item => 
          fetch(`/api/movies/${item.movieId}`).then(res => res.json())
        )
      );
      return responses.filter(Boolean);
    },
  });

  const isLoading = watchlistLoading || moviesLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">My Watchlist</h1>
        <p className="text-muted-foreground">
          Your watchlist is empty. Start adding movies you want to watch later!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">My Watchlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
}
