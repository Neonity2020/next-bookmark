'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Folder, Download, Upload } from 'lucide-react';
import BookmarkCard from './components/BookmarkCard';
import AddBookmarkModal from './components/AddBookmarkModal';
import AddCategoryModal from './components/AddCategoryModal';
import Image from 'next/image';

interface Bookmark {
  id: string;
  title: string;
  url: string;
  color: string;
  description: string;
  ogImage?: string;
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
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

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
    // 获取要删除的书签信息
    const category = categories.find(c => c.id === categoryId);
    const bookmark = category?.bookmarks.find(b => b.id === id);
    if (!bookmark) return;

    // 添加确认对话框
    const confirmDelete = window.confirm(
      `确定要删除书签"${bookmark.title}"吗？`
    );

    if (confirmDelete) {
      setCategories(prev => 
        prev.map(category => 
          category.id === categoryId 
            ? { ...category, bookmarks: category.bookmarks.filter(b => b.id !== id) }
            : category
        )
      );
    }
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

  const editCategoryName = (categoryId: string, newName: string) => {
    if (newName.trim() === '') return;
    setCategories(prev => prev.map(category => 
      category.id === categoryId 
        ? { ...category, name: newName.trim() }
        : category
    ));
  };

  // 新增拖放处理函数
  const onDragEnd = (result: DropResult) => {
    const { source, destination, type } = result;

    // 如果没有目标位置或者源位置和目标位置相同，直接返回
    if (!destination || source.index === destination.index) return;

    // 处理分类拖放
    if (type === 'CATEGORY') {
      // 如果是固定分类或尝试移动到固定分类位置，则不允许
      if (source.index < 2 || destination.index < 2) return;

      // 创建分类数组的副本
      const newCategories = Array.from(categories);
      
      // 移动分类
      const [movedCategory] = newCategories.splice(source.index, 1);
      newCategories.splice(destination.index, 0, movedCategory);

      // 更新状态
      setCategories(newCategories);
      return;
    }

    // 处理书签拖放
    if (type === 'BOOKMARK') {
      setCategories(prevCategories => 
        prevCategories.map(category => {
          if (category.id === source.droppableId) {
            const newBookmarks = Array.from(category.bookmarks);
            const [movedBookmark] = newBookmarks.splice(source.index, 1);
            newBookmarks.splice(destination.index, 0, movedBookmark);
            
            return {
              ...category,
              bookmarks: newBookmarks
            };
          }
          return category;
        })
      );
    }
  };

  const handleRemoveOgImage = (bookmarkId: string) => {
    // 更新书签，移除 ogImage
    const updatedBookmarks = categories.map(category => ({
      ...category,
      bookmarks: category.bookmarks.map(bookmark => 
        bookmark.id === bookmarkId 
          ? { ...bookmark, ogImage: undefined } 
          : bookmark
      )
    }));
    
    // 更新状态
    setCategories(updatedBookmarks);

    // 可选：如果使用后端，发送更新请求
    // updateBookmarkOnServer(bookmarkId, { ogImage: null });
  };

