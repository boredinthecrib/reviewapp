import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { Bookmark } from "lucide-react";

export default function NavBar() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/">
          <Button variant="link" className="text-xl font-bold p-0">MovieReviews</Button>
        </Link>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/watchlist">
            <Button variant="ghost" className="flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              <span>Watchlist</span>
            </Button>
          </Link>
          <Link href={`/profile/${user.id}`}>
            <Button variant="ghost" className="flex items-center gap-2 p-2">
              <Avatar>
                <AvatarImage src={user.avatarUrl ?? undefined} />
                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{user.username}</span>
            </Button>
          </Link>

          <Button 
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}