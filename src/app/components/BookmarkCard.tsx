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
  return (
    <div className={`rounded-lg shadow-md overflow-hidden flex flex-col ${bookmark.color}`}>
      <div className="flex-grow p-4">
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
