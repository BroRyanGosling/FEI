import { useState, useEffect, useRef } from 'react';
import { useReviewStore } from '../hooks/useReviewStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Calendar, Clock, Edit2, Home as HomeIcon, ChevronLeft, Trash2 } from 'lucide-react';
import { Typewriter } from './Typewriter';
import { ExportButton } from './ExportButton';

interface PreviewSectionProps {
  isFullscreen?: boolean;
  onExitPreview?: () => void;
  onEditReview?: () => void;
  onDeleteReview?: () => void;
}

type AnimationPhase = 'intro' | 'credits' | 'complete';

// ⚠️ 降级调试模式开关：设为 true 可禁用所有动画进行裸渲染测试
const DEBUG_BARE_RENDER = true;

export const PreviewSection = ({ 
  isFullscreen = false, 
  onExitPreview,
  onEditReview,
  onDeleteReview
}: PreviewSectionProps) => {
  const { formData, currentReviewId } = useReviewStore();
  
  const hasContent = formData.movieName || formData.content || formData.images.length > 0;
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('intro');
  const [showControls, setShowControls] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const currentDate = new Date(formData.watchTime || Date.now()).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // 渲染错误捕获
  useEffect(() => {
    if (!formData) {
      console.error('PreviewSection 渲染错误: 数据对象为空');
      setRenderError('渲染错误：请检查控制台');
    }
  }, [formData]);

  const resetControlsTimeout = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    setShowControls(true);
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  };

  useEffect(() => {
    if (isFullscreen) {
      setAnimationPhase('intro');
      setShowControls(false);
      const timer = setTimeout(() => setShowControls(true), 1000);
      return () => {
        if (controlsTimeout) clearTimeout(controlsTimeout);
        clearTimeout(timer);
      };
    } else {
      setAnimationPhase('intro');
      setShowControls(false);
    }
  }, [isFullscreen]);

  useEffect(() => {
    console.log('=== PreviewSection 诊断日志 ===');
    console.log('formData:', {
      movieName: formData.movieName,
      content: formData.content,
      images: formData.images,
      imageCount: formData.images.length,
      watchTime: formData.watchTime
    });
    console.log('hasContent:', hasContent);
    console.log('currentReviewId:', currentReviewId);
    console.log('===========================');
  }, [formData, hasContent, currentReviewId]);

  useEffect(() => {
    if (isFullscreen && hasContent) {
      resetControlsTimeout();
    }
  }, [isFullscreen, hasContent]);

  const handleCreditsComplete = () => {
    setAnimationPhase('complete');
    setShowControls(true);
  };

  return (
    <div className={`
      h-full flex flex-col transition-all duration-1000
      ${isFullscreen 
        ? 'bg-black absolute inset-0' 
        : 'bg-gradient-to-b from-gray-900/50 to-movie-darker'
      }
    `}>
      {!isFullscreen && (
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Eye className="w-6 h-6 text-movie-gold" />
              <span>预览区</span>
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {currentDate}
              </div>
              {hasContent && (
                <ExportButton
                  images={formData.images}
                  movieTitle={formData.movieName}
                  content={formData.content}
                  date={currentDate}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Controls - Fullscreen Mode */}
      {isFullscreen && (
        <div
          className="fixed top-6 left-6 z-50 flex items-center gap-2"
        >
          <button
            onClick={onExitPreview}
            className="flex items-center gap-2 px-4 py-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 rounded-xl text-white transition-all group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            返回陈列室
          </button>

          {currentReviewId && (
            <>
              <button
                onClick={onEditReview}
                className="flex items-center gap-2 px-4 py-2.5 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 rounded-xl text-white transition-all"
              >
                <Edit2 className="w-4 h-4" />
                编辑此影评
              </button>
              
              <button
                onClick={onDeleteReview}
                className="flex items-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-600/30 backdrop-blur-md border border-red-500/50 rounded-xl text-red-400 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                删除此影评
              </button>
            </>
          )}
        </div>
      )}

      <div className={`
        flex-1 overflow-hidden relative
        ${isFullscreen ? 'p-0' : 'p-6 scrollbar-hide overflow-y-auto'}
      `}>
        {!hasContent && isFullscreen ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 bg-black">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              <div className="text-8xl">⚠️</div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white">暂无影评数据</h3>
                <p className="text-gray-400 text-lg">请重新编辑并保存影评内容</p>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="pt-4"
              >
                <button
                  onClick={onExitPreview}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white flex items-center gap-2 transition-all mx-auto"
                >
                  <ChevronLeft className="w-4 h-4" />
                  返回编辑
                </button>
              </motion.div>
            </motion.div>
            <div className="absolute bottom-8 text-gray-600 text-sm">
              如需调试，请查看浏览器控制台 (F12)
            </div>
          </div>
        ) : !hasContent ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-gray-900/50 flex items-center justify-center">
              <ClapperboardIcon className="w-12 h-12 text-gray-700" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-500">还没有内容</h3>
              <p className="text-gray-600 text-sm mt-1">
                在左侧编辑区开始创建你的影评吧
              </p>
            </div>
          </div>
        ) : isFullscreen && animationPhase === 'intro' ? (
          <>
            {/* 显示渲染错误信息 */}
            {renderError && (
              <div className="absolute top-20 left-0 right-0 text-center z-50">
                <p style={{ color: '#ef4444', fontSize: '1.25rem', fontWeight: 'bold' }}>
                  ⚠️ {renderError}
                </p>
              </div>
            )}
            
            {DEBUG_BARE_RENDER ? (
              <BareRenderPreview
                images={formData.images}
                movieName={formData.movieName}
                content={formData.content}
                currentDate={currentDate}
              />
            ) : (
              <ImmersivePreview
                images={formData.images}
                movieName={formData.movieName}
                content={formData.content}
                currentDate={currentDate}
                onTypewriterComplete={() => setAnimationPhase('credits')}
              />
            )}
          </>
        ) : isFullscreen && animationPhase === 'credits' ? (
          <>
            {DEBUG_BARE_RENDER ? (
              <div className="h-full flex items-center justify-center bg-black" style={{ zIndex: 10 }}>
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-amber-400 mb-8" style={{ zIndex: 20, color: '#f59e0b' }}>观影感受</h2>
                  <p className="text-xl text-white max-w-4xl px-8" style={{ zIndex: 20, color: 'white' }}>{formData.content}</p>
                </div>
              </div>
            ) : (
              <CreditsSection
                content={formData.content}
                onComplete={handleCreditsComplete}
              />
            )}
          </>
        ) : isFullscreen && animationPhase === 'complete' ? (
          <FinalScreen 
            movieName={formData.movieName} 
            images={formData.images}
            content={formData.content}
            date={currentDate}
            onEdit={onEditReview}
            onBackToGallery={onExitPreview}
            onDelete={onDeleteReview}
          />
        ) : (
          <NormalPreview
            images={formData.images}
            movieName={formData.movieName}
            content={formData.content}
            currentDate={currentDate}
          />
        )}
      </div>
    </div>
  );
};

