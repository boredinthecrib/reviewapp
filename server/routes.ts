import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertRatingSchema, insertReviewSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.get("/api/movies", async (req, res) => {
    try {
      const movies = await storage.getMovies();
      res.json(movies);
    } catch (error) {
      console.error('Error fetching movies:', error);
      res.status(500).json({ error: 'Failed to fetch movies' });
    }
  });

  app.get("/api/movies/:id", async (req, res) => {
    const movie = await storage.getMovie(parseInt(req.params.id));
    if (!movie) return res.sendStatus(404);
    res.json(movie);
  });

  app.get("/api/movies/:id/ratings", async (req, res) => {
    const ratings = await storage.getRatings(parseInt(req.params.id));
    res.json(ratings);
  });

  app.get("/api/movies/:id/reviews", async (req, res) => {
    const reviews = await storage.getReviews(parseInt(req.params.id));
    res.json(reviews);
  });

  app.post("/api/movies/:id/rate", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const movieId = parseInt(req.params.id);
    const parsed = insertRatingSchema.safeParse({
      ...req.body,
      userId: req.user!.id,
      movieId,
    });

    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const rating = await storage.createRating(parsed.data);
    res.status(201).json(rating);
  });

  app.post("/api/movies/:id/review", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);

    const movieId = parseInt(req.params.id);
    const parsed = insertReviewSchema.safeParse({
      ...req.body,
      userId: req.user!.id,
      movieId,
    });

    if (!parsed.success) {
      return res.status(400).json(parsed.error);
    }

    const review = await storage.createReview(parsed.data);
    res.status(201).json(review);
  });

  app.get("/api/users/:id", async (req, res) => {
    const user = await storage.getUser(parseInt(req.params.id));
    if (!user) return res.sendStatus(404);
    res.json(user);
  });

  app.get("/api/users/:id/reviews", async (req, res) => {
    const reviews = await storage.getUserReviews(parseInt(req.params.id));
    res.json(reviews);
  });

  app.get("/api/users/:id/watchlist", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const watchlist = await storage.getUserWatchlist(parseInt(req.params.id));
    res.json(watchlist);
  });

  app.post("/api/movies/:id/watchlist", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const movieId = parseInt(req.params.id);
    const userId = req.user!.id;

    const exists = await storage.isInWatchlist(userId, movieId);
    if (exists) {
      await storage.removeFromWatchlist(userId, movieId);
      res.sendStatus(204);
    } else {
      const item = await storage.addToWatchlist(userId, movieId);
      res.status(201).json(item);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}