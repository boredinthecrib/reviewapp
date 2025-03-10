import { useQuery } from "@tanstack/react-query";
import { Movie } from "@shared/schema";
import MovieCard from "@/components/movie-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Loader2, FilterX } from "lucide-react";
import { Slider } from "@/components/ui/slider";

type SortOption = "newest" | "rating" | "title";

interface Filters {
  year?: number;
  minRating?: number;
  genre?: string;
  sort: SortOption;
}

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Filters>({
    sort: "newest",
  });

  const { data: movies, isLoading } = useQuery<Movie[]>({
    queryKey: ["/api/movies"],
  });

  const filteredMovies = movies?.filter(movie => {
    const searchTerm = search.toLowerCase();
    const matchesSearch = 
      movie.title.toLowerCase().includes(searchTerm) ||
      movie.director.toLowerCase().includes(searchTerm);

    const matchesYear = !filters.year || movie.year === filters.year;
    const matchesRating = !filters.minRating || (movie.voteAverage ?? 0) >= filters.minRating;
    const matchesGenre = !filters.genre || movie.genres.some(g => g.name === filters.genre);

    return matchesSearch && matchesYear && matchesRating && matchesGenre;
  }).sort((a, b) => {
    switch (filters.sort) {
      case "newest":
        return b.year - a.year;
      case "rating":
        return (b.voteAverage ?? 0) - (a.voteAverage ?? 0);
      case "title":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });

  // Get unique years and genres using Set and Array.from instead of spread operator
  const years = Array.from(new Set(movies?.map(m => m.year) ?? [])).sort((a, b) => b - a);
  const genres = Array.from(new Set(
    movies?.flatMap(m => m.genres.map(g => g.name)) ?? []
  )).sort();

  const clearFilters = () => {
    setFilters({ sort: "newest" });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <h1 className="text-4xl font-bold">Discover Movies</h1>
        <Input
          type="search"
          placeholder="Search movies by title or director..."
          className="max-w-md"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        <div className="space-y-2 min-w-[200px]">
          <label className="text-sm font-medium">Year</label>
          <Select
            value={filters.year?.toString()}
            onValueChange={(value) => setFilters(f => ({ 
              ...f, 
              year: value ? parseInt(value) : undefined 
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All years</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 min-w-[200px]">
          <label className="text-sm font-medium">Genre</label>
          <Select
            value={filters.genre || "all"}
            onValueChange={(value) => setFilters(f => ({ 
              ...f, 
              genre: value === "all" ? undefined : value 
            }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="All genres" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All genres</SelectItem>
              {genres.map(genre => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 min-w-[200px]">
          <label className="text-sm font-medium">
            Minimum Rating: {filters.minRating ?? 0}%
          </label>
          <Slider
            value={[filters.minRating ?? 0]}
            onValueChange={([value]) => setFilters(f => ({ ...f, minRating: value }))}
            max={100}
            step={10}
          />
        </div>

        <div className="space-y-2 min-w-[200px]">
          <label className="text-sm font-medium">Sort by</label>
          <Select
            value={filters.sort}
            onValueChange={(value: SortOption) => setFilters(f => ({ ...f, sort: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="title">Title A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          variant="outline" 
          onClick={clearFilters}
          className="flex items-center gap-2"
        >
          <FilterX className="h-4 w-4" />
          Clear Filters
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !filteredMovies?.length ? (
        <div className="text-center text-muted-foreground">
          No movies found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}