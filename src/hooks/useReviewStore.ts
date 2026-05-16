import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MovieReview, ReviewFormData, createEmptyReview, createReviewFromForm, updateReviewFromForm } from '../types/review';

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

interface ReviewState {
  reviews: MovieReview[];
  currentReviewId: string | null;
  formData: ReviewFormData;
  isEditing: boolean;
  validationErrors: {
    movieName?: string;
    content?: string;
    images?: string;
    tags?: string;
  };
  
  addImage: (image: string) => void;
  removeImage: (index: number) => void;
  setMovieName: (name: string) => void;
  setContent: (content: string) => void;
  setWatchTime: (time: number) => void;
  addTag: (tag: string) => void;
  removeTag: (index: number) => void;
  setTags: (tags: string[]) => void;
  
  saveCurrentReview: () => boolean;
  deleteReview: (id: string) => void;
  loadReviewForEditing: (id: string) => void;
  clearForm: () => void;
  
  validateForm: () => boolean;
  clearValidationErrors: () => void;
  
  getCurrentReview: () => MovieReview | null;
  getReviewById: (id: string) => MovieReview | null;
  getAllTags: () => string[];
  getFilteredReviews: (searchQuery: string, selectedTags: string[]) => MovieReview[];
}

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: [],
      currentReviewId: null,
      formData: createEmptyReview(),
      isEditing: false,
      validationErrors: {},
      
      addImage: (image: string) =>
        set((state) => ({
          formData: {
            ...state.formData,
            images: [...state.formData.images, image]
          }
        })),
      
      removeImage: (index: number) =>
        set((state) => ({
          formData: {
            ...state.formData,
            images: state.formData.images.filter((_, i) => i !== index)
          }
        })),
      
      setMovieName: (name: string) =>
        set((state) => ({
          formData: { ...state.formData, movieName: name }
        })),
      
      setContent: (content: string) =>
        set((state) => ({
          formData: { ...state.formData, content }
        })),
      
      setWatchTime: (time: number) =>
        set((state) => ({
          formData: { ...state.formData, watchTime: time }
        })),
      
      addTag: (tag: string) =>
        set((state) => {
          if (state.formData.tags.length >= 3) return state;
          if (state.formData.tags.includes(tag.trim())) return state;
          return {
            formData: {
              ...state.formData,
              tags: [...state.formData.tags, tag.trim()]
            }
          };
        }),
      
      removeTag: (index: number) =>
        set((state) => ({
          formData: {
            ...state.formData,
            tags: state.formData.tags.filter((_, i) => i !== index)
          }
        })),
      
      setTags: (tags: string[]) =>
        set((state) => ({
          formData: { ...state.formData, tags: tags.slice(0, 3) }
        })),
      
      saveCurrentReview: () => {
        const state = get();
        const errors: ReviewState['validationErrors'] = {};
        
        if (!state.formData.movieName.trim()) {
          errors.movieName = '请输入电影名称';
        }
        if (!state.formData.content.trim()) {
          errors.content = '请输入观影感受';
        }
        if (state.formData.images.length === 0) {
          errors.images = '请至少上传一张图片';
        }
        
        if (Object.keys(errors).length > 0) {
          set({ validationErrors: errors });
          return false;
        }
        
        const { currentReviewId, formData } = state;
        
        try {
          if (currentReviewId) {
            const existingReview = state.reviews.find(r => r.id === currentReviewId);
            if (existingReview) {
              const updatedReview = updateReviewFromForm(existingReview, formData);
              set((state) => ({
                reviews: state.reviews.map(r =>
                  r.id === currentReviewId ? updatedReview : r
                ),
                validationErrors: {}
              }));
            }
          } else {
            const newReview = createReviewFromForm(generateId(), formData);
            set((state) => ({
              reviews: [...state.reviews, newReview],
              currentReviewId: newReview.id,
              isEditing: true,
              validationErrors: {}
            }));
          }
          
          return true;
        } catch (err: any) {
          console.error('保存失败:', err);
          
          // 第二步：捕获 LocalStorage 配额超出错误
          if (err.name === 'QuotaExceededError' || 
              err.message?.includes('QuotaExceeded') ||
              err.message?.includes('localStorage') ||
              err.message?.includes('storage')) {
            alert('存储空间不足，请清理其他电影记录后再试！\n\n提示：删除一些旧的影评可以释放存储空间。');
          } else {
            alert('保存失败：' + (err.message || '未知错误'));
          }
          
          return false;
        }
      },
      
      deleteReview: (id: string) =>
        set((state) => {
          console.log('=== deleteReview 被调用 ===');
          console.log('要删除的 ID:', id);
          console.log('当前 reviews:', state.reviews);
          
          const newReviews = state.reviews.filter(r => r.id !== id);
          console.log('删除后的 reviews:', newReviews);
          
          const newCurrentId = state.currentReviewId === id ? null : state.currentReviewId;
          const newFormData = state.currentReviewId === id ? createEmptyReview() : state.formData;
          const newIsEditing = state.currentReviewId === id ? false : state.isEditing;
          
          console.log('===========================');
          
          return {
            reviews: newReviews,
            currentReviewId: newCurrentId,
            formData: newFormData,
            isEditing: newIsEditing
          };
        }),
      
      loadReviewForEditing: (id: string) =>
        set((state) => {
          const review = state.reviews.find(r => r.id === id);
          if (review) {
            return {
              currentReviewId: review.id,
              formData: {
                movieName: review.movieName,
                watchTime: review.watchTime,
                images: [...review.images],
                content: review.content,
                tags: [...review.tags]
              },
              isEditing: true,
              validationErrors: {}
            };
          }
          return state;
        }),
      
      clearForm: () =>
        set({
          currentReviewId: null,
          formData: createEmptyReview(),
          isEditing: false,
          validationErrors: {}
        }),
      
      validateForm: () => {
        const state = get();
        const errors: ReviewState['validationErrors'] = {};
        
        if (!state.formData.movieName.trim()) {
          errors.movieName = '请输入电影名称';
        }
        if (!state.formData.content.trim()) {
          errors.content = '请输入观影感受';
        }
        if (state.formData.images.length === 0) {
          errors.images = '请至少上传一张图片';
        }
        
        set({ validationErrors: errors });
        return Object.keys(errors).length === 0;
      },
      
      clearValidationErrors: () =>
        set({ validationErrors: {} }),
      
      getCurrentReview: () => {
        const state = get();
        if (!state.currentReviewId) return null;
        return state.reviews.find(r => r.id === state.currentReviewId) || null;
      },
      
      getReviewById: (id: string) => {
        const state = get();
        return state.reviews.find(r => r.id === id) || null;
      },
      
      getAllTags: () => {
        const state = get();
        const allTags = state.reviews.flatMap(r => r.tags);
        const uniqueTags = [...new Set(allTags)];
        return uniqueTags.sort();
      },
      
      getFilteredReviews: (searchQuery: string, selectedTags: string[]) => {
        const state = get();
        let filtered = [...state.reviews];
        
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(review =>
            review.movieName.toLowerCase().includes(query) ||
            review.content.toLowerCase().includes(query)
          );
        }
        
        if (selectedTags.length > 0) {
          filtered = filtered.filter(review =>
            selectedTags.some(tag => review.tags.includes(tag))
          );
        }
        
        return filtered.sort((a, b) => b.watchTime - a.watchTime);
      }
    }),
    {
      name: 'movie-review-storage',
      partialize: (state) => ({
        reviews: state.reviews,
        currentReviewId: state.currentReviewId
      })
    }
  )
);
