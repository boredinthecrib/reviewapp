import { Card, CardContent } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { Movie } from "@shared/schema";
import { Link } from "wouter";
import { useState, useCallback } from "react";
import { Play } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import WatchlistButton from "./watchlist-button";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerLoaded, setTrailerLoaded] = useState(false);

  // Extract video ID from YouTube URL
  const videoId = movie.trailerUrl?.match(/(?:v=|\/)([\w-]{11})(?:\?|$|&)/)?.[1];

  const handleMouseEnter = useCallback(() => {
    if (videoId) {
      setShowTrailer(true);
      // Pre-load the iframe
      setTrailerLoaded(true);
    }
  }, [videoId]);

  const handleMouseLeave = useCallback(() => {
    setShowTrailer(false);
  }, []);

  return (
    <div className="relative">
      <Link href={`/movies/${movie.id}`}>
        <Card 
          className="overflow-hidden hover:shadow-lg transition-shadow relative group cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <AspectRatio ratio={2/3} className="relative bg-black">
            <img 
              src={movie.posterUrl} 
              alt={movie.title}
              className="object-cover w-full h-full transition-opacity duration-300"
              style={{ opacity: showTrailer && videoId ? 0 : 1 }}
            />
            {videoId && trailerLoaded && (
              <div 
                className="absolute inset-0 bg-black transition-opacity duration-300"
                style={{ opacity: showTrailer ? 1 : 0 }}
              >
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`}
                  allow="autoplay; encrypted-media"
                  className="w-full h-full"
                  title={`${movie.title} trailer`}
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
            <h3 className="font-semibold text-lg line-clamp-1">{movie.title}</h3>
            <p className="text-sm text-muted-foreground">
              {movie.year} • {movie.director}
            </p>
          </CardContent>
        </Card>
      </Link>
      <WatchlistButton movieId={movie.id} />
    </div>
  );
}