interface ImmersivePreviewProps {
  images: string[];
  movieName: string;
  content: string;
  currentDate: string;
  onTypewriterComplete: () => void;
}

const ImmersivePreview: React.FC<ImmersivePreviewProps> = ({
  images,
  movieName,
  content,
  currentDate,
  onTypewriterComplete
}) => {
  const [showImage, setShowImage] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showContent, setShowContent] = useState(false);

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Background Image Layer - Always Visible */}
      <AnimatePresence>
        {images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: showImage ? 1 : 0 }}
            transition={{ duration: 2, delay: 0.5 }}
            className="absolute inset-0"
          >
            {/* Ken Burns Effect Container */}
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.1 }}
              transition={{
                duration: 20,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "linear"
              }}
              className="w-full h-full"
            >
              <img
                src={images[0]}
                alt={movieName}
                className="w-full h-full object-cover"
                onLoad={() => setShowImage(true)}
              />
            </motion.div>
            
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Layer */}
      <div className="relative z-10 flex items-center justify-center w-full h-full px-8 md:px-16">
        <div className="flex flex-col lg:flex-row items-center gap-12 max-w-7xl w-full">
          {/* Movie Poster */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: showImage ? 1 : 0, x: showImage ? 0 : -50 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="flex-shrink-0"
          >
            <div className="relative">
              <div className="relative w-64 md:w-80 aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border-4 border-amber-500/30">
                {images.length > 0 ? (
                  <img src={images[0]} alt={movieName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <span className="text-6xl">🎬</span>
                  </div>
                )}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-br from-white/5 via-transparent to-black/20" />
              </div>
              <div className="absolute -top-2 -left-2 w-8 h-8 border-t-2 border-l-2 border-amber-500/60" />
              <div className="absolute -top-2 -right-2 w-8 h-8 border-t-2 border-r-2 border-amber-500/60" />
              <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-2 border-l-2 border-amber-500/60" />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-2 border-r-2 border-amber-500/60" />
            </div>
          </motion.div>

          {/* Title and Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: showTitle ? 1 : 0, y: showTitle ? 0 : 30 }}
            transition={{ duration: 0.8, delay: 1.5 }}
            className="flex-1 text-center lg:text-left space-y-8"
          >
            <div className="space-y-4">
              <Typewriter
                key={`title-${movieName}`}
                text={movieName}
                speed={80}
                delay={0}
                className="text-4xl md:text-6xl lg:text-7xl font-bold gradient-text leading-tight"
                onComplete={() => {
                  setShowContent(true);
                  setTimeout(onTypewriterComplete, 1500);
                }}
              />
              
              <Typewriter
                key={`date-${currentDate}`}
                text={currentDate}
                speed={40}
                delay={500}
                className="text-xl md:text-2xl text-gray-400"
              />
            </div>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="flex items-center gap-4 justify-center lg:justify-start"
            >
              <div className="w-16 md:w-24 h-px bg-gradient-to-r from-transparent to-amber-500/60" />
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 1 + i * 0.1 }}
                    className="w-2 h-2 rounded-full bg-amber-500/50"
                  />
                ))}
              </div>
              <div className="w-16 md:w-24 h-px bg-gradient-to-l from-transparent to-amber-500/60" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-4"
            >
              <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl">
                {content.length > 200 ? content.substring(0, 200) + '...' : content}
              </p>
              {content.length > 200 && (
                <p className="text-sm text-gray-500 italic">继续滚动查看完整内容...</p>
              )}
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Transition */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4, duration: 2 }}
        className="absolute inset-0 bg-black pointer-events-none"
      />
    </div>
  );
};

