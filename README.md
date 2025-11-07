# 🎬 Mood-Based Movie Recommendation App

A web application that recommends movies and documentaries based on how you're feeling. The app uses AI to understand your mood and provides personalized recommendations with summaries, YouTube trailer embeds, and aggregated reviews.

## Features

✨ **AI-Powered Recommendations**
- Uses Claude AI to understand your mood and feelings
- Generates personalized movie recommendations based on emotional context
- Supports optional genre filtering

🎥 **Rich Movie Information**
- Displays movie summaries and ratings
- Embedded YouTube trailer player
- Direct links to IMDb and YouTube search
- Movie release year and vote ratings

⭐ **Reviews & Ratings**
- Aggregates reviews from The Movie Database (TMDb)
- Shows reviewer ratings and comments
- Direct links to full reviews

📅 **Date Filtering**
- Optional date range selection for recent movies
- Default "last 5 years" preset
- Customize your search window

## Tech Stack

**Frontend:**
- HTML5, CSS3, JavaScript (Vanilla)
- Responsive design with CSS Grid/Flexbox
- Smooth animations and transitions

**Backend:**
- Node.js with Express.js
- Claude AI API (Anthropic) for recommendations and explanations
- The Movie Database (TMDb) API for movie data and reviews
- Axios for HTTP requests

## Prerequisites

Before you begin, make sure you have:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Anthropic API Key** - [Get one here](https://console.anthropic.com/)
4. **TMDb API Key** - [Get one here](https://www.themoviedb.org/settings/api)

## Installation

### 1. Clone or Download the Project

```bash
cd your-project-directory
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with your API keys:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
TMDB_API_KEY=your_tmdb_api_key_here
PORT=3000
```

**How to get your API keys:**

**Anthropic API Key:**
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign up or log in
3. Navigate to API Keys
4. Create a new key and copy it

**TMDb API Key:**
1. Go to [TMDb](https://www.themoviedb.org/)
2. Create an account
3. Go to Settings → API
4. Request an API key (Accept the terms, fill out the form)
5. Copy your API key

### 4. Start the Server

```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

1. **Open the App**: Navigate to `http://localhost:3000` in your browser
2. **Describe Your Mood**: Type how you're feeling (e.g., "I'm sad and need a good cry", "I want to laugh and have a good time")
3. **Optional Settings**:
   - Check "Prefer recent movies" to filter by date range
   - Select a preferred genre from the dropdown
4. **Get Recommendation**: Click "Get Recommendation"
5. **Explore**: View the movie details, watch the trailer, and read reviews

## Project Structure

```
.
├── public/
│   ├── index.html          # Main HTML template
│   ├── styles.css          # All styling
│   └── script.js           # Frontend JavaScript
├── server.js               # Express server and API endpoints
├── package.json            # Project dependencies
├── .env                    # Environment variables (create this)
└── README.md              # This file
```

## API Endpoints

### POST `/api/recommend`

Get a movie recommendation based on mood.

**Request Body:**
```json
{
  "mood": "feeling melancholic and thoughtful",
  "genre": "drama",
  "fromDate": "2020-01-01",
  "toDate": "2025-01-01"
}
```

**Response:**
```json
{
  "title": "Movie Title",
  "releaseDate": "2023-05-15",
  "rating": 8.2,
  "summary": "Movie plot summary...",
  "whyThisMovie": "This movie is perfect for you because...",
  "reviews": [
    {
      "author": "Reviewer Name",
      "content": "Review excerpt...",
      "rating": 8.5,
      "url": "https://..."
    }
  ],
  "trailerUrl": "https://www.youtube.com/results?search_query=...",
  "trailerEmbedUrl": "https://www.youtube.com/embed/VIDEO_ID",
  "imdbId": "tt1234567",
  "posterUrl": "https://image.tmdb.org/..."
}
```

### GET `/api/health`

Health check endpoint.

## Features in Detail

### AI-Powered Recommendations

The app uses Claude 3.5 Sonnet to:
1. **Generate recommendations**: Understand your mood and suggest an appropriate movie
2. **Explain choices**: Provide personalized reasoning for why that movie matches your mood

### Movie Data Integration

Leverages The Movie Database (TMDb) to provide:
- Comprehensive movie information
- Release dates and ratings
- Movie summaries and overviews
- User reviews and ratings
- IMDb IDs for external links

### YouTube Trailer Embedding

The app searches for and embeds YouTube trailers directly in the page for easy preview.

## Troubleshooting

### "API Key Error" or "Unauthorized"

- Check that your `.env` file exists in the root directory
- Verify your API keys are correct and not expired
- For Anthropic: ensure your account has available credits
- For TMDb: verify your API key is approved and active

### "Movie not found"

- The AI generated a recommendation that doesn't exist in TMDb's database
- Try being more specific about your mood or genre
- Try again - the AI will generate a different recommendation

### Trailer not embedding

- This is normal if the exact YouTube video ID cannot be found
- Use the "Watch Trailer on YouTube" link as a fallback
- The link will search YouTube for the trailer

### Port already in use

If port 3000 is busy, change the PORT in your `.env` file:
```env
PORT=3001
```

## Customization Ideas

- Add user authentication to save favorite recommendations
- Implement a database to store recommendation history
- Add more genres and filtering options
- Integrate with streaming platforms to show where to watch
- Add multi-language support
- Implement ratings and user feedback system
- Add surprise me mode for random recommendations based on mood

## Rate Limits

- **Anthropic API**: Free tier has rate limits. Check your usage in the console
- **TMDb API**: Free tier allows up to 40 requests per 10 seconds

## License

This project is open source and available for personal use.

## Support

If you encounter issues:

1. Check the browser console for error messages (F12)
2. Check the server terminal for backend errors
3. Verify your API keys are valid
4. Ensure you have internet connectivity
5. Try clearing your browser cache

## Future Enhancements

- [ ] Streaming platform integration (Netflix, Prime, Disney+, etc.)
- [ ] User authentication and recommendation history
- [ ] Mobile app version
- [ ] Collaborative recommendations (friend mode)
- [ ] TV series recommendations
- [ ] Multi-language support
- [ ] Advanced mood analysis with follow-up questions
- [ ] Integration with movie rating sites

---

Enjoy discovering your next favorite movie! 🍿🎬
