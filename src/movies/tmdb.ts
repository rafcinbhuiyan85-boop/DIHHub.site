const getApiKey = () => {
  // Try to get from localStorage first (settings)
  try {
    const saved = localStorage.getItem('dih_app_settings');
    if (saved) {
      const settings = JSON.parse(saved);
      if (settings.tmdbApiKey) return settings.tmdbApiKey;
    }
  } catch (e) {}
  
  return import.meta.env.VITE_TMDB_API_KEY || 'aa53c992e50edfd89401fdf7f394dae4';
};

const BASE_URL = 'https://api.themoviedb.org/3';

export const IMAGE_BASE_POSTER = 'https://image.tmdb.org/t/p/w500';
export const IMAGE_BASE_BACKDROP = 'https://image.tmdb.org/t/p/original';

export interface Movie {
  id: number; title: string; overview: string;
  poster_path: string | null; backdrop_path: string | null;
  vote_average: number; release_date: string;
  genre_ids: number[]; original_language: string;
}
export interface MovieDetail extends Movie {
  tagline: string; runtime: number;
  genres: { id: number; name: string }[];
  credits?: { cast: { id: number; name: string; character: string; profile_path: string | null }[] };
  similar?: { results: Movie[] };
}
export interface Genre { id: number; name: string; }
export interface MovieVideo { id: string; key: string; name: string; site: string; type: string; official: boolean; }
export interface PaginatedResult<T> { page: number; results: T[]; total_pages: number; total_results: number; }

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("TMDB API key is missing.");
  const searchParams = new URLSearchParams({ api_key: apiKey, ...params });
  const res = await fetch(`${BASE_URL}${endpoint}?${searchParams.toString()}`);
  if (!res.ok) throw new Error(`TMDB API Error: ${res.statusText}`);
  return res.json();
}

export const tmdb = {
  getTrending: () => fetchTMDB<PaginatedResult<Movie>>('/trending/movie/week'),
  getPopular: () => fetchTMDB<PaginatedResult<Movie>>('/movie/popular'),
  getTopRated: () => fetchTMDB<PaginatedResult<Movie>>('/movie/top_rated'),
  getNowPlaying: () => fetchTMDB<PaginatedResult<Movie>>('/movie/now_playing'),
  getUpcoming: () => fetchTMDB<PaginatedResult<Movie>>('/movie/upcoming'),
  getMovieDetail: (id: string) => fetchTMDB<MovieDetail>(`/movie/${id}`, { append_to_response: 'credits,similar' }),
  getMovieVideos: (id: string) => fetchTMDB<{ results: MovieVideo[] }>(`/movie/${id}/videos`),
  searchMovies: (query: string) => fetchTMDB<PaginatedResult<Movie>>('/search/movie', { query }),
  discoverByGenre: (genreId: string) => fetchTMDB<PaginatedResult<Movie>>('/discover/movie', { with_genres: genreId }),
  discoverByLanguage: (lang: string) => fetchTMDB<PaginatedResult<Movie>>('/discover/movie', { with_original_language: lang, sort_by: 'popularity.desc' }),
  getGenres: () => fetchTMDB<{genres: Genre[]}>('/genre/movie/list'),
  getPersonMovies: (personId: string) => fetchTMDB<{ cast: Movie[] }>(`/person/${personId}/movie_credits`),
  getPersonDetail: (personId: string) => fetchTMDB<{ id: number; name: string; profile_path: string | null; biography: string; birthday: string | null; place_of_birth: string | null }>(`/person/${personId}`),
};
