import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./hooks/use-auth";
import { ThemeProvider } from "./hooks/use-theme";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import MoviePage from "@/pages/movie-page";
import ProfilePage from "@/pages/profile-page";
import { ProtectedRoute } from "./lib/protected-route";
import NavBar from "./components/nav-bar";
import WatchlistPage from "@/pages/watchlist-page";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/movies/:id" component={MoviePage} />
      <ProtectedRoute path="/profile/:id" component={ProfilePage} />
      <ProtectedRoute path="/watchlist" component={WatchlistPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="movie-app-theme">
        <AuthProvider>
          <NavBar />
          <main className="container mx-auto px-4 py-8">
            <Router />
          </main>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;