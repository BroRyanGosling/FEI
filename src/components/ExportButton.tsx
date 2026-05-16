import { useState, useRef } from 'react';
import { Download, Loader2, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'framer-motion';

interface ExportableReviewProps {
  images: string[];
  movieTitle: string;
  content: string;
  date: string;
}

export const ExportableReview: React.FC<ExportableReviewProps> = ({
  images,
  movieTitle,
  content,
  date
}) => {
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  return (
    <div 
      style={{
        background: 'linear-gradient(to bottom, #0f0f0f, #050505)',
        minHeight: '100vh',
        width: '100%',
        padding: '40px',
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '40px',
        paddingBottom: '20px',
        borderBottom: '1px solid rgba(245, 158, 11, 0.3)'
      }}>
        <div style={{
          fontSize: '32px'
        }}>🎬</div>
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>电影影评</h2>
          <p style={{ color: '#9ca3af', fontSize: '12px' }}>{date}</p>
        </div>
      </div>

      {/* Images Gallery */}
      {images.length > 0 && (
        <div style={{
          marginBottom: '40px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
        }}>
          {images.length === 1 ? (
            <img
              src={images[0]}
              alt={movieTitle}
              style={{
                width: '100%',
                height: '400px',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: images.length === 2 ? '1fr 1fr' : '1fr 1fr',
              gridTemplateRows: images.length > 2 ? '200px 200px' : 'auto',
              gap: '4px'
            }}>
              {images.slice(0, 4).map((img, idx) => (
                <div key={idx} style={{
                  position: 'relative',
                  overflow: 'hidden',
                  height: idx < 2 ? '250px' : '200px'
                }}>
                  <img
                    src={img}
                    alt={`${movieTitle} ${idx + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  {idx === 3 && images.length > 4 && (
                    <div style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(0,0,0,0.7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}>
                      +{images.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <h1 style={{
        fontSize: '48px',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: '8px',
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: '1.2'
      }}>
        {movieTitle}
      </h1>

      <p style={{
        textAlign: 'center',
        color: '#9ca3af',
        fontSize: '14px',
        marginBottom: '40px'
      }}>
        {date}
      </p>

      {/* Divider */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '40px'
      }}>
        <div style={{
          width: '80px',
          height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(245,158,11,0.4))'
        }} />
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: 'rgba(245,158,11,0.4)'
            }} />
          ))}
        </div>
        <div style={{
          width: '80px',
          height: '1px',
          background: 'linear-gradient(to left, transparent, rgba(245,158,11,0.4))'
        }} />
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        {paragraphs.map((paragraph, idx) => (
          <p key={idx} style={{
            fontSize: '18px',
            lineHeight: '1.8',
            color: '#d1d5db',
            marginBottom: '24px',
            textAlign: 'justify'
          }}>
            {paragraph}
          </p>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '80px',
        paddingTop: '40px',
        borderTop: '1px solid rgba(245,158,11,0.2)',
        textAlign: 'center',
        color: '#6b7280',
        fontSize: '12px'
      }}>
        <p>记录每一次感动 · Movie Review</p>
      </div>
    </div>
  );
};

interface ExportButtonProps {
  images: string[];
  movieTitle: string;
  content: string;
  date: string;
  className?: string;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  images,
  movieTitle,
  content,
  date,
  className = ''
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!exportRef.current) return;

    setIsExporting(true);
    setExportSuccess(false);

    try {
      const canvas = await html2canvas(exportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#050505',
        logging: false,
        allowTaint: true
      });

      const link = document.createElement('a');
      link.download = `${movieTitle || '影评'}_${new Date().toLocaleDateString('zh-CN')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 2000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <div className="fixed -left-[9999px]">
        <div ref={exportRef}>
          <ExportableReview
            images={images}
            movieTitle={movieTitle}
            content={content}
            date={date}
          />
        </div>
      </div>

      <button
        onClick={handleExport}
        disabled={isExporting}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg
          bg-gradient-to-r from-amber-500 to-orange-600
          hover:from-amber-600 hover:to-orange-700
          disabled:opacity-50 disabled:cursor-not-allowed
          text-white font-medium transition-all
          shadow-lg shadow-amber-500/25
          ${className}
        `}
      >
        <AnimatePresence mode="wait">
          {isExporting ? (
            <motion.div
              key="loading"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Loader2 className="w-4 h-4 animate-spin" />
            </motion.div>
          ) : exportSuccess ? (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Check className="w-4 h-4" />
            </motion.div>
          ) : (
            <motion.div
              key="download"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
            >
              <Download className="w-4 h-4" />
            </motion.div>
          )}
        </AnimatePresence>

        <span>
          {isExporting ? '导出中...' : exportSuccess ? '导出成功！' : '导出图片'}
        </span>
      </button>
    </>
  );
};
