import React from 'react';

interface AddCategoryModalProps {
  onClose: () => void;
  onSave: (categoryName: string) => void;
}

export default function AddCategoryModal({ onClose, onSave }: AddCategoryModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const categoryName = formData.get('categoryName') as string;
    if (categoryName.trim()) {
      onSave(categoryName);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4 text-gray-800">添加新分类</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="categoryName"
            className="w-full p-2 border rounded mb-4 text-gray-700 placeholder-gray-500"
            placeholder="输入分类名称"
            autoFocus
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 