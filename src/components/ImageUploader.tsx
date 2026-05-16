import { useState, useRef } from 'react';
import { Upload, X, Maximize2, ArrowLeft, ArrowRight } from 'lucide-react';
import { useReviewStore } from '../hooks/useReviewStore';

export const ImageUploader = () => {
  const { formData, addImage, removeImage, validationErrors, clearValidationErrors } = useReviewStore();
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ===== 第二步：图片压缩函数 =====
  const compressImage = (file: File, maxWidth: number = 1080, quality: number = 0.6): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;

            // 计算缩放比例
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('无法获取 Canvas 上下文'));
              return;
            }

            // 绘制压缩后的图片
            ctx.drawImage(img, 0, 0, width, height);

            // 转换为 Base64
            const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
            
            // 计算压缩比
            const originalSize = (file.size / 1024).toFixed(1);
            const compressedSize = (atob(compressedBase64.split(',')[1]).length / 1024).toFixed(1);
            const ratio = ((1 - parseFloat(compressedSize) / parseFloat(originalSize)) * 100).toFixed(0);
            
            setCompressionInfo(`原始: ${originalSize}KB → 压缩后: ${compressedSize}KB (节省 ${ratio}%)`);
            
            resolve(compressedBase64);
          };
          img.onerror = () => reject(new Error('图片加载失败'));
          img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
      } catch (err) {
        reject(err);
      }
    });
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    try {
      // 使用压缩函数处理图片
      const compressedImage = await compressImage(file, 1080, 0.6);
      addImage(compressedImage);
      if (validationErrors.images) {
        clearValidationErrors();
      }
    } catch (err) {
      console.error('图片处理错误:', err);
      // 如果压缩失败，尝试使用原始图片
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        addImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        handleFile(file);
      }
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => handleFile(file));
  };

  const openPreview = (index: number) => {
    setPreviewIndex(index);
    setPreviewImage(formData.images[index]);
  };

  const closePreview = () => {
    setPreviewImage(null);
  };

  const navigatePreview = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setPreviewIndex((prev) => (prev === 0 ? formData.images.length - 1 : prev - 1));
    } else {
      setPreviewIndex((prev) => (prev === formData.images.length - 1 ? 0 : prev + 1));
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
          ${isDragging 
            ? 'border-movie-gold bg-amber-500/10' 
            : validationErrors.images
              ? 'border-red-500/50 bg-red-500/5'
              : 'border-gray-700 bg-gray-900/50 hover:border-gray-600 hover:bg-gray-800/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleChange}
          className="hidden"
        />
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
        <p className="text-gray-400 mb-1">拖拽图片到这里或点击上传</p>
        <p className="text-gray-600 text-sm">支持 JPG, PNG, GIF 格式，可多选</p>
      </div>

      {validationErrors.images && (
        <p className="text-red-400 text-sm flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />
          {validationErrors.images}
        </p>
      )}

      {formData.images.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              已上传 {formData.images.length} 张图片
            </span>
            {compressionInfo && (
              <span className="text-xs text-green-400">
                ✓ {compressionInfo}
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {formData.images.map((img, idx) => (
              <div 
                key={idx} 
                className="relative group fade-in aspect-square"
              >
                <img
                  src={img}
                  alt={`Uploaded ${idx + 1}`}
                  className="w-full h-full object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openPreview(idx)}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openPreview(idx);
                    }}
                    className="p-2 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-white/30"
                  >
                    <Maximize2 className="w-4 h-4 text-white" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(idx);
                    }}
                    className="p-2 bg-red-500/80 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Lightbox Preview */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={closePreview}
        >
          <button 
            onClick={closePreview}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          
          {formData.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePreview('prev');
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigatePreview('next');
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <ArrowRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}
          
          <img
            src={formData.images[previewIndex]}
            alt="Preview"
            className="max-w-full max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="absolute bottom-4 text-white/60 text-sm">
            {previewIndex + 1} / {formData.images.length}
          </div>
        </div>
      )}
    </div>
  );
};
