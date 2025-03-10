import { Card, CardContent } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { Movie } from "@shared/schema";
import { Link } from "wouter";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`}>
      <a className="block">
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <AspectRatio ratio={2/3}>
            <img 
              src={movie.posterUrl} 
              alt={movie.title}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg">{movie.title}</h3>
            <p className="text-sm text-muted-foreground">
              {movie.year} • {movie.director}
            </p>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
}
