import React from 'react';
import { Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react';

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

function truncateUrl(url: string, maxLength: number = 36): string {
  try {
    // 如果 URL 长度小于等于最大长度，直接返回
    if (url.length <= maxLength) return url;

    // 解析 URL
    const urlObj = new URL(url);
    
    // 移除协议部分
    const cleanDomain = urlObj.hostname.replace(/^(www\.)/, '');
    const path = urlObj.pathname;

    // 组合域名和路径
    const combinedUrl = `${cleanDomain}${path}`;

    // 如果组合后的 URL 已经很短，直接返回
    if (combinedUrl.length <= maxLength) return combinedUrl;

    // 截断逻辑
    if (cleanDomain.length > maxLength / 2) {
      // 域名较长时，截断域名
      return `${cleanDomain.substring(0, maxLength / 2)}...${path.substring(0, 5)}`;
    } else {
      // 域名较短时，保留完整域名，截断路径
      return `${cleanDomain}...${path.substring(path.length - 10)}`;
    }
  } catch {  // 移除未使用的错误参数
    // 如果 URL 解析失败，返回原始 URL 的截断版本
    return url.length > maxLength 
      ? `${url.substring(0, maxLength)}...` 
      : url;
  }
}

const BookmarkCard: React.FC<BookmarkCardProps> = ({ bookmark, onEdit, onDelete, onMoveUp, onMoveDown }) => {
  return (
    <div className={`rounded-lg shadow-md overflow-hidden flex flex-col ${bookmark.color}`}>
      <div className="flex-grow p-4">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{bookmark.title}</h3>
        {bookmark.description && (
          <p className="text-sm text-gray-700 mb-2">{bookmark.description}</p>
        )}
        <a
          href={bookmark.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-700 hover:underline 
            whitespace-nowrap 
            overflow-hidden 
            text-ellipsis"
        >
          {truncateUrl(bookmark.url)}
        </a>
      </div>
      <div className="bg-gray-100 bg-opacity-20 p-2 flex justify-between">
        <div>
          <button
            onClick={onMoveUp}
            className="text-gray-700 hover:text-gray-200 mr-2"
          >
            <ChevronUp size={18} />
          </button>
          <button
            onClick={onMoveDown}
            className="text-gray-700 hover:text-gray-200"
          >
            <ChevronDown size={18} />
          </button>
        </div>
        <div>
          <button
            onClick={onEdit}
            className="text-gray-700 hover:text-gray-200 mr-2"
          >
            <Edit2 size={18} />
          </button>
          <button
            onClick={onDelete}
            className="text-gray-700 hover:text-gray-200"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookmarkCard;
