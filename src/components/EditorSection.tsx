import { ImageUploader } from './ImageUploader';
import { useReviewStore } from '../hooks/useReviewStore';
import { Film, FileText, Save, ArrowLeft, AlertCircle, CheckCircle, Tag, X, Trash2 } from 'lucide-react';
import { useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface EditorSectionProps {
  onSaveAndPreview: () => void;
  onReturnHome: () => void;
  onDeleteReview?: () => void;
}

export const EditorSection: React.FC<EditorSectionProps> = ({ 
  onSaveAndPreview,
  onReturnHome,
  onDeleteReview
}) => {
  const { 
    formData,
    currentReviewId,
    setMovieName, 
    setContent, 
    addTag,
    removeTag,
    validationErrors,
    clearValidationErrors
  } = useReviewStore();

  useEffect(() => {
    if (formData.movieName.trim() && validationErrors.movieName) {
      clearValidationErrors();
    }
  }, [formData.movieName, validationErrors.movieName, clearValidationErrors]);

  useEffect(() => {
    if (formData.content.trim() && validationErrors.content) {
      clearValidationErrors();
    }
  }, [formData.content, validationErrors.content, clearValidationErrors]);

  useEffect(() => {
    if (formData.images.length > 0 && validationErrors.images) {
      clearValidationErrors();
    }
  }, [formData.images.length, validationErrors.images, clearValidationErrors]);

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value.trim();
      if (value) {
        addTag(value);
        (e.target as HTMLInputElement).value = '';
      }
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900/50 to-black">
      {/* Header */}
      <div className="p-6 border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {useReviewStore.getState().currentReviewId ? '编辑影评' : '新建影评'}
              </h2>
              <p className="text-xs text-gray-400">记录你的观影感受</p>
            </div>
          </div>
          
          {currentReviewId && onDeleteReview && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDeleteReview}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-600/30 border border-red-500/50 rounded-lg text-red-400 transition-all text-sm"
            >
              <Trash2 className="w-4 h-4" />
              删除此影评
            </motion.button>
          )}
          
          {validationErrors && Object.keys(validationErrors).length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-red-400">请完善信息</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6">
        <div className="space-y-6 max-w-2xl">
          {/* Image Uploader */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <FileText className="w-4 h-4" />
              观影照片
              <span className="text-red-400">*</span>
            </label>
            <ImageUploader />
          </div>

          {/* Movie Name */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              电影名称
              <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.movieName}
                onChange={(e) => setMovieName(e.target.value)}
                placeholder="输入电影名称..."
                className={`
                  w-full px-4 py-3 rounded-xl text-white placeholder-gray-500 focus:outline-none transition-all pr-10
                  ${validationErrors.movieName 
                    ? 'bg-red-900/20 border border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                    : 'bg-gray-900/50 border border-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                  }
                `}
              />
              {formData.movieName && !validationErrors.movieName && (
                <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
              )}
            </div>
            {validationErrors.movieName && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                {validationErrors.movieName}
              </motion.p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
              <Tag className="w-4 h-4" />
              标签
              <span className="text-xs text-gray-500">(可选，1-3个)</span>
            </label>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {formData.tags.map((tag, index) => (
                    <motion.div
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/40 rounded-full text-amber-400 text-sm flex items-center gap-2"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(index)}
                        className="hover:bg-amber-500/30 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {formData.tags.length < 3 && (
                <input
                  type="text"
                  placeholder="输入标签后按 Enter 添加..."
                  onKeyDown={handleTagKeyDown}
                  className="w-full px-4 py-2.5 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
              )}
              
              <div className="flex flex-wrap gap-2">
                {['科幻', '爱情', '动作', '喜剧', '悬疑', '动画', '年度最佳'].map(suggestion => {
                  if (formData.tags.includes(suggestion)) return null;
                  if (formData.tags.length >= 3) return null;
                  
                  return (
                    <button
                      key={suggestion}
                      onClick={() => addTag(suggestion)}
                      className="px-3 py-1 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-full text-gray-400 text-xs transition-all hover:text-amber-400 hover:border-amber-500/40"
                    >
                      + {suggestion}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Review Content */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-300">
              观影感受
              <span className="text-red-400 ml-1">*</span>
            </label>
            <div className="relative">
              <textarea
                value={formData.content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="写下你的观影感受...

可以描述：
• 电影中最触动你的场景
• 演员的精彩表演
• 带给你的思考或感悟
• 推荐的观影理由"
                rows={12}
                className={`
                  w-full px-4 py-3 rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all resize-none
                  ${validationErrors.content 
                    ? 'bg-red-900/20 border border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500' 
                    : 'bg-gray-900/50 border border-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
                  }
                `}
              />
              {formData.content && !validationErrors.content && (
                <CheckCircle className="absolute right-3 top-3 w-5 h-5 text-green-400" />
              )}
            </div>
            {validationErrors.content && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                {validationErrors.content}
              </motion.p>
            )}
          </div>

          {/* Tips */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
            <h4 className="text-amber-400 text-sm font-medium mb-2 flex items-center gap-2">
              <span className="text-lg">💡</span> 写作提示
            </h4>
            <ul className="text-gray-400 text-xs space-y-1">
              <li>• 描述最触动你的场景或台词</li>
              <li>• 分享电影带给你的情感共鸣</li>
              <li>• 可以加入个人感悟和推荐理由</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 border-t border-gray-800/50 bg-gradient-to-t from-black to-transparent space-y-3">
        {/* Primary Action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSaveAndPreview}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
        >
          <Save className="w-5 h-5" />
          保存并预览
        </motion.button>

        {/* Secondary Action */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReturnHome}
          className="w-full py-3 px-6 bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 text-gray-300 font-medium rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          返回主页
        </motion.button>
      </div>
    </div>
  );
};
