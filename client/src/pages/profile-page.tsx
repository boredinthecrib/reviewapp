import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User, Review } from "@shared/schema";
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
          <AvatarImage src={user.avatarUrl} />
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
        ) : (
          <div className="space-y-4">
            {reviews?.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review}
                user={currentUser!}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
