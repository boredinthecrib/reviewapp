import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

export default function NavBar() {
  const { user, logoutMutation } = useAuth();

  if (!user) return null;

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/">
          <a className="text-xl font-bold">MovieReviews</a>
        </Link>
        
        <div className="flex items-center gap-4">
          <Link href={`/profile/${user.id}`}>
            <a className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={user.avatarUrl} />
                <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              <span>{user.username}</span>
            </a>
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
