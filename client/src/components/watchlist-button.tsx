import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { Watchlist } from "@shared/schema";

interface WatchlistButtonProps {
  movieId: number;
}

export default function WatchlistButton({ movieId }: WatchlistButtonProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: watchlist } = useQuery<Watchlist[]>({
    queryKey: [`/api/users/${user?.id}/watchlist`],
    enabled: !!user,
  });

  const isInWatchlist = watchlist?.some(item => item.movieId === movieId);

  const mutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/movies/${movieId}/watchlist`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/users/${user?.id}/watchlist`] 
      });
    },
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={(e) => {
        e.preventDefault(); // Prevent navigation when inside MovieCard
        mutation.mutate();
      }}
      disabled={mutation.isPending}
      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background/90"
    >
      {isInWatchlist ? (
        <BookmarkCheck className="h-5 w-5 text-primary" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
    </Button>
  );
}
