require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const { Anthropic } = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// TMDB API configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Helper function to search movies on TMDB
async function searchMoviesOnTMDB(query, filters = {}) {
  try {
    const params = {
      api_key: TMDB_API_KEY,
      query: query,
      include_adult: false,
    };

    if (filters.fromDate) {
      params['primary_release_date.gte'] = filters.fromDate;
    }
    if (filters.toDate) {
      params['primary_release_date.lte'] = filters.toDate;
    }
    if (filters.genre) {
      params.with_genres = getGenreId(filters.genre);
    }

    const response = await axios.get(`${TMDB_BASE_URL}/search/multi`, { params });
    return response.data.results.filter(
      (r) => r.media_type === 'movie' || r.media_type === 'tv'
    );
  } catch (error) {
    console.error('TMDB search error:', error.message);
    return [];
  }
}

// Get movie details from TMDB
async function getMovieDetails(movieId) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: { api_key: TMDB_API_KEY },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error.message);
    return null;
  }
}

// Get movie reviews from TMDB
async function getMovieReviews(movieId) {
  try {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}/reviews`, {
      params: { api_key: TMDB_API_KEY },
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    return [];
  }
}

// Map genre string to TMDB genre ID
function getGenreId(genre) {
  const genreMap = {
    drama: 18,
    comedy: 35,
    thriller: 53,
    'sci-fi': 878,
    horror: 27,
    romance: 10749,
    documentary: 99,
    action: 28,
    animation: 16,
  };
  return genreMap[genre.toLowerCase()] || '';
}

// Use Claude to generate a recommendation based on mood
async function generateRecommendationFromMood(mood, genre) {
  try {
    const prompt = `You are a movie recommendation expert. Based on the user's mood and feelings, suggest a specific movie or documentary title that would be perfect for them.

User's mood/feeling: "${mood}"
${genre ? `Preferred genre: ${genre}` : ''}

Respond with ONLY the movie title (just the name, nothing else). Make sure it's a real, well-known movie or documentary.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const movieTitle = message.content[0].text.trim().replace(/^['"]|['"]$/g, '');
    return movieTitle;
  } catch (error) {
    console.error('Error generating recommendation:', error.message);
    throw error;
  }
}

// Use Claude to explain why this movie is good for the user's mood
async function generateExplanation(movieTitle, mood) {
  try {
    const prompt = `You are a movie recommendation expert. Briefly explain in 2-3 sentences why the movie "${movieTitle}" would be perfect for someone who is feeling: "${mood}"

Keep it concise and engaging.`;

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return message.content[0].text.trim();
  } catch (error) {
    console.error('Error generating explanation:', error.message);
    throw error;
  }
}

// Search YouTube for trailer
async function searchYouTubeTrailer(movieTitle) {
  try {
    // Since we don't have direct YouTube API, we'll construct a YouTube search URL
    // In production, you'd want to use the YouTube API
    const searchQuery = `${movieTitle} trailer`;
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
      searchQuery
    )}`;

    // For embedded trailer, we'll use a common pattern for embedding YouTube trailers
    const videoId = await findYouTubeVideoId(movieTitle);
    return {
      searchUrl: youtubeSearchUrl,
      embeddedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : null,
      videoId: videoId,
    };
  } catch (error) {
    console.error('Error searching YouTube:', error.message);
    return {
      searchUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(
        movieTitle + ' trailer'
      )}`,
      embeddedUrl: null,
      videoId: null,
    };
  }
}

// Helper to find YouTube video ID (simplified approach)
async function findYouTubeVideoId(movieTitle) {
  // In a production app, use YouTube Data API v3
  // For now, this is a placeholder - the frontend will handle YouTube search
  return null;
}

// Main recommendation endpoint
app.post('/api/recommend', async (req, res) => {
  try {
    const { mood, fromDate, toDate, genre } = req.body;

    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    // Step 1: Generate movie recommendation based on mood
    console.log('Generating recommendation based on mood...');
    const movieTitle = await generateRecommendationFromMood(mood, genre);
    console.log('Recommended movie:', movieTitle);

    // Step 2: Search for the movie on TMDB
    const filters = {};
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;
    if (genre) filters.genre = genre;

    const searchResults = await searchMoviesOnTMDB(movieTitle, filters);
    if (searchResults.length === 0) {
      return res.status(404).json({
        error: 'Movie not found. Please try again.',
      });
    }

    const movie = searchResults[0];
    const movieId = movie.id;

    // Step 3: Get detailed movie information
    const movieDetails = await getMovieDetails(movieId);

    // Step 4: Get reviews
    const reviews = await getMovieReviews(movieId);

    // Step 5: Search for YouTube trailer
    const trailerInfo = await searchYouTubeTrailer(movieTitle);

    // Step 6: Generate explanation
    const explanation = await generateExplanation(movieTitle, mood);

    // Format reviews
    const formattedReviews = reviews.slice(0, 3).map((review) => ({
      author: review.author,
      content: review.content.substring(0, 200) + '...',
      rating: review.author_details?.rating || null,
      url: review.url,
    }));

    // Response
    res.json({
      title: movieDetails.title || movieTitle,
      releaseDate: movieDetails.release_date,
      rating: movieDetails.vote_average,
      summary: movieDetails.overview,
      whyThisMovie: explanation,
      reviews: formattedReviews,
      trailerUrl: trailerInfo.searchUrl,
      trailerEmbedUrl: trailerInfo.embeddedUrl,
      imdbId: movieDetails.imdb_id,
      posterUrl: movieDetails.poster_path
        ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
        : null,
    });
  } catch (error) {
    console.error('Error in /api/recommend:', error);
    res.status(500).json({
      error: 'Failed to generate recommendation. Please try again.',
      details: error.message,
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure you have set ANTHROPIC_API_KEY and TMDB_API_KEY in your .env file');
});
