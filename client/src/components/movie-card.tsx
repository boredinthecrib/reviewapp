import { Card, CardContent } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { Movie } from "@shared/schema";
import { Link } from "wouter";
import { useState, useCallback } from "react";
import { Play, Bookmark, BookmarkCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Watchlist } from "@shared/schema";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerLoaded, setTrailerLoaded] = useState(false);

  const { data: watchlist } = useQuery<Watchlist[]>({
    queryKey: [`/api/users/${user?.id}/watchlist`],
    enabled: !!user,
  });

  const isInWatchlist = watchlist?.some(item => item.movieId === movie.id);

  const mutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/movies/${movie.id}/watchlist`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${user?.id}/watchlist`] 
      });
    },
  });

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
    <ContextMenu>
      <ContextMenuTrigger>
        <Link href={`/movies/${movie.id}`}>
          <a className="block">
            <Card 
              className="overflow-hidden hover:shadow-lg transition-shadow relative group"
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
          </a>
        </Link>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
          className="flex items-center gap-2"
        >
          {isInWatchlist ? (
            <>
              <BookmarkCheck className="h-4 w-4" />
              Remove from Watchlist
            </>
          ) : (
            <>
              <Bookmark className="h-4 w-4" />
              Add to Watchlist
            </>
          )}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}