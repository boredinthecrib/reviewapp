import session from "express-session";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import { pool } from "./db";
import { users, movies, ratings, reviews, watchlist } from "@shared/schema";
import { User, InsertUser, Movie, Rating, Review, Watchlist } from "@shared/schema";
import { getPopularMovies, getMovie } from "./tmdb";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getMovies(): Promise<Movie[]>;
  getMovie(id: number): Promise<Movie | undefined>;

  getRatings(movieId: number): Promise<Rating[]>;
  getUserRating(userId: number, movieId: number): Promise<Rating | undefined>;
  createRating(rating: { userId: number; movieId: number; rating: number }): Promise<Rating>;

  getReviews(movieId: number): Promise<Review[]>;
  getUserReviews(userId: number): Promise<Review[]>;
  createReview(review: { userId: number; movieId: number; content: string }): Promise<Review>;

  getUserWatchlist(userId: number): Promise<Watchlist[]>;
  isInWatchlist(userId: number, movieId: number): Promise<boolean>;
  addToWatchlist(userId: number, movieId: number): Promise<Watchlist>;
  removeFromWatchlist(userId: number, movieId: number): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
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
    return await db.select().from(ratings).where(eq(ratings.movieId, movieId));
  }

  async getUserRating(userId: number, movieId: number): Promise<Rating | undefined> {
    const [rating] = await db
      .select()
      .from(ratings)
      .where(eq(ratings.userId, userId) && eq(ratings.movieId, movieId));
    return rating;
  }

  async createRating(rating: { userId: number; movieId: number; rating: number }): Promise<Rating> {
    const [newRating] = await db
      .insert(ratings)
      .values(rating)
      .returning();
    return newRating;
  }

  async getReviews(movieId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.movieId, movieId))
      .orderBy(desc(reviews.createdAt));
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.userId, userId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: { userId: number; movieId: number; content: string }): Promise<Review> {
    const [newReview] = await db
      .insert(reviews)
      .values(review)
      .returning();
    return newReview;
  }

  async getUserWatchlist(userId: number): Promise<Watchlist[]> {
    return await db
      .select()
      .from(watchlist)
      .where(eq(watchlist.userId, userId))
      .orderBy(desc(watchlist.addedAt));
  }

  async isInWatchlist(userId: number, movieId: number): Promise<boolean> {
    const [item] = await db
      .select()
      .from(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.movieId, movieId)
        )
      );
    return !!item;
  }

  async addToWatchlist(userId: number, movieId: number): Promise<Watchlist> {
    const [item] = await db
      .insert(watchlist)
      .values({ userId, movieId })
      .returning();
    return item;
  }

  async removeFromWatchlist(userId: number, movieId: number): Promise<void> {
    await db
      .delete(watchlist)
      .where(
        and(
          eq(watchlist.userId, userId),
          eq(watchlist.movieId, movieId)
        )
      );
  }
}

export const storage = new DatabaseStorage();