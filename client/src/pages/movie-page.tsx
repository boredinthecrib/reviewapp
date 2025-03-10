import { useQuery, useMutation } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Movie, Rating, Review, insertRatingSchema, insertReviewSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import RatingStars from "@/components/rating-stars";
import ReviewCard from "@/components/review-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Loader2 } from "lucide-react";

export default function MoviePage() {
  const [, params] = useRoute("/movies/:id");
  const movieId = parseInt(params?.id || "0");
  const { user } = useAuth();

  const { data: movie, isLoading: movieLoading } = useQuery<Movie>({
    queryKey: [`/api/movies/${movieId}`],
  });

  const { data: ratings } = useQuery<Rating[]>({
    queryKey: [`/api/movies/${movieId}/ratings`],
  });

  const { data: reviews } = useQuery<Review[]>({
    queryKey: [`/api/movies/${movieId}/reviews`],
  });

  const ratingMutation = useMutation({
    mutationFn: async (rating: number) => {
      const res = await apiRequest("POST", `/api/movies/${movieId}/rate`, { rating });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/movies/${movieId}/ratings`] });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertReviewSchema.omit({ userId: true, movieId: true })),
    defaultValues: {
      content: "",
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      const res = await apiRequest("POST", `/api/movies/${movieId}/review`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/movies/${movieId}/reviews`] });
      form.reset();
    },
  });

  if (movieLoading) {
    return (
      <div className="flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!movie) {
    return <div>Movie not found</div>;
  }

  const averageRating = ratings?.length 
    ? ratings.reduce((acc, r) => acc + r.rating, 0) / ratings.length 
    : 0;

  const userRating = ratings?.find(r => r.userId === user?.id);

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-[300px,1fr] gap-8">
        <Card className="overflow-hidden">
          <AspectRatio ratio={2/3}>
            <img 
              src={movie.posterUrl} 
              alt={movie.title}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
        </Card>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{movie.title}</h1>
          <p className="text-xl text-muted-foreground">
            {movie.year} • Directed by {movie.director}
          </p>
          <p className="text-lg">{movie.description}</p>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Average Rating: {averageRating.toFixed(1)}/5</h2>
            <RatingStars 
              rating={userRating?.rating}
              onChange={(rating) => ratingMutation.mutate(rating)}
              disabled={ratingMutation.isPending}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Reviews</h2>
        
        <Card>
          <CardContent className="pt-6">
            <Form {...form}>
              <form 
                onSubmit={form.handleSubmit((data) => reviewMutation.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea 
                          placeholder="Write your review..." 
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit"
                  disabled={reviewMutation.isPending}
                >
                  {reviewMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Post Review
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {reviews?.map((review) => (
            <ReviewCard 
              key={review.id} 
              review={review}
              user={user!}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
