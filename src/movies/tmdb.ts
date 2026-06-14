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
  media_type?: 'movie' | 'tv';
}
export interface MovieDetail extends Movie {
  tagline: string; runtime: number;
  genres: { id: number; name: string }[];
  credits?: { cast: { id: number; name: string; character: string; profile_path: string | null }[] };
  similar?: { results: Movie[] };
  seasons?: { season_number: number; episode_count: number; name: string }[];
}
export interface Genre { id: number; name: string; }
export interface MovieVideo { id: string; key: string; name: string; site: string; type: string; official: boolean; }
export interface PaginatedResult<T> { page: number; results: T[]; total_pages: number; total_results: number; }

export function mapTVToMovie(tv: any): Movie {
  return {
    id: tv.id,
    title: tv.name || tv.original_name || 'Untitled TV Show',
    overview: tv.overview || '',
    poster_path: tv.poster_path || null,
    backdrop_path: tv.backdrop_path || null,
    vote_average: tv.vote_average || 0,
    release_date: tv.first_air_date || '',
    genre_ids: tv.genre_ids || [],
    original_language: tv.original_language || 'en',
    media_type: 'tv'
  };
}

export function mapTVDetailToMovieDetail(tv: any): MovieDetail {
  return {
    id: tv.id,
    title: tv.name || tv.original_name || 'Untitled TV Show',
    overview: tv.overview || '',
    poster_path: tv.poster_path || null,
    backdrop_path: tv.backdrop_path || null,
    vote_average: tv.vote_average || 0,
    release_date: tv.first_air_date || '',
    genre_ids: (tv.genres || []).map((g: any) => g.id),
    original_language: tv.original_language || 'en',
    media_type: 'tv',
    tagline: tv.tagline || '',
    runtime: tv.episode_run_time?.[0] || 45,
    genres: tv.genres || [],
    credits: tv.credits || { cast: [] },
    similar: tv.similar ? { results: (tv.similar.results || []).map(mapTVToMovie) } : { results: [] },
    seasons: tv.seasons || []
  };
}

async function fetchTMDB<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("TMDB API key is missing.");
  const searchParams = new URLSearchParams({ api_key: apiKey, ...params });
  const res = await fetch(`${BASE_URL}${endpoint}?${searchParams.toString()}`);
  if (!res.ok) throw new Error(`TMDB API Error: ${res.statusText}`);
  return res.json();
}

