import { Card, CardContent, CardHeader } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Review, User } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";

interface ReviewCardProps {
  review: Review;
  user: User;
}

export default function ReviewCard({ review, user }: ReviewCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row gap-4 space-y-0">
        <Link href={`/profile/${user.id}`}>
          <a className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">{user.username}</span>
          </a>
        </Link>
        <span className="text-sm text-muted-foreground">
          {format(review.createdAt, "PPP")}
        </span>
      </CardHeader>
      <CardContent>
        <p className="whitespace-pre-wrap">{review.content}</p>
      </CardContent>
    </Card>
  );
}