interface CreditsSectionProps {
  content: string;
  onComplete: () => void;
}

const CreditsSection: React.FC<CreditsSectionProps> = ({ content, onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !hasStarted) return;
    
    setIsScrolling(true);
    let scrollPos = 0;
    const viewportHeight = window.innerHeight;
    const scrollSpeed = 40;
    
    const scroll = () => {
      if (!containerRef.current) return;
      
      scrollPos += scrollSpeed / 60;
      containerRef.current.scrollTop = scrollPos;
      
      const maxScroll = containerRef.current.scrollHeight - viewportHeight;
      
      if (scrollPos >= maxScroll) {
        setIsScrolling(false);
        onComplete();
        return;
      }
      
      requestAnimationFrame(scroll);
    };
    
    const startDelay = setTimeout(() => {
      requestAnimationFrame(scroll);
    }, 500);
    
    return () => clearTimeout(startDelay);
  }, [hasStarted, onComplete]);

  const paragraphs = content.split('\n\n').filter(p => p.trim());

  return (
    <div className="absolute inset-0 bg-black flex items-center justify-center">
      <div ref={containerRef} className="h-screen overflow-hidden cursor-pointer" onClick={() => !hasStarted && setHasStarted(true)}>
        <div className="min-h-full flex flex-col items-center justify-start pt-[40vh] pb-[60vh]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mb-16 text-center">
            <h2 className="text-3xl md:text-4xl font-bold gradient-text mb-4">观影感受</h2>
            <div className="flex items-center gap-4 justify-center">
              <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-500/60" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-amber-500/50" />)}
              </div>
              <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-500/60" />
            </div>
          </motion.div>

          {paragraphs.map((paragraph, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 + idx * 0.5, duration: 0.8 }}
              className="max-w-4xl px-8 text-center mb-12"
              onAnimationComplete={() => idx === 0 && !hasStarted && setHasStarted(true)}
            >
              <p className="text-xl md:text-2xl text-gray-200 leading-relaxed whitespace-pre-wrap font-light">{paragraph}</p>
            </motion.div>
          ))}
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: paragraphs.length * 0.5 + 2, duration: 1 }} className="mt-16 text-center">
            <div className="flex items-center gap-4 justify-center text-amber-500/60 mb-8">
              <div className="w-24 h-px bg-gradient-to-r from-transparent to-current" />
              <div className="flex gap-3">
                {[...Array(5)].map((_, i) => <div key={i} className="w-2 h-2 rounded-full bg-current" />)}
              </div>
              <div className="w-24 h-px bg-gradient-to-l from-transparent to-current" />
            </div>
            <p className="text-lg text-gray-500">感谢观看</p>
          </motion.div>
        </div>
      </div>
      
      {!isScrolling && !hasStarted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute bottom-12 text-white/40 text-sm pointer-events-none">
          点击开始滚动
        </motion.div>
      )}
    </div>
  );
};

interface NormalPreviewProps {
  images: string[];
  movieName: string;
  content: string;
  currentDate: string;
}

