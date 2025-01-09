'use client';

import { useState, useEffect } from 'react';
import { Plus, Folder, Download, Upload } from 'lucide-react';
import BookmarkCard from './components/BookmarkCard';
import AddBookmarkModal from './components/AddBookmarkModal';
import AddCategoryModal from './components/AddCategoryModal';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  color: string;
  description: string;
}

type CategoryId = 'default' | 'custom' | string;

interface Category {
  id: CategoryId;
  name: string;
  bookmarks: Bookmark[];
}

function App() {
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'default', name: '默认收藏夹', bookmarks: [] },
    { id: 'custom', name: '自定义收藏夹', bookmarks: [] }
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [activeCategory, setActiveCategory] = useState<CategoryId>('default');

  useEffect(() => {
    const savedData = localStorage.getItem('bookmarkCategories');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setCategories(parsed);
      } catch (e) {
        console.error('Failed to parse saved data:', e);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('bookmarkCategories', JSON.stringify(categories));
    }
  }, [categories, mounted]);

  const addCategory = (categoryName: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name: categoryName,
      bookmarks: []
    };
    setCategories(prev => [...prev, newCategory]);
    setIsCategoryModalOpen(false);
  };

  const deleteCategory = (categoryId: string) => {
    // 不允许删除默认和自定义分类
    if (categoryId === 'default' || categoryId === 'custom') {
      alert('不能删除默认分类');
      return;
    }

    // 获取要删除的分类名称
    const categoryToDelete = categories.find(c => c.id === categoryId);
    if (!categoryToDelete) return;

    // 添加确认对话框
    const confirmDelete = window.confirm(
      `确定要删除分类"${categoryToDelete.name}"吗？\n该分类下的所有书签都将被删除。`
    );

    if (confirmDelete) {
      setCategories(prev => prev.filter(category => category.id !== categoryId));
      // 如果删除的是当前激活的分类，切换到默认分类
      if (categoryId === activeCategory) {
        setActiveCategory('default');
      }
    }
  };

  const addBookmark = (bookmark: Bookmark) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === activeCategory 
          ? { ...category, bookmarks: [...category.bookmarks, bookmark] }
          : category
      )
    );
    setIsModalOpen(false);
  };

  const editBookmark = (bookmark: Bookmark) => {
    setCategories(prev => 
      prev.map(category => {
        if (category.id === activeCategory) {
          return {
            ...category,
            bookmarks: category.bookmarks.map(b => 
              b.id === bookmark.id ? bookmark : b
            )
          };
        }
        return category;
      })
    );
    setEditingBookmark(null);
    setIsModalOpen(false);
  };

  const deleteBookmark = (id: string, categoryId: string) => {
    setCategories(prev => 
      prev.map(category => 
        category.id === categoryId 
          ? { ...category, bookmarks: category.bookmarks.filter(b => b.id !== id) }
          : category
      )
    );
  };

  const moveBookmark = (fromIndex: number, toIndex: number, categoryId: string) => {
    setCategories(prev => 
      prev.map(category => {
        if (category.id === categoryId) {
          const updatedBookmarks = [...category.bookmarks];
          const [movedBookmark] = updatedBookmarks.splice(fromIndex, 1);
          updatedBookmarks.splice(toIndex, 0, movedBookmark);
          return { ...category, bookmarks: updatedBookmarks };
        }
        return category;
      })
    );
  };

  const exportData = () => {
    const dataStr = JSON.stringify(categories, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'bookmarks.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = JSON.parse(content);
          setCategories(parsed);
        } catch (error) {
          alert(`导入失败：${(error as Error).message}`);
        }
      };
      reader.readAsText(file);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-violet-100 to-rose-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* 分类管理区域 */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">我的网址导航</h1>
          <div className="flex space-x-2">
            {/* 导出按钮 */}
            <button
              onClick={exportData}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center"
            >
              <Download className="inline-block mr-2" size={18} />
              导出数据
            </button>

            {/* 导入按钮 */}
            <label className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center cursor-pointer">
              <Upload className="inline-block mr-2" size={18} />
              导入数据
              <input
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </label>

            {/* 添加分类按钮 */}
            <button
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center"
            >
              <Folder className="inline-block mr-2" size={18} />
              添加分类
            </button>
          </div>
        </div>

        {/* 分类标签页 */}
        <div className="flex mb-4 space-x-2">
          {categories.map(category => (
            <div key={category.id} className="flex items-center">
              <button
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 py-2 rounded ${
                  activeCategory === category.id 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {category.name}
              </button>
              {category.id !== 'default' && category.id !== 'custom' && (
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCategory(category.id);
                  }} 
                  className="ml-2 text-red-500 hover:text-red-700 cursor-pointer"
                >
                  ✕
                </span>
              )}
            </div>
          ))}
        </div>

        {/* 书签展示区域 */}
        {categories.map(category => (
          activeCategory === category.id && (
            <div key={category.id} className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">{category.name}</h2>
              <div className="bg-white bg-opacity-70 rounded-lg shadow-md p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {category.bookmarks.map((bookmark, index) => (
                    <BookmarkCard
                      key={bookmark.id}
                      bookmark={bookmark}
                      onEdit={() => {
                        setEditingBookmark(bookmark);
                        setActiveCategory(category.id);
                        setIsModalOpen(true);
                      }}
                      onDelete={() => deleteBookmark(bookmark.id, category.id)}
                      onMoveUp={() => index > 0 && moveBookmark(index, index - 1, category.id)}
                      onMoveDown={() => index < category.bookmarks.length - 1 && moveBookmark(index, index + 1, category.id)}
                    />
                  ))}
                  <button
                    onClick={() => {
                      setActiveCategory(category.id);
                      setIsModalOpen(true);
                    }}
                    className="h-40 bg-white bg-opacity-50 rounded-lg shadow-md flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  >
                    <Plus size={24} />
                    <span className="ml-2">添加书签</span>
                  </button>
                </div>
              </div>
            </div>
          )
        ))}
      </div>

      {/* 添加书签模态框 */}
      {isModalOpen && (
        <AddBookmarkModal
          onClose={() => {
            setIsModalOpen(false);
            setEditingBookmark(null);
          }}
          onSave={editingBookmark ? editBookmark : addBookmark}
          editingBookmark={editingBookmark}
          folder={activeCategory}
        />
      )}

      {/* 添加分类模态框 */}
      {isCategoryModalOpen && (
        <AddCategoryModal
          onClose={() => setIsCategoryModalOpen(false)}
          onSave={addCategory}
        />
      )}
    </div>
  );
}

export default App;

