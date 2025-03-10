import session from "express-session";
import createMemoryStore from "memorystore";
import { User, InsertUser, Movie, Rating, Review } from "@shared/schema";
import { getPopularMovies, getMovie } from "./tmdb";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;

  getRatings(movieId: number): Promise<Rating[]>;
  getUserRating(userId: number, movieId: number): Promise<Rating | undefined>;
  createRating(rating: Rating): Promise<Rating>;

  getReviews(movieId: number): Promise<Review[]>;
  getUserReviews(userId: number): Promise<Review[]>;
  createReview(review: Review): Promise<Review>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private ratings: Map<number, Rating>;
  private reviews: Map<number, Review>;
  private currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.ratings = new Map();
    this.reviews = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMovies(): Promise<Movie[]> {
    return await getPopularMovies();
  }

  async getMovie(id: number): Promise<Movie | undefined> {
    try {
      return await getMovie(id);
    } catch (error) {
      console.error("Error fetching movie:", error);
      return undefined;
    }
  }

  async getRatings(movieId: number): Promise<Rating[]> {
    return Array.from(this.ratings.values()).filter(
      (rating) => rating.movieId === movieId,
    );
  }

  async getUserRating(userId: number, movieId: number): Promise<Rating | undefined> {
    return Array.from(this.ratings.values()).find(
      (rating) => rating.userId === userId && rating.movieId === movieId,
    );
  }

  async createRating(rating: Rating): Promise<Rating> {
    const id = this.currentId++;
    const newRating: Rating = { ...rating, id, createdAt: new Date() };
    this.ratings.set(id, newRating);
    return newRating;
  }

  async getReviews(movieId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter((review) => review.movieId === movieId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter((review) => review.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createReview(review: Review): Promise<Review> {
    const id = this.currentId++;
    const newReview: Review = { ...review, id, createdAt: new Date() };
    this.reviews.set(id, newReview);
    return newReview;
  }
}

export const storage = new MemStorage();