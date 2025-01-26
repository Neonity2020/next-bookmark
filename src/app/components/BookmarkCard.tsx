import React from 'react';
import { Edit2, Trash2} from 'lucide-react';
import Image from 'next/image';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  color: string;
  description?: string;
}

interface BookmarkCardProps {
  bookmark: Bookmark;
  onEdit: () => void;
  onDelete: () => void;
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

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onEdit, onDelete }) => {
  const [faviconUrl, setFaviconUrl] = React.useState('/favicon.ico'); // 默认为本地 favicon

  React.useEffect(() => {
    const fetchFavicon = async () => {
      const hostname = new URL(bookmark.url).hostname;
      const localStorageKey = `favicon_${hostname}`;
      
      // 首先检查 localStorage 是否已缓存图标
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
            // 将成功的图标 URL 存储到 localStorage
            localStorage.setItem(localStorageKey, url);
            setFaviconUrl(url);
            return;
          }
        } catch {
          // 如果获取失败，继续尝试下一个
          continue;
        }
      }
    };

    fetchFavicon();
  }, [bookmark.url]);

  return (
    <div className={`rounded-lg shadow-md overflow-hidden flex flex-col ${bookmark.color}`}>
      <div className="flex-grow p-4 flex items-start">
        {/* 添加网站 logo */}
        <Image 
          src={faviconUrl} 
          alt="Website Logo" 
          width={32}
          height={32}
          className="mr-3 mt-1 rounded-full object-cover"
          onError={() => setFaviconUrl('/favicon.ico')} // 最终备选
        />
        <div className="overflow-hidden">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 truncate max-w-full">{bookmark.title}</h3>
          {bookmark.description ? (
            <p className="text-sm text-gray-900 mb-2 truncate max-w-full">{bookmark.description}</p>
          ) : (
            <p className="text-sm text-gray-500 mb-2 italic">暂无描述</p>
          )}
          <a
            href={bookmark.url}
            title={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-900 hover:underline break-all whitespace-nowrap overflow-hidden text-ellipsis"
          >
            {truncateUrl(bookmark.url)}
          </a>
        </div>
      </div>
      <div className="bg-gray-100 bg-opacity-20 p-2 flex justify-end">
        <div>
          <button
            onClick={onEdit}
            className="text-gray-900 hover:text-gray-200 mr-2"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-900 hover:text-gray-200"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;