export const tmdb = {
  getTrending: () => fetchTMDB<PaginatedResult<Movie>>('/trending/movie/week').then(res => ({
    ...res,
    results: res.results.map(m => ({ ...m, media_type: 'movie' as const }))
  })),
  getPopular: () => fetchTMDB<PaginatedResult<Movie>>('/movie/popular').then(res => ({
    ...res,
    results: res.results.map(m => ({ ...m, media_type: 'movie' as const }))
  })),
  getTopRated: () => fetchTMDB<PaginatedResult<Movie>>('/movie/top_rated').then(res => ({
    ...res,
    results: res.results.map(m => ({ ...m, media_type: 'movie' as const }))
  })),
  getNowPlaying: () => fetchTMDB<PaginatedResult<Movie>>('/movie/now_playing').then(res => ({
    ...res,
    results: res.results.map(m => ({ ...m, media_type: 'movie' as const }))
  })),
  getUpcoming: () => fetchTMDB<PaginatedResult<Movie>>('/movie/upcoming').then(res => ({
    ...res,
    results: res.results.map(m => ({ ...m, media_type: 'movie' as const }))
  })),
  getMovieDetail: (id: string) => {
    if (id.startsWith('tv-')) {
      const realId = id.replace('tv-', '');
      return fetchTMDB<any>(`/tv/${realId}`, { append_to_response: 'credits,similar' })
        .then(mapTVDetailToMovieDetail);
    }
    return fetchTMDB<MovieDetail>(`/movie/${id}`, { append_to_response: 'credits,similar' }).then(m => ({ ...m, media_type: 'movie' as const }));
  },
  getMovieVideos: (id: string) => {
    const isTV = id.startsWith('tv-');
    const realId = isTV ? id.replace('tv-', '') : id;
    return fetchTMDB<{ results: MovieVideo[] }>(`/${isTV ? 'tv' : 'movie'}/${realId}/videos`);
  },
  searchMovies: (query: string, searchTV: boolean = false) => {
    if (searchTV) {
      return fetchTMDB<PaginatedResult<any>>('/search/tv', { query }).then(res => ({
        page: res.page,
        total_pages: res.total_pages,
        total_results: res.total_results,
        results: res.results.map(mapTVToMovie)
      }));
    }
    return fetchTMDB<PaginatedResult<Movie>>('/search/movie', { query }).then(res => ({
      ...res,
      results: res.results.map(m => ({ ...m, media_type: 'movie' as const }))
    }));
  },
  discoverByGenre: (genreId: string, isTV: boolean = false) => {
    if (isTV) {
      return fetchTMDB<PaginatedResult<any>>('/discover/tv', { with_genres: genreId }).then(res => ({
        page: res.page,
        total_pages: res.total_pages,
        total_results: res.total_results,
        results: res.results.map(mapTVToMovie)
      }));
    }
    return fetchTMDB<PaginatedResult<Movie>>('/discover/movie', { with_genres: genreId }).then(res => ({
      ...res,
      results: res.results.map(m => ({ ...m, media_type: 'movie' as const }))
    }));
  },
  discoverByLanguage: (lang: string) => fetchTMDB<PaginatedResult<Movie>>('/discover/movie', { with_original_language: lang, sort_by: 'popularity.desc' }),
  getGenres: () => fetchTMDB<{genres: Genre[]}>('/genre/movie/list'),
  getPersonMovies: (personId: string) => fetchTMDB<{ cast: any[] }>(`/person/${personId}/combined_credits`).then(res => {
    return {
      cast: (res.cast || []).map(item => {
        if (item.media_type === 'tv') {
          return mapTVToMovie(item);
        }
        return { ...item, media_type: 'movie' as const };
      })
    };
  }),
  getPersonDetail: (personId: string) => fetchTMDB<{ id: number; name: string; profile_path: string | null; biography: string; birthday: string | null; place_of_birth: string | null }>(`/person/${personId}`),

  // TV integration specific methods
  getTrendingTV: () => fetchTMDB<PaginatedResult<any>>('/trending/tv/week').then(res => ({
    page: res.page,
    total_pages: res.total_pages,
    total_results: res.total_results,
    results: res.results.map(mapTVToMovie)
  })),
  getPopularTV: () => fetchTMDB<PaginatedResult<any>>('/tv/popular').then(res => ({
    page: res.page,
    total_pages: res.total_pages,
    total_results: res.total_results,
    results: res.results.map(mapTVToMovie)
  })),
  getTopRatedTV: () => fetchTMDB<PaginatedResult<any>>('/tv/top_rated').then(res => ({
    page: res.page,
    total_pages: res.total_pages,
    total_results: res.total_results,
    results: res.results.map(mapTVToMovie)
  })),
  discoverAnimationSeries: () => fetchTMDB<PaginatedResult<any>>('/discover/tv', { with_genres: '16', sort_by: 'popularity.desc' }).then(res => ({
    page: res.page,
    total_pages: res.total_pages,
    total_results: res.total_results,
    results: res.results.map(mapTVToMovie)
  })),
  discoverAnimeTrending: () => fetchTMDB<PaginatedResult<any>>('/discover/tv', { with_genres: '16', with_original_language: 'ja', sort_by: 'popularity.desc' }).then(res => ({
    page: res.page,
    total_pages: res.total_pages,
    total_results: res.total_results,
    results: res.results.map(mapTVToMovie)
  })),
  discoverKidsAnimation: () => fetchTMDB<PaginatedResult<any>>('/discover/tv', { with_genres: '16,10762', sort_by: 'popularity.desc' }).then(res => ({
    page: res.page,
    total_pages: res.total_pages,
    total_results: res.total_results,
    results: res.results.map(mapTVToMovie)
  }))
};
