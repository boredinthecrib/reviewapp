import { Card, CardContent } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { Movie } from "@shared/schema";
import { Link } from "wouter";
import { useState } from "react";
import { Play } from "lucide-react";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [showTrailer, setShowTrailer] = useState(false);

  // Extract video ID from YouTube URL
  const videoId = movie.trailerUrl?.split('v=')[1];

  return (
    <Link href={`/movies/${movie.id}`}>
      <a className="block">
        <Card 
          className="overflow-hidden hover:shadow-lg transition-shadow relative group"
          onMouseEnter={() => setShowTrailer(true)}
          onMouseLeave={() => setShowTrailer(false)}
        >
          <AspectRatio ratio={2/3} className="relative">
            <img 
              src={movie.posterUrl} 
              alt={movie.title}
              className="object-cover w-full h-full transition-opacity duration-300"
              style={{ opacity: showTrailer && videoId ? 0 : 1 }}
            />
            {videoId && showTrailer && (
              <div className="absolute inset-0 bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1`}
                  allow="autoplay; encrypted-media"
                  className="w-full h-full"
                />
              </div>
            )}
            {movie.trailerUrl && !showTrailer && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-12 h-12 text-white" />
              </div>
            )}
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