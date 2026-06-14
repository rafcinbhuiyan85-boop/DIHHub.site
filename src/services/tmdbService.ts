/// <reference types="vite/client" />
const BASE_URL = 'https://api.themoviedb.org/3';

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  release_date: string;
  overview: string;
  runtime?: number;
  genres?: { id: number; name: string }[];
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

// Internal state to hold the API key, since we can't easily use hooks inside this object
let globalApiKey = '';

export const tmdb = {
  setApiKey: (key: string) => {
    globalApiKey = key;
  },
  getApiKey: () => {
    if (globalApiKey) return globalApiKey;
    
    // Fallback to localStorage if state is lost/not yet set
    try {
      const saved = localStorage.getItem('dih_app_settings');
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.tmdbApiKey) return settings.tmdbApiKey;
      }
    } catch (e) {}

    return import.meta.env.VITE_TMDB_API_KEY || 'aa53c992e50edfd89401fdf7f394dae4';
  },
  getTrending: async () => {
    const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${tmdb.getApiKey()}`);
    return res.json();
  },
  getPopular: async () => {
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${tmdb.getApiKey()}`);
    return res.json();
  },
  getTopRated: async () => {
    const res = await fetch(`${BASE_URL}/movie/top_rated?api_key=${tmdb.getApiKey()}`);
    return res.json();
  },
  getByLanguage: async (lang: string) => {
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${tmdb.getApiKey()}&with_original_language=${lang}&sort_by=popularity.desc`);
    return res.json();
  },
  getMovieDetails: async (id: string) => {
    const res = await fetch(`${BASE_URL}/movie/${id}?api_key=${tmdb.getApiKey()}&append_to_response=credits,external_ids`);
    return res.json();
  },
  searchByCast: async (personId: number) => {
    const res = await fetch(`${BASE_URL}/person/${personId}/movie_credits?api_key=${tmdb.getApiKey()}`);
    return res.json();
  },
  searchMovies: async (query: string) => {
    const res = await fetch(`${BASE_URL}/search/movie?api_key=${tmdb.getApiKey()}&query=${encodeURIComponent(query)}`);
    return res.json();
  },
  getImageUrl: (path: string, size: string = 'w500') => {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://via.placeholder.com/500x750?text=No+Image';
  }
};
