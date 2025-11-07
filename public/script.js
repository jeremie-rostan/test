// DOM Elements
const form = document.getElementById('recommendationForm');
const moodInput = document.getElementById('moodInput');
const dateCheckbox = document.getElementById('dateCheckbox');
const dateRange = document.getElementById('dateRange');
const fromDateInput = document.getElementById('fromDate');
const toDateInput = document.getElementById('toDate');
const genreSelect = document.getElementById('genreSelect');
const submitBtn = form.querySelector('.submit-btn');

const resultsSection = document.getElementById('resultsSection');
const loadingSection = document.getElementById('loadingSection');
const errorSection = document.getElementById('errorSection');

// Event Listeners
dateCheckbox.addEventListener('change', () => {
  dateRange.style.display = dateCheckbox.checked ? 'grid' : 'none';
  if (dateCheckbox.checked) {
    // Set default dates: today and 5 years ago
    const today = new Date();
    const fiveYearsAgo = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate());

    toDateInput.value = today.toISOString().split('T')[0];
    fromDateInput.value = fiveYearsAgo.toISOString().split('T')[0];
  }
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  await getRecommendation();
});

// Main function to get recommendation
async function getRecommendation() {
  try {
    // Validate input
    if (!moodInput.value.trim()) {
      showError('Please tell us how you are feeling');
      return;
    }

    // Show loading state
    form.style.display = 'none';
    resultsSection.style.display = 'none';
    errorSection.style.display = 'none';
    loadingSection.style.display = 'block';

    // Prepare request payload
    const payload = {
      mood: moodInput.value.trim(),
      genre: genreSelect.value || undefined,
    };

    if (dateCheckbox.checked) {
      const from = fromDateInput.value;
      const to = toDateInput.value;
      // Ensure fromDate is earlier than toDate
      payload.fromDate = from < to ? from : to;
      payload.toDate = from < to ? to : from;
    }

    // Make API request
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get recommendation');
    }

    const data = await response.json();
    displayResults(data);
  } catch (error) {
    console.error('Error:', error);
    showError(error.message);
  }
}

// Display results
function displayResults(data) {
  // Hide loading
  loadingSection.style.display = 'none';

  // Populate movie data
  document.getElementById('movieTitle').textContent = data.title;
  document.getElementById('movieYear').textContent = data.releaseDate
    ? new Date(data.releaseDate).getFullYear()
    : 'N/A';
  document.getElementById('movieRating').textContent = `⭐ ${(data.rating || 0).toFixed(1)}/10`;
  document.getElementById('movieSummary').textContent = data.summary || 'No summary available';
  document.getElementById('whyThisMovie').textContent = data.whyThisMovie;

  // Set up links
  if (data.trailerUrl) {
    document.getElementById('trailerLink').href = data.trailerUrl;
  }
  if (data.imdbId) {
    document.getElementById('imdbLink').href = `https://www.imdb.com/title/${data.imdbId}`;
  }

  // Handle trailer embedding
  const trailerEmbed = document.getElementById('trailerEmbed');
  if (data.trailerEmbedUrl) {
    trailerEmbed.src = data.trailerEmbedUrl;
  } else {
    // Fallback: show a message
    trailerEmbed.parentElement.innerHTML = `
      <div class="trailer-placeholder">
        <p>Trailer not found</p>
        <a href="${data.trailerUrl}" target="_blank" class="btn btn-secondary">
          Search on YouTube
        </a>
      </div>
    `;
  }

  // Display reviews
  displayReviews(data.reviews || []);

  // Show results section
  resultsSection.style.display = 'block';

  // Scroll to results
  setTimeout(() => {
    resultsSection.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

// Reset form for new recommendation
function resetForNewRecommendation() {
  form.style.display = 'block';
  resultsSection.style.display = 'none';
  errorSection.style.display = 'none';
  loadingSection.style.display = 'none';
  moodInput.focus();
}

// Display reviews
function displayReviews(reviews) {
  const reviewsContainer = document.getElementById('reviewsContainer');

  if (reviews.length === 0) {
    reviewsContainer.innerHTML = '<p>No reviews available at this time.</p>';
    return;
  }

  reviewsContainer.innerHTML = '<div class="reviews-container">' +
    reviews
      .map(
        (review) => `
      <div class="review">
        <div class="review-header">
          <span class="review-source">${escapeHtml(review.author)}</span>
          ${review.rating ? `<span class="review-rating">${review.rating}/10</span>` : ''}
        </div>
        <p class="review-text">"${escapeHtml(review.content)}"</p>
        ${review.url ? `<a href="${review.url}" target="_blank" class="review-link">Read full review →</a>` : ''}
      </div>
    `
      )
      .join('') +
    '</div>';
}

// Show error message
function showError(message) {
  errorSection.style.display = 'block';
  document.getElementById('errorMessage').textContent = message;
  form.style.display = 'block';
  resultsSection.style.display = 'none';
  loadingSection.style.display = 'none';

  errorSection.scrollIntoView({ behavior: 'smooth' });
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize date inputs with reasonable defaults
function initializeDateInputs() {
  const today = new Date();
  const maxDate = today.toISOString().split('T')[0];
  toDateInput.max = maxDate;
  fromDateInput.max = maxDate;
}

// Run initialization
document.addEventListener('DOMContentLoaded', initializeDateInputs);
