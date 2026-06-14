import { useQuery } from '@tanstack/react-query';
import { tmdb } from './tmdb';

export const useTrendingMovies = () => useQuery({ queryKey: ['movies','trending'], queryFn: () => tmdb.getTrending() });
export const usePopularMovies = () => useQuery({ queryKey: ['movies','popular'], queryFn: () => tmdb.getPopular() });
export const useTopRatedMovies = () => useQuery({ queryKey: ['movies','top_rated'], queryFn: () => tmdb.getTopRated() });
export const useNowPlaying = () => useQuery({ queryKey: ['movies','now_playing'], queryFn: () => tmdb.getNowPlaying() });
export const useUpcoming = () => useQuery({ queryKey: ['movies','upcoming'], queryFn: () => tmdb.getUpcoming() });
export const useMovieDetail = (id: string) => useQuery({ queryKey: ['movie',id], queryFn: () => tmdb.getMovieDetail(id), enabled: !!id });
export const useSearchMovies = (query: string, searchTV: boolean = false) => useQuery({ queryKey: ['movies','search',query,searchTV], queryFn: () => tmdb.searchMovies(query, searchTV), enabled: !!query });
export const useDiscoverByGenre = (genreId: string, isTV: boolean = false) => useQuery({ queryKey: ['movies','genre',genreId,isTV], queryFn: () => tmdb.discoverByGenre(genreId, isTV), enabled: !!genreId });
export const useDiscoverByLanguage = (lang: string) => useQuery({ queryKey: ['movies','language',lang], queryFn: () => tmdb.discoverByLanguage(lang), enabled: !!lang, staleTime: 5*60*1000 });
export const useGenres = () => useQuery({ queryKey: ['genres'], queryFn: () => tmdb.getGenres(), staleTime: Infinity });
export const usePersonMovies = (personId: string) => useQuery({ queryKey: ['person',personId,'movies'], queryFn: () => tmdb.getPersonMovies(personId), enabled: !!personId });
export const usePersonDetail = (personId: string) => useQuery({ queryKey: ['person',personId], queryFn: () => tmdb.getPersonDetail(personId), enabled: !!personId });

// TV Hooks
export const useTrendingTV = () => useQuery({ queryKey: ['tv','trending'], queryFn: () => tmdb.getTrendingTV() });
export const usePopularTV = () => useQuery({ queryKey: ['tv','popular'], queryFn: () => tmdb.getPopularTV() });
export const useTopRatedTV = () => useQuery({ queryKey: ['tv','top_rated'], queryFn: () => tmdb.getTopRatedTV() });
export const useDiscoverAnimationSeries = () => useQuery({ queryKey: ['tv','animations'], queryFn: () => tmdb.discoverAnimationSeries() });
export const useDiscoverAnimeTrending = () => useQuery({ queryKey: ['tv','anime_trending'], queryFn: () => tmdb.discoverAnimeTrending() });
export const useDiscoverKidsAnimation = () => useQuery({ queryKey: ['tv','kids_animation'], queryFn: () => tmdb.discoverKidsAnimation() });

