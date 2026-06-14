import { motion } from 'motion/react';
import { Star } from 'lucide-react';

interface Movie {
  id: number;
  title: string;
  name?: string;
  poster: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  type?: string;
}

interface MovieCardProps {
  movie: Movie;
  onClick: (movie: Movie) => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="relative flex-none w-40 md:w-56 aspect-[2/3] rounded-md overflow-hidden cursor-pointer bg-zinc-900 group shadow-lg"
      onClick={() => onClick(movie)}
    >
      <img
        src={movie.poster || 'https://via.placeholder.com/500x750?text=No+Poster'}
        alt={movie.title || movie.name}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:brightness-50"
        loading="lazy"
      />
      
      <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/80 to-transparent">
        <h4 className="text-sm font-bold truncate">{movie.title || movie.name}</h4>
        <div className="flex items-center gap-1 mt-1">
          <Star size={12} className="text-yellow-500 fill-yellow-500" />
          <span className="text-xs">{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>
    </motion.div>
  );
}
