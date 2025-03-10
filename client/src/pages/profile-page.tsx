import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User, Review, Movie } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ReviewCard from "@/components/review-card";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [, params] = useRoute("/profile/:id");
  const userId = parseInt(params?.id || "0");
  const { user: currentUser } = useAuth();

  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${userId}`],
  });

  const { data: reviews, isLoading: reviewsLoading } = useQuery<Review[]>({
    queryKey: [`/api/users/${userId}/reviews`],
  });

  // Get unique movie IDs from reviews
  const movieIds = [...new Set(reviews?.map(review => review.movieId) ?? [])];

  // Fetch movies in parallel with a single query
  const { data: movies = [] } = useQuery<Movie[]>({
    queryKey: ['/api/movies/batch', movieIds],
    enabled: movieIds.length > 0,
    queryFn: async () => {
      const responses = await Promise.all(
        movieIds.map(id => 
          fetch(`/api/movies/${id}`, {
            credentials: 'include'
          }).then(res => res.json())
        )
      );
      return responses.filter(Boolean); // Filter out any failed requests
    }
  });

  // Create a map for O(1) movie lookups
  const movieMap: Record<number, Movie> = {};
  movies.forEach(movie => {
    if (movie) movieMap[movie.id] = movie;
  });

  if (!user) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatarUrl ?? undefined} />
          <AvatarFallback className="text-2xl">
            {user.username[0].toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold">{user.username}</h1>
          <p className="text-muted-foreground">
            {reviews?.length || 0} reviews
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Reviews</h2>

        {reviewsLoading ? (
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !reviews?.length ? (
          <p className="text-center text-muted-foreground">No reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review}
                user={currentUser!}
                movie={movieMap[review.movieId]}
                showMovie={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}