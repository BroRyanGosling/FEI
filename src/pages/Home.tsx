import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, Plus, Search, X, Tag as TagIcon } from 'lucide-react';
import { useReviewStore } from '../hooks/useReviewStore';
import { AmbientBackground } from '../components/AmbientBackground';
import { ReviewCard, EmptyState } from '../components/ReviewCard';
import { PreviewSection } from '../components/PreviewSection';
import { EditorSection } from '../components/EditorSection';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

type ViewMode = 'home' | 'preview' | 'editor';

export const Home = () => {
  const { 
    reviews, 
    currentReviewId,
    formData,
    saveCurrentReview,
    loadReviewForEditing,
    clearForm,
    validateForm,
    deleteReview,
    getAllTags,
    getFilteredReviews
  } = useReviewStore();

  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (currentReviewId && viewMode === 'home') {
      setViewMode('preview');
    }
  }, [currentReviewId]);

  const allTags = getAllTags();
  const filteredReviews = getFilteredReviews(searchQuery, selectedTags);

  const handleCreateNew = () => {
    clearForm();
    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode('editor');
      setIsTransitioning(false);
    }, 300);
  };

  const handlePreviewReview = (reviewId: string) => {
    loadReviewForEditing(reviewId);
    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode('preview');
      setIsTransitioning(false);
    }, 300);
  };

  const handleSaveAndPreview = () => {
    const isValid = validateForm();
    
    if (isValid) {
      const success = saveCurrentReview();
      if (success) {
        setIsTransitioning(true);
        setTimeout(() => {
          setViewMode('preview');
          setIsTransitioning(false);
        }, 300);
      }
    }
  };

  const handleReturnHome = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      clearForm();
      setViewMode('home');
      setIsTransitioning(false);
    }, 300);
  };

  const handleExitPreview = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode('home');
      setIsTransitioning(false);
    }, 300);
  };

  const handleEditFromPreview = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setViewMode('editor');
      setIsTransitioning(false);
    }, 300);
  };

  const handleDeleteFromPreview = () => {
    if (currentReviewId) {
      setDeletingReviewId(currentReviewId);
      setDeleteModalOpen(true);
    }
  };

  const handleDeleteFromEditor = () => {
    if (currentReviewId) {
      setDeletingReviewId(currentReviewId);
      setDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingReviewId) {
      deleteReview(deletingReviewId);
      setIsTransitioning(true);
      setTimeout(() => {
        setViewMode('home');
        setIsTransitioning(false);
        setDeletingReviewId(null);
      }, 300);
    }
  };

  const handleDeleteFromHome = (reviewId: string) => {
    setDeletingReviewId(reviewId);
    setDeleteModalOpen(true);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  const hasActiveFilters = searchQuery.trim() || selectedTags.length > 0;

  const handleTransitionComplete = () => {
    if (viewMode === 'preview' || viewMode === 'editor') {
      setIsTransitioning(false);
    }
  };

  if (viewMode === 'preview') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-black relative overflow-hidden"
      >
        <div className="relative z-10">
          <PreviewSection 
            isFullscreen={true} 
            onExitPreview={handleExitPreview}
            onEditReview={handleEditFromPreview}
            onDeleteReview={handleDeleteFromPreview}
          />
        </div>
      </motion.div>
    );
  }

  if (viewMode === 'editor') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-black relative overflow-hidden"
      >
        <AmbientBackground />
        
        <div className="relative z-10 h-screen flex">
          <div className="w-full lg:w-1/2 border-r border-gray-800/50">
            <EditorSection
              onSaveAndPreview={handleSaveAndPreview}
              onReturnHome={handleReturnHome}
              onDeleteReview={handleDeleteFromEditor}
            />
          </div>
          
          <div className="hidden lg:block w-1/2">
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-900/30 to-black p-12">
              <div className="text-center max-w-md">
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-8xl mb-6"
                >
                  🎬
                </motion.div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  沉浸式预览
                </h3>
                
                <p className="text-gray-400 mb-6">
                  填写完信息后点击「保存并预览」，
                  <br />
                  即可欣赏你的专属影评效果
                </p>

                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <span className="text-2xl">📷</span>
                    <div>
                      <h4 className="text-white font-medium mb-1">上传照片</h4>
                      <p className="text-gray-400 text-sm">记录电影票根、剧照等珍贵瞬间</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <span className="text-2xl">✍️</span>
                    <div>
                      <h4 className="text-white font-medium mb-1">记录感受</h4>
                      <p className="text-gray-400 text-sm">写下你的观影心得和推荐理由</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                    <span className="text-2xl">🎥</span>
                    <div>
                      <h4 className="text-white font-medium mb-1">沉浸预览</h4>
                      <p className="text-gray-400 text-sm">以电影级动画效果展示你的影评</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AmbientBackground />

      <div className="relative z-10">
        <header className="px-8 py-12">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-4 mb-2">
                <div className="text-5xl">🎬</div>
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    My Cinema Diary
                  </h1>
                  <p className="text-gray-400 mt-1">记录每一次心动</p>
                </div>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateNew}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all"
            >
              <Plus className="w-5 h-5" />
              新建影评
            </motion.button>
          </div>
        </header>

        <main className="px-8 pb-12">
          <div className="max-w-7xl mx-auto">
            {reviews.length === 0 ? (
              <EmptyState onCreateNew={handleCreateNew} />
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="space-y-6"
              >
                {/* Search and Filter Section */}
                <div className="space-y-4">
                  {/* Search Bar */}
                  <div className="relative max-w-xl">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="搜索电影名称或内容..."
                      className="w-full pl-12 pr-4 py-3 bg-gray-900/50 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Tags Filter */}
                  {allTags.length > 0 && (
                    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-2">
                      <div className="flex items-center gap-2 text-sm text-gray-400 shrink-0">
                        <TagIcon className="w-4 h-4" />
                        <span>标签:</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <AnimatePresence>
                          {allTags.map(tag => (
                            <motion.button
                              key={tag}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              onClick={() => toggleTag(tag)}
                              className={`
                                px-3 py-1.5 rounded-full text-sm font-medium transition-all shrink-0
                                ${selectedTags.includes(tag)
                                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                  : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50 border border-gray-700'
                                }
                              `}
                            >
                              {tag}
                            </motion.button>
                          ))}
                        </AnimatePresence>
                      </div>

                      {hasActiveFilters && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={clearFilters}
                          className="text-xs text-gray-500 hover:text-white transition-colors shrink-0 flex items-center gap-1"
                        >
                          <X className="w-3 h-3" />
                          清除筛选
                        </motion.button>
                      )}
                    </div>
                  )}
                </div>

                {/* Results Info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      我的影评
                    </h2>
                    <p className="text-gray-400 text-sm">
                      {hasActiveFilters 
                        ? `显示 ${filteredReviews.length} / ${reviews.length} 部` 
                        : `共 ${reviews.length} 部 ${reviews.length === 1 ? '电影' : '部电影'}`
                      }
                    </p>
                  </div>
                </div>

                {/* Reviews Grid */}
                {filteredReviews.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center"
                  >
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-xl font-bold text-white mb-2">没有找到匹配的影评</h3>
                    <p className="text-gray-400 mb-4">试试调整搜索条件或标签筛选</p>
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 rounded-lg text-amber-400 text-sm transition-all"
                    >
                      清除筛选
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  >
                    <AnimatePresence mode="popLayout">
                      {filteredReviews.map((review, index) => (
                        <motion.div
                          key={review.id}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0, transition: { duration: 0.4 } }}
                          transition={{ 
                            layout: { type: "spring", stiffness: 350, damping: 30 },
                            opacity: { duration: 0.3 },
                            scale: { duration: 0.3 }
                          }}
                        >
                          <ReviewCard
                            review={review}
                            index={index}
                            onClick={() => handlePreviewReview(review.id)}
                            onDelete={(e) => {
                              e.stopPropagation();
                              handleDeleteFromHome(review.id);
                            }}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>
        </main>

        <footer className="px-8 py-6 border-t border-gray-800/50">
          <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
            <p>用光影记录生活 · My Cinema Diary</p>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {deleteModalOpen && (
          <DeleteConfirmModal
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setDeletingReviewId(null);
            }}
            onConfirm={handleConfirmDelete}
            movieName={deletingReviewId 
              ? reviews.find(r => r.id === deletingReviewId)?.movieName || '' 
              : formData.movieName
            }
          />
        )}
      </AnimatePresence>
    </div>
  );
};

import React from 'react';
