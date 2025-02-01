import React, { useState } from 'react';
import { Edit2, Trash2, X } from 'lucide-react';
import Image from 'next/image';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  color: string;
  description?: string;
  ogImage?: string; // 新增 OG 图片字段
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: () => void;
  onDelete: () => void;
  onRemoveOgImage: () => void; // 新增删除 OG 图片的回调
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

const truncateUrl = (url: string, maxLength: number = 20) => {
  // 去除协议、www. 和末尾的 "/"
  const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');

  if (cleanUrl.length <= maxLength) return cleanUrl;

  const domainEnd = cleanUrl.indexOf('/');
  const domain = domainEnd !== -1 ? cleanUrl.slice(0, domainEnd) : cleanUrl;

  const truncatedDomain = domain.length > 20 
    ? domain.slice(0, 10) + '...' + domain.slice(-10)
    : domain;

  const pathEnd = domainEnd !== -1 ? cleanUrl.slice(domainEnd).slice(0, 10) : '';
  
  return `${truncatedDomain}${pathEnd}${pathEnd ? '...' : ''}`;
};

const BookmarkCard: React.FC<BookmarkCardProps> = ({ 
  bookmark, 
  onEdit, 
  onDelete, 
  onRemoveOgImage 
}) => {
  const [faviconUrl, setFaviconUrl] = React.useState('/favicon.ico');
  const [backgroundImage, setBackgroundImage] = React.useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  React.useEffect(() => {
    // 优先使用 OG 图片作为背景
    if (bookmark.ogImage) {
      setBackgroundImage(bookmark.ogImage);
    } else {
      setBackgroundImage(null);
    }

    const fetchFavicon = async () => {
      const hostname = new URL(bookmark.url).hostname;
      const localStorageKey = `favicon_${hostname}`;
      
      const cachedFavicon = localStorage.getItem(localStorageKey);
      if (cachedFavicon) {
        setFaviconUrl(cachedFavicon);
        return;
      }

      const fallbackOptions = [
        `https://icon.horse/icon/${hostname}`,
        `https://www.google.com/s2/favicons?domain=${hostname}`,
        `https://favicon.githubusercontent.com/v1/${hostname}`,
        '/favicon.ico'
      ];

      for (const url of fallbackOptions) {
        try {
          const response = await fetch(url, { method: 'HEAD' });
          if (response.ok) {
            localStorage.setItem(localStorageKey, url);
            setFaviconUrl(url);
            return;
          }
        } catch {
          continue;
        }
      }
    };

    fetchFavicon();
  }, [bookmark.url, bookmark.ogImage]);

  return (
    <div 
      className={`rounded-lg shadow-md overflow-hidden flex flex-col relative group ${bookmark.color}`}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        zIndex: 0
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 删除 OG 图片按钮 - 仅在悬停和有背景图时显示 */}
      {backgroundImage && isHovered && (
        <button
          onClick={onRemoveOgImage}
          className="absolute top-2 right-2 z-30 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-all duration-200"
          title="删除预览图"
        >
          <X size={16} />
        </button>
      )}

      {/* 背景模糊效果 */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-sky-700 bg-opacity-50" 
          style={{
            backdropFilter: 'blur(2px)', 
            WebkitBackdropFilter: 'blur(2px)', 
            filter: 'brightness(0.9)'
          }}
        />
      )}

      <div className="flex-grow p-4 flex items-start relative z-20">
        <Image 
          src={faviconUrl} 
          alt="Website Logo" 
          width={32}
          height={32}
          className={`mr-3 mt-1 rounded-full object-cover ${backgroundImage ? 'border-2 border-white/70' : ''}`}
          onError={() => setFaviconUrl('/favicon.ico')}
        />
        <div className="overflow-hidden">
          <h3 className={`text-xl font-semibold mb-2 truncate max-w-full ${backgroundImage ? 'text-white' : 'text-gray-900'}`}>
            {bookmark.title}
          </h3>
          {bookmark.description ? (
            <p className={`text-sm mb-2 truncate max-w-full ${backgroundImage ? 'text-gray-200' : 'text-gray-900'}`}>
              {bookmark.description}
            </p>
          ) : (
            <p className={`text-sm mb-2 italic ${backgroundImage ? 'text-gray-300' : 'text-gray-500'}`}>
              暂无描述
            </p>
          )}
          <a
            href={bookmark.url}
            title={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-sm hover:underline break-all whitespace-nowrap overflow-hidden text-ellipsis ${
              backgroundImage ? 'text-white' : 'text-gray-900'
            }`}
          >
            {truncateUrl(bookmark.url)}
          </a>
        </div>
      </div>
      <div className={`p-2 flex justify-end relative z-20 ${
        backgroundImage 
          ? 'bg-black bg-opacity-30' 
          : 'bg-gray-100 bg-opacity-20'
      }`}>
        <div className={`flex items-center transition-all duration-200 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <button
            onClick={onEdit}
            className={`hover:text-gray-200 mr-2 ${
              backgroundImage ? 'text-white' : 'text-gray-900'
            }`}
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            className={`hover:text-gray-200 ${
              backgroundImage ? 'text-white' : 'text-gray-900'
            }`}
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;
