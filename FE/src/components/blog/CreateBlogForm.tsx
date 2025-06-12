import React, { useState, useEffect } from 'react';
import { createBlogApi } from '../../api';
import { toast } from 'react-hot-toast';

interface CreateBlogFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const CreateBlogForm: React.FC<CreateBlogFormProps> = ({ onSuccess, onCancel }) => {
  const [tieuDe, setTieuDe] = useState('');
  const [noiDung, setNoiDung] = useState('');
  const [tacGia, setTacGia] = useState('');
  const [tags, setTags] = useState('');
  const [hinhAnh, setHinhAnh] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [dangTai, setDangTai] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [userInfo, setUserInfo] = useState<any>(null);
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      const info = JSON.parse(storedUserInfo);
      setUserInfo(info);
      setTacGia(info.fullName || info.username || '');
    }
  }, []);

  // Validate liên tục
  useEffect(() => {
    validateAll();
    // eslint-disable-next-line
  }, [tieuDe, tacGia, noiDung, tags, hinhAnh]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHinhAnh(file);
      setTouched(prev => ({ ...prev, hinhAnh: true }));
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setHinhAnh(null);
      setImagePreview(null);
    }
  };

  const validateAll = () => {
    const errors: {[key: string]: string} = {};
    if (!tieuDe.trim()) {
      errors.tieuDe = 'Tiêu đề không được để trống';
    } else if (tieuDe.trim().length < 5) {
      errors.tieuDe = 'Tiêu đề phải có ít nhất 5 ký tự';
    } else if (tieuDe.trim().length > 150) {
      errors.tieuDe = 'Tiêu đề không được quá 150 ký tự';
    }
    if (!tacGia.trim()) {
      errors.tacGia = 'Tác giả không được để trống';
    } else if (tacGia.trim().length < 3) {
      errors.tacGia = 'Tên tác giả phải có ít nhất 3 ký tự';
    } else if (tacGia.trim().length > 50) {
      errors.tacGia = 'Tên tác giả không được quá 50 ký tự';
    }
    if (!noiDung.trim()) {
      errors.noiDung = 'Nội dung không được để trống';
    } else if (noiDung.trim().length < 50) {
      errors.noiDung = 'Nội dung phải có ít nhất 50 ký tự';
    }
    if (hinhAnh) {
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validImageTypes.includes(hinhAnh.type)) {
        errors.hinhAnh = 'Ảnh phải có định dạng JPG, JPEG, PNG hoặc WEBP';
      } else if (hinhAnh.size > 2 * 1024 * 1024) {
        errors.hinhAnh = 'Ảnh không được quá 2MB';
      }
    }
    const tagArr = tags.split(',').map(t => t.trim()).filter(Boolean);
    if (tagArr.length === 0) {
      errors.tags = 'Vui lòng nhập ít nhất 1 tag.';
    }
    if (tagArr.length > 5) {
      errors.tags = 'Chỉ được nhập tối đa 5 tag.';
    }
    for (let tag of tagArr) {
      if (tag.length > 20) {
        errors.tags = 'Mỗi tag không quá 20 ký tự.';
      }
      if (!/^[a-zA-Z0-9-_]+$/.test(tag)) {
        errors.tags = 'Tag chỉ được chứa chữ cái, số, dấu gạch ngang hoặc gạch dưới.';
      }
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Đánh dấu tất cả trường là touched khi submit
    setTouched({ tieuDe: true, tacGia: true, noiDung: true, tags: true, hinhAnh: true });
    if (!validateAll()) return;
    setDangTai(true);
    try {
      const blogData: any = {
        title: tieuDe,
        content: noiDung,
        author: tacGia,
        tags: tags.split(',').map((tag: string) => tag.trim()),
        published: false, // member tạo blog sẽ là false
      };
      if (hinhAnh) blogData.image = hinhAnh;
      await createBlogApi(blogData);
      toast.success('Bài viết của bạn đã gửi thành công, vui lòng chờ admin duyệt!');
      onSuccess();
    } catch (error) {
      toast.error('Có lỗi xảy ra khi gửi bài viết. Vui lòng thử lại sau.');
    } finally {
      setDangTai(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-cyan-700">Tạo Bài Viết Mới</h2>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tiêu đề</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
            value={tieuDe}
            onChange={e => { setTieuDe(e.target.value); }}
            onBlur={() => handleBlur('tieuDe')}
            required
            style={{ borderColor: touched.tieuDe && formErrors.tieuDe ? '#f56565' : '#e2e8f0' }}
          />
          {touched.tieuDe && formErrors.tieuDe && <p className="mt-1 text-sm text-red-600 font-medium">{formErrors.tieuDe}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tác giả</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
            value={tacGia}
            onChange={e => { setTacGia(e.target.value); }}
            onBlur={() => handleBlur('tacGia')}
            required
            style={{ borderColor: touched.tacGia && formErrors.tacGia ? '#f56565' : '#e2e8f0' }}
          />
          {touched.tacGia && formErrors.tacGia && <p className="mt-1 text-sm text-red-600 font-medium">{formErrors.tacGia}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nội dung</label>
          <textarea
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm min-h-[120px]"
            value={noiDung}
            onChange={e => { setNoiDung(e.target.value); }}
            onBlur={() => handleBlur('noiDung')}
            required
            style={{ borderColor: touched.noiDung && formErrors.noiDung ? '#f56565' : '#e2e8f0' }}
          />
          {touched.noiDung && formErrors.noiDung && <p className="mt-1 text-sm text-red-600 font-medium">{formErrors.noiDung}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Ảnh đại diện blog</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            onBlur={() => handleBlur('hinhAnh')}
            className="mt-1 block w-full text-sm"
            style={{ color: touched.hinhAnh && formErrors.hinhAnh ? '#f56565' : 'inherit' }}
          />
          {touched.hinhAnh && formErrors.hinhAnh && <p className="mt-1 text-sm text-red-600 font-medium">{formErrors.hinhAnh}</p>}
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="mt-2 w-32 h-20 object-cover rounded border" />
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Tags (phân tách bằng dấu phẩy)</label>
          <input
            type="text"
            value={tags}
            onChange={e => { setTags(e.target.value); }}
            onBlur={() => handleBlur('tags')}
            placeholder="Ví dụ: suc-khoe, tam-ly, dinh-duong"
            className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
            style={{ borderColor: touched.tags && formErrors.tags ? '#f56565' : '#e2e8f0' }}
          />
          {touched.tags && formErrors.tags && <p className="mt-1 text-sm text-red-600 font-medium">{formErrors.tags}</p>}
        </div>
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            Hủy
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition shadow-md flex items-center disabled:opacity-50"
            disabled={dangTai}
          >
            {dangTai ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Đang gửi...
              </>
            ) : (
              'Gửi bài'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBlogForm; 