import { motion } from 'framer-motion';
import { Calendar, Film, Trash2 } from 'lucide-react';
import { MovieReview } from '../types/review';

interface ReviewCardProps {
  review: MovieReview;
  onClick: () => void;
  onDelete?: (e: React.MouseEvent) => void;
  index?: number;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ review, onClick, onDelete, index = 0 }) => {
  const formattedDate = new Date(review.watchTime).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const shortContent = review.content.length > 100 
    ? review.content.substring(0, 100) + '...' 
    : review.content;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete) {
      onDelete(e);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-2xl"
      style={{ aspectRatio: '3/4' }}
    >
      <div className="absolute inset-0">
        {review.images.length > 0 ? (
          <img
            src={review.images[0]}
            alt={review.movieName}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
            <Film className="w-16 h-16 text-gray-600" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      <div className="absolute inset-0 p-6 flex flex-col justify-between">
        {/* Top section with tags */}
        <div className="flex flex-wrap gap-1.5">
          {review.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-amber-500/30 backdrop-blur-sm rounded-full text-xs text-amber-300 border border-amber-500/30"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom section with content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
          className="space-y-3"
        >
          <h3 className="text-2xl font-bold text-white leading-tight group-hover:text-amber-400 transition-colors">
            {review.movieName}
          </h3>
          
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>

          {shortContent && (
            <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {shortContent}
            </p>
          )}
        </motion.div>
      </div>

      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
          <span className="text-xs text-white font-medium">预览</span>
        </div>
      </div>

      <div className="absolute inset-0 border-2 border-amber-500/0 group-hover:border-amber-500/30 rounded-2xl transition-colors duration-300 pointer-events-none" />

      {onDelete && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ opacity: 0, scale: 0.8 }}
          whileFocus={{ opacity: 1, scale: 1 }}
          onClick={handleDeleteClick}
          className="absolute bottom-4 right-4 p-3 bg-red-500/80 hover:bg-red-600 backdrop-blur-md rounded-full border border-red-400/50 opacity-0 group-hover:opacity-100 transition-all z-20"
          style={{ pointerEvents: 'auto' }}
          title="删除影评"
        >
          <Trash2 className="w-5 h-5 text-white" />
        </motion.button>
      )}
    </motion.div>
  );
};

interface EmptyStateProps {
  onCreateNew: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onCreateNew }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-center py-20 px-8"
    >
      <motion.div
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="text-8xl mb-6"
      >
        🎬
      </motion.div>
      
      <h2 className="text-3xl font-bold text-white mb-3 text-center">
        还没有任何影评
      </h2>
      
      <p className="text-gray-400 text-center mb-8 max-w-md">
        开始记录你的观影之旅吧！每一部电影都值得被铭记。
      </p>
      
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onCreateNew}
        className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all"
      >
        <Film className="w-5 h-5" />
        创建你的第一部影评
      </motion.button>
    </motion.div>
  );
};