const NormalPreview: React.FC<NormalPreviewProps> = ({ images, movieName, content, currentDate }) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl mx-auto bg-gradient-to-b from-gray-900 to-gray-950 rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
      {images.length > 0 && (
        <div className="relative">
          <img src={images[0]} alt={movieName || 'Preview'} className="w-full h-64 object-cover" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent" />
        </div>
      )}
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold font-display gradient-text">{movieName || '电影名称'}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{currentDate}</span>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent" />
        <div className="space-y-4">
          <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-wrap">{content || '在这里写下你的观影感受...'}</p>
        </div>
        <div className="flex items-center justify-center pt-4">
          <div className="flex items-center gap-2 text-gray-700">
            <div className="w-8 h-px bg-gray-700" />
            <div className="flex gap-1">{[...Array(3)].map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-700" />)}</div>
            <div className="w-8 h-px bg-gray-700" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

interface FinalScreenProps {
  movieName: string;
  images: string[];
  content: string;
  date: string;
  onEdit?: () => void;
  onBackToGallery?: () => void;
  onDelete?: () => void;
}

const FinalScreen: React.FC<FinalScreenProps> = ({ movieName, images, content, date, onEdit, onBackToGallery, onDelete }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} className="h-full flex items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl px-8">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 1 }} className="text-8xl">🎬</motion.div>
        <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-4xl font-bold gradient-text">{movieName}</motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="text-xl text-gray-400">感谢观看</motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <ExportButton images={images} movieTitle={movieName} content={content} date={date} />
          {onEdit && (
            <button onClick={onEdit} className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white flex items-center gap-2 transition-all">
              <Edit2 className="w-4 h-4" />编辑此影评
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="px-6 py-3 bg-red-500/20 hover:bg-red-600/30 backdrop-blur-sm border border-red-500/50 rounded-xl text-red-400 flex items-center gap-2 transition-all">
              <Trash2 className="w-4 h-4" />删除此影评
            </button>
          )}
          {onBackToGallery && (
            <button onClick={onBackToGallery} className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-white flex items-center gap-2 transition-all">
              <HomeIcon className="w-4 h-4" />返回陈列室
            </button>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

function ClapperboardIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.2 6 3 11l-.9-2.4c-.3-.8.3-1.6 1.1-1.6l17-4.9c.8-.2 1.6.3 1.7 1.1Z" /><path d="m6.2 5.3 3.1 3.8" /><path d="m12.4 3.9 3.1 3.8" /><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8Z" />
    </svg>
  );
}

// ⚠️ 降级裸渲染测试组件 - 移除所有动画和复杂效果
interface BareRenderPreviewProps {
  images: string[];
  movieName: string;
  content: string;
  currentDate: string;
}

