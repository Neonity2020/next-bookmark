import React from 'react';
import { Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
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
  onMoveUp: () => void;
  onMoveDown: () => void;
}

// 获取网站 favicon 的函数
const getFaviconUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    // 使用多种常见的 favicon 获取方式
    const faviconOptions = [
      `https://icon.horse/icon/${parsedUrl.hostname}`, // 首选 icon.horse 服务
      `https://www.google.com/s2/favicons?domain=${parsedUrl.hostname}`, // Google favicon 服务
      `${parsedUrl.origin}/favicon.ico`, // 网站根目录 favicon
      `${parsedUrl.origin}/favicon.png`, // 备选 favicon
    ];
    
    // 返回第一个有效的 favicon URL
    return faviconOptions[0];
  } catch {
    // 如果 URL 解析失败，返回默认图标
    return '/default-favicon.png';
  }
};

const truncateUrl = (url: string, maxLength: number = 40) => {
  // 去除协议和 www.
  const cleanUrl = url.replace(/^(https?:\/\/)?(www\.)?/, '');

  if (cleanUrl.length <= maxLength) return cleanUrl;

  const domainEnd = cleanUrl.indexOf('/');
  const domain = domainEnd !== -1 ? cleanUrl.slice(0, domainEnd) : cleanUrl;

  const truncatedDomain = domain.length > 20 
    ? domain.slice(0, 10) + '...' + domain.slice(-10)
    : domain;

  const pathEnd = domainEnd !== -1 ? cleanUrl.slice(domainEnd).slice(0, 10) : '';
  
  return `${truncatedDomain}${pathEnd}${pathEnd ? '...' : ''}`;
};

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onEdit, onDelete, onMoveUp, onMoveDown }) => {
  const faviconUrl = getFaviconUrl(bookmark.url);

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
          onError={(e) => {
            // 如果 favicon 加载失败，隐藏图标
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{bookmark.title}</h3>
          {bookmark.description && (
            <p className="text-sm text-gray-900 mb-2">{bookmark.description}</p>
          )}
          <a
            href={bookmark.url}
            title={bookmark.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-900 hover:underline break-all"
          >
            {truncateUrl(bookmark.url)}
          </a>
        </div>
      </div>
      <div className="bg-gray-100 bg-opacity-20 p-2 flex justify-between">
        <div>
          <button
            onClick={onMoveUp}
            className="text-gray-900 hover:text-gray-200 mr-2"
          >
            <ChevronUp size={18} />
          </button>
          <button
            onClick={onMoveDown}
            className="text-gray-900 hover:text-gray-200"
          >
            <ChevronDown size={18} />
          </button>
        </div>
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