  if (!mounted) {
    return null;
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="min-h-screen bg-gradient-to-br from-sky-100 via-violet-100 to-rose-100 p-8">
        <div className="max-w-6xl mx-auto">
          {/* 分类管理区域 */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            {/* 添加logo */}
            <div className="flex items-center space-x-4">
              <Image 
                src="/logo.png"  // 请确保在 public 文件夹中放置 logo.png
                alt="网址导航 Logo" 
                width={50} 
                height={50} 
                className="rounded-lg"
              />
              <h1 className="text-xl sm:text-4xl font-bold text-gray-800 whitespace-nowrap">我的网址导航</h1>
            </div>
            
            <div className="w-full sm:w-auto grid grid-cols-3 sm:flex sm:flex-wrap gap-2">
              {/* 导出按钮 */}
              <button
                onClick={exportData}
                className="px-2 sm:px-4 py-2 h-[42px] bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center whitespace-nowrap text-sm sm:text-base"
              >
                <Download className="inline-block mr-1 sm:mr-2" size={16} />
                导出数据
              </button>

              {/* 导入按钮 */}
              <label className="px-2 sm:px-4 py-2 h-[42px] bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center cursor-pointer whitespace-nowrap text-sm sm:text-base">
                <Upload className="inline-block mr-1 sm:mr-2" size={16} />
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
                className="px-2 sm:px-4 py-2 h-[42px] bg-green-500 text-white rounded hover:bg-green-600 transition-colors flex items-center justify-center whitespace-nowrap text-sm sm:text-base"
              >
                <Folder className="inline-block mr-1 sm:mr-2" size={16} />
                添加分类
              </button>
            </div>
          </div>

          {/* 分类标签页 */}
          <Droppable 
            droppableId="categories" 
            type="CATEGORY"
            direction="horizontal"
          >
            {(provided, snapshot) => (
              <div 
                {...provided.droppableProps} 
                ref={provided.innerRef}
                className={`flex gap-4 mb-6 overflow-x-auto py-4 px-2 transition-colors duration-200
                  scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
                  ${snapshot.isDraggingOver ? 'bg-blue-50/50 rounded-lg' : ''}`}
              >
                {categories.map((category, index) => (
                  <Draggable 
                    key={category.id} 
                    draggableId={category.id} 
                    index={index}
                    isDragDisabled={index < 2}
                  >
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => setActiveCategory(category.id)}
                        onDoubleClick={() => {
                          if (category.id !== 'default' && category.id !== 'custom') {
                            setEditingCategoryId(category.id);
                            setEditingName(category.name);
                          }
                        }}
                        className={`px-4 py-2 bg-white rounded-lg flex items-center
                          h-10 w-[120px] shrink-0 justify-center cursor-pointer group
                          ${activeCategory === category.id 
                            ? 'bg-blue-500 text-blue-500 shadow-lg ring-2 ring-blue-300 ring-offset-2 ring-offset-blue-50' 
                            : 'hover:bg-gray-50 hover:shadow-sm text-gray-700'}`}
                        style={{
                          ...provided.draggableProps.style,
                          transform: snapshot.isDragging 
                            ? `${provided.draggableProps.style?.transform} scale(1.01) rotate(0.5deg)`
                            : provided.draggableProps.style?.transform || '',
                          transition: snapshot.isDragging
                            ? undefined
                            : 'all 0.0000001s cubic-bezier(0.33, 1, 0.68, 1)',
                          transformOrigin: 'center',
                          zIndex: snapshot.isDragging ? 9999 : 'auto',
                          opacity: snapshot.isDragging ? 0.9 : 1,
                          boxShadow: snapshot.isDragging 
                            ? '0 8px 12px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)'
                            : undefined
                        }}
                      >
                        {editingCategoryId === category.id ? (
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            onBlur={() => {
                              if (editingName.trim()) {
                                editCategoryName(category.id, editingName);
                              }
                              setEditingCategoryId(null);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && editingName.trim()) {
                                editCategoryName(category.id, editingName);
                                setEditingCategoryId(null);
                              } else if (e.key === 'Escape') {
                                setEditingCategoryId(null);
                              }
                            }}
                            className="w-full bg-transparent text-center focus:outline-none"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span className="truncate font-medium select-none">{category.name}</span>
                        )}
                        {category.id !== 'default' && category.id !== 'custom' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCategory(category.id);
                            }}
                            className={`ml-2 opacity-0 group-hover:opacity-100 transition-opacity
                              ${activeCategory === category.id 
                                ? 'text-white/80 hover:text-red-500' 
                                : 'hover:text-red-500'}`}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* 书签展示区域 */}
          {categories.map(category => (
            activeCategory === category.id && (
              <div key={category.id} className="mb-8">
                <h2 className="font-semibold text-gray-800 mb-4 text-xl sm:text-2xl">{category.name}</h2>
                <Droppable droppableId={category.id} type="BOOKMARK">
                  {(provided) => (
                    <div 
                      {...provided.droppableProps} 
                      ref={provided.innerRef}
                      className="bg-white bg-opacity-70 rounded-lg shadow-md p-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {category.bookmarks.map((bookmark, index) => (
                          <Draggable 
                            key={bookmark.id} 
                            draggableId={bookmark.id} 
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <BookmarkCard
                                  bookmark={bookmark}
                                  onEdit={() => {
                                    setEditingBookmark(bookmark);
                                    setActiveCategory(category.id);
                                    setIsModalOpen(true);
                                  }}
                                  onDelete={() => deleteBookmark(bookmark.id, category.id)}
                                  onRemoveOgImage={() => handleRemoveOgImage(bookmark.id)}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
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
                  )}
                </Droppable>
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
    </DragDropContext>
  );
}

export default App;

