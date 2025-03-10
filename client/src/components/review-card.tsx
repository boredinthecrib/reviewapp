import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Review, User, Movie } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";

interface ReviewCardProps {
  review: Review;
  user: User;
  movie?: Movie;
  showMovie?: boolean;
}

export default function ReviewCard({ review, user, movie, showMovie = false }: ReviewCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center gap-4 space-y-0">
        <Link href={`/profile/${user.id}`}>
          <a className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user.avatarUrl ?? undefined} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">{user.username}</span>
          </a>
        </Link>
        <span className="text-sm text-muted-foreground">
          {review.createdAt && format(new Date(review.createdAt), "PPP")}
        </span>
      </CardHeader>
      <CardContent className="space-y-2">
        {showMovie && movie && (
          <Link href={`/movies/${movie.id}`}>
            <a className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent">
              <img 
                src={movie.posterUrl} 
                alt={movie.title}
                className="w-16 h-24 object-cover rounded"
              />
              <div>
                <h3 className="font-semibold">{movie.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {movie.year} • {movie.director}
                </p>
              </div>
            </a>
          </Link>
        )}
        <p className="whitespace-pre-wrap">{review.content}</p>
      </CardContent>
    </Card>
  );
}