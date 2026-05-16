export interface MovieReview {
  id: string;
  movieName: string;
  watchTime: number;
  images: string[];
  content: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

export interface ReviewFormData {
  movieName: string;
  watchTime: number;
  images: string[];
  content: string;
  tags: string[];
}

export const createEmptyReview = (): ReviewFormData => ({
  movieName: '',
  watchTime: Date.now(),
  images: [],
  content: '',
  tags: []
});

export const createReviewFromForm = (
  id: string,
  formData: ReviewFormData
): MovieReview => ({
  id,
  movieName: formData.movieName,
  watchTime: formData.watchTime,
  images: [...formData.images],
  content: formData.content,
  tags: [...formData.tags],
  createdAt: Date.now(),
  updatedAt: Date.now()
});

export const updateReviewFromForm = (
  existingReview: MovieReview,
  formData: ReviewFormData
): MovieReview => ({
  ...existingReview,
  movieName: formData.movieName,
  watchTime: formData.watchTime,
  images: [...formData.images],
  content: formData.content,
  tags: [...formData.tags],
  updatedAt: Date.now()
});