const BareRenderPreview: React.FC<BareRenderPreviewProps> = ({
  images,
  movieName,
  content,
  currentDate
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  // 图片轮播 - 相接播放
  useEffect(() => {
    if (images.length <= 1) return;
    
    const interval = setInterval(() => {
      setNextImageIndex((currentImageIndex + 1) % images.length);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentImageIndex((currentImageIndex + 1) % images.length);
        setNextImageIndex(null);
        setIsTransitioning(false);
      }, 1500); // 1.5秒切换
    }, 5000); // 每5秒切换
    
    return () => clearInterval(interval);
  }, [images.length, currentImageIndex]);

  // 文字自动滚动效果
  useEffect(() => {
    if (!isAutoScrolling) return;
    
    const container = contentRef.current;
    if (!container) return;
    
    let scrollY = 0;
    let paused = false;
    let pauseTime = 0;
    
    const delayId = setTimeout(() => {
      const timerId = setInterval(() => {
        if (!contentRef.current || !isAutoScrolling) {
          clearInterval(timerId);
          return;
        }
        
        const el = contentRef.current;
        const maxY = el.scrollHeight - el.clientHeight;
        
        if (!paused) {
          scrollY += 1;
          el.scrollTop = scrollY;
          
          if (scrollY >= maxY) {
            paused = true;
          }
        } else {
          pauseTime++;
          if (pauseTime > 60) {
            pauseTime = 0;
            paused = false;
            scrollY = 0;
            el.scrollTop = 0;
          }
        }
      }, 30);
      
      return () => clearInterval(timerId);
    }, 3000);
    
    return () => clearTimeout(delayId);
  }, [isAutoScrolling]);

  // 监听手动滚动，停止自动滚动
  const handleScroll = () => {
    setIsAutoScrolling(false);
  };

  return (
    <div
      className="w-screen h-screen"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000000',
        zIndex: 1,
        overflow: 'hidden'
      }}
    >
      {/* 电影放映厅 - 顶部半椭圆遮罩 */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '8vh',
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
        zIndex: 25,
        pointerEvents: 'none'
      }} />
      
      {/* 电影放映厅 - 底部半椭圆遮罩 */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '8vh',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
        zIndex: 25,
        pointerEvents: 'none'
      }} />

      {/* 背景图片轮播 - 电影放映厅效果 */}
      {images.length > 0 && (
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          zIndex: 1,
          overflow: 'hidden'
        }}>
          {/* 放映室光束渐变 */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 50% 50%, transparent 20%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.8) 100%)',
            zIndex: 10
          }} />
          
          {/* 图片轮播容器 */}
          <div 
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* 当前图片 */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                animation: 'kenBurns 20s ease-in-out infinite alternate',
                opacity: isTransitioning ? 0 : 1,
                transition: 'opacity 1.5s ease-in-out'
              }}
            >
              <img 
                src={images[currentImageIndex]} 
                alt={movieName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'brightness(0.75) contrast(1.05)'
                }}
              />
            </div>
            
            {/* 下一张图片 - 相接过渡 */}
            {nextImageIndex !== null && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  animation: 'kenBurnsNext 20s ease-in-out infinite alternate',
                  animationDelay: '-20s'
                }}
              >
                <img 
                  src={images[nextImageIndex]} 
                  alt={movieName}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    filter: 'brightness(0.75) contrast(1.05)'
                  }}
                />
              </div>
            )}
          </div>
          
          {/* 胶片颗粒效果 */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
            opacity: 0.025,
            pointerEvents: 'none',
            zIndex: 12
          }} />
          
          {/* 图片指示器 */}
          {images.length > 1 && (
            <div style={{ 
              position: 'absolute', 
              bottom: 'calc(8vh + 20px)', 
              left: '50%', 
              transform: 'translateX(-50%)', 
              display: 'flex', 
              gap: 12, 
              zIndex: 30 
            }}>
              {images.map((_, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    width: idx === currentImageIndex ? 32 : 8,
                    backgroundColor: idx === currentImageIndex ? '#f59e0b' : 'rgba(255,255,255,0.4)'
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    height: 8,
                    borderRadius: 4
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 文字内容 */}
      <div 
        ref={contentRef}
        onScroll={handleScroll}
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          paddingLeft: '10%', 
          paddingRight: '10%',
          zIndex: 40,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        <div style={{ maxWidth: 600, paddingTop: '25vh', paddingBottom: '25vh' }}>
          {images.length > 0 && (
            <div style={{ 
              width: 180, 
              height: 270, 
              borderRadius: 8, 
              overflow: 'hidden', 
              boxShadow: '0 30px 60px rgba(0,0,0,0.9)',
              border: '3px solid rgba(245,158,11,0.5)',
              marginBottom: 32,
              backgroundColor: '#1a1a1a'
            }}>
              <img 
                src={images[currentImageIndex]} 
                alt={movieName} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  filter: 'brightness(0.9) contrast(1.1)'
                }} 
              />
            </div>
          )}
          
          <h1 style={{ 
            color: '#f59e0b', 
            fontSize: 48, 
            fontWeight: 'bold', 
            marginBottom: 16, 
            textShadow: '2px 2px 8px rgba(0,0,0,1)',
            animation: 'fadeSlideIn 1s ease-out'
          }}>
            {movieName}
          </h1>
          
          <p style={{ 
            color: '#9ca3af', 
            fontSize: 20, 
            marginBottom: 24, 
            animation: 'fadeSlideIn 1s ease-out 0.3s both'
          }}>
            {currentDate}
          </p>
          
          <div style={{ 
            width: 120, 
            height: 2, 
            background: 'linear-gradient(to right, #f59e0b, transparent)', 
            marginBottom: 24 
          }} />
          
          <p 
            style={{ 
              color: '#e5e7eb', 
              fontSize: 18, 
              lineHeight: 2, 
              animation: 'fadeSlideIn 1s ease-out 0.6s both',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
            }}
          >
            {content}
          </p>
          
          {!isAutoScrolling && (
            <div style={{
              position: 'fixed',
              bottom: 80,
              right: 40,
              padding: '8px 16px',
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: 20,
              color: '#9ca3af',
              fontSize: 12,
              zIndex: 50,
              animation: 'fadeSlideIn 0.3s ease-out'
            }}>
              滚动查看 · 拖动可查看全部
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes kenBurns {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        @keyframes kenBurnsNext {
          0% { transform: scale(1.1); }
          100% { transform: scale(1.25); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
