import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
// @ts-expect-error - react-draft-wysiwyg không có type definitions
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw, ContentState } from "draft-js";
// @ts-expect-error - draftjs-to-html không có type definitions
import draftToHtml from "draftjs-to-html";
import htmlToDraft from "html-to-draftjs";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import type { BlogData } from "../../api";

interface CreateBlogFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: {
    title?: string;
    content?: string;
    authorId?: string;
    topics?: string;
    image?: string;
    published?: 'draft' | 'published' | 'unpublished' | 'rejected';
    anDanh?: boolean;
    authorName?: string; // Added for displaying author name in edit form
  };
  onSubmit?: (data: BlogData) => Promise<void>;
  isAdmin?: boolean;
}

interface UserInfo {
  _id?: string;
  fullName?: string;
  username?: string;
}

const CreateBlogForm: React.FC<CreateBlogFormProps> = ({
  onSuccess,
  onCancel,
  initialData,
  onSubmit,
  isAdmin,
}) => {
  const [tieuDe, setTieuDe] = useState(initialData?.title || "");
  const [editorState, setEditorState] = useState(() => {
    if (initialData?.content) {
      const blocksFromHtml = htmlToDraft(initialData.content);
      const { contentBlocks, entityMap } = blocksFromHtml;
      const contentState = ContentState.createFromBlockArray(
        contentBlocks,
        entityMap
      );
      return EditorState.createWithContent(contentState);
    }
    return EditorState.createEmpty();
  });
  const [noiDung, setNoiDung] = useState(initialData?.content || ""); // HTML string
  const [tacGia, setTacGia] = useState(initialData?.authorId || "");
  const [topics, setTopics] = useState(initialData?.topics || "");
  const [hinhAnh, setHinhAnh] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image || null
  );
  const [dangTai, setDangTai] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});
  const [anDanh, setAnDanh] = useState(initialData?.anDanh || false);
  // Thêm biến kiểm tra nếu đã từng là ẩn danh thì không cho sửa lại
  const isLockedAnonymous = initialData?.anDanh === true;
  const [trangThai, setTrangThai] = useState<'draft' | 'published' | 'unpublished' | 'rejected'>(
    initialData?.published || 'draft'
  );

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo && !initialData?.authorId) {
      const info = JSON.parse(storedUserInfo);
      setUserInfo(info);
      setTacGia(info._id || "");
    }
  }, [initialData]);

  useEffect(() => {
    if (anDanh) {
      // Không thay đổi giá trị lưu vào DB, chỉ dùng để hiển thị
    } else if (userInfo && !initialData?.authorId) {
      setTacGia(userInfo._id || "");
    }
  }, [anDanh, userInfo, initialData]);

  // Cập nhật HTML khi editorState thay đổi
  useEffect(() => {
    const html = draftToHtml(convertToRaw(editorState.getCurrentContent()));
    setNoiDung(html);
  }, [editorState]);

  useEffect(() => {
    validateAll();
    // eslint-disable-next-line
  }, [tieuDe, tacGia, noiDung, topics, hinhAnh]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setHinhAnh(file);
      setTouched((prev) => ({ ...prev, hinhAnh: true }));
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
    const errors: { [key: string]: string } = {};
    if (!tieuDe.trim()) {
      errors.tieuDe = "Tiêu đề không được để trống";
    } else if (tieuDe.trim().length < 5) {
      errors.tieuDe = "Tiêu đề phải có ít nhất 5 ký tự";
    } else if (tieuDe.trim().length > 150) {
      errors.tieuDe = "Tiêu đề không được quá 150 ký tự";
    }
    
    // Validate authorId (tác giả sẽ lấy từ user đăng nhập)
    if (!tacGia.trim()) {
      errors.tacGia = "Không tìm thấy thông tin tác giả. Vui lòng đăng nhập lại.";
    }
    
    // Validate nội dung: loại bỏ tag html để đếm ký tự thực
    const plainText = noiDung.replace(/<[^>]*>/g, "").trim();
    if (!plainText) {
      errors.noiDung = "Nội dung không được để trống";
    } else if (plainText.length < 50) {
      errors.noiDung = "Nội dung phải có ít nhất 50 ký tự";
    }
    if (hinhAnh) {
      const validImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];
      if (!validImageTypes.includes(hinhAnh.type)) {
        errors.hinhAnh = "Ảnh phải có định dạng JPG, JPEG, PNG hoặc WEBP";
      } else if (hinhAnh.size > 2 * 1024 * 1024) {
        errors.hinhAnh = "Ảnh không được quá 2MB";
      }
    }
    const topicArr = topics
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (topicArr.length === 0) {
      errors.topics = "Vui lòng nhập ít nhất 1 chủ đề.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      tieuDe: true,
      tacGia: true,
      noiDung: true,
      topics: true,
      hinhAnh: true,
    });
    if (!validateAll()) return;
    setDangTai(true);
    try {
      // Lưu tên tác giả thật trong trường hợp ẩn danh
      let realAuthor = tacGia;
      
      // Nếu đang trong chế độ ẩn danh và trường tacGia đã bị thay đổi thành "Ẩn danh"
      // thì phục hồi lại giá trị ban đầu từ initialData hoặc userInfo
      if (anDanh && tacGia === "Ẩn danh") {
        realAuthor = initialData?.authorId || userInfo?._id || "";
      }
      
      const blogData: BlogData = {
        title: tieuDe,
        content: noiDung,
        authorId: realAuthor,
        topics: topics.split(",").map((topic: string) => topic.trim()),
        published: isAdmin ? (trangThai === 'draft' ? 'published' : trangThai === 'rejected' ? 'published' : trangThai) : 'draft',
        anDanh: anDanh
      };
      if (hinhAnh) {
        blogData.image = hinhAnh;
      } else if (initialData?.image) {
        blogData.image = initialData.image;
      }
      if (onSubmit) {
        await onSubmit(blogData);
      } else {
        // fallback: gọi API tạo mới như cũ
        const { createBlogApi } = await import("../../api");
        await createBlogApi(blogData);
        toast.success(
          "Bài viết của bạn đã gửi thành công, vui lòng chờ admin duyệt!"
        );
      }
      onSuccess();
    } catch (error: unknown) {
      toast.error("Có lỗi xảy ra khi gửi bài viết. Vui lòng thử lại sau.");
      console.error("Error submitting blog:", error);
    } finally {
      setDangTai(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 via-cyan-100 to-blue-100 overflow-hidden">
      {/* Blue bubbles */}
      <div className="absolute top-8 left-1/4 w-32 h-32 rounded-full bg-cyan-200 opacity-30 blur-xl"></div>
      <div className="absolute top-20 right-1/4 w-40 h-40 rounded-full bg-blue-300 opacity-30 blur-xl"></div>
      <div className="absolute bottom-10 left-1/3 w-24 h-24 rounded-full bg-cyan-100 opacity-20 blur-xl"></div>
      <div className="absolute bottom-0 right-1/3 w-36 h-36 rounded-full bg-blue-200 opacity-20 blur-xl"></div>
      {/* Bubble animation */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`absolute bottom-0 left-[${5 + i * 7}%] w-${((i % 3) + 2) * 3} h-${((i % 3) + 2) * 3} rounded-full bg-blue-100 opacity-30 animate-bubble`}
          style={{ animationDelay: `${i * 0.8}s` }}
        />
      ))}
      <style>{`
        @keyframes bubble {
          0% { transform: translateY(0) scale(1); opacity: 0.3; }
          70% { opacity: 0.5; }
          100% { transform: translateY(-600px) scale(1.2); opacity: 0; }
        }
        .animate-bubble {
          animation: bubble 8s linear infinite;
        }
      `}</style>
      {/* Form card */}
      <div className="relative z-10 bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-xl border border-blue-100 backdrop-blur-md">
        <div className="mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-blue-900 mb-2 drop-shadow-lg">
            {initialData ? "Sửa Blog" : "Tạo Blog Mới"}
          </h2>
          <p className="text-lg text-cyan-700 font-medium">
            Chia sẻ kiến thức, cảm xúc hoặc kinh nghiệm của bạn với cộng đồng HopeHub!
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          <div>
            <label className="block text-sm font-medium text-blue-800">
              Tiêu đề
            </label>
            <input
              type="text"
              className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-base px-4 py-3 bg-blue-50 text-blue-900 placeholder-blue-400"
              value={tieuDe}
              onChange={(e) => {
                setTieuDe(e.target.value);
              }}
              onBlur={() => handleBlur("tieuDe")}
              required
              style={{
                borderColor:
                  touched.tieuDe && formErrors.tieuDe ? "#f56565" : "#bae6fd",
              }}
            />
            {touched.tieuDe && formErrors.tieuDe && (
              <p className="mt-1 text-sm text-red-600 font-medium">
                {formErrors.tieuDe}
              </p>
            )}
          </div>
          {/* Ẩn trường tác giả nếu không phải admin */}
          {/* Tác giả - ẩn trường vì sẽ lấy từ user đăng nhập */}
          <div>
            <label className="block text-sm font-medium text-blue-800">
              Tác giả
            </label>
            <div className="flex items-center gap-3 mb-2">
              <input
                id="anDanh"
                type="checkbox"
                checked={anDanh}
                onChange={(e) => setAnDanh(e.target.checked)}
                className="h-4 w-4 text-cyan-600 border-blue-200 rounded focus:ring-cyan-500"
                disabled={isLockedAnonymous} // Nếu đã từng là ẩn danh thì không cho sửa lại
              />
              <label
                htmlFor="anDanh"
                className="text-sm text-blue-800 select-none cursor-pointer"
              >
                Đăng ẩn danh
              </label>
            </div>
            <div className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm px-4 py-3 bg-blue-50 text-blue-900">
              {anDanh ? "Ẩn danh" : (initialData?.authorName || userInfo?.fullName || userInfo?.username || "Đang tải...")}
            </div>
            {isLockedAnonymous && (
              <p className="mt-1 text-xs text-red-600 font-semibold">
                Bài viết này đã được đăng ẩn danh và không thể chuyển lại thành hiện tên tác giả.
              </p>
            )}
            {anDanh && !isLockedAnonymous && (
              <p className="mt-1 text-xs text-cyan-600">
                Tên tác giả thực sẽ được lưu trong hệ thống nhưng hiển thị là "Ẩn danh" cho người đọc.
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-800">
              Nội dung
            </label>
            <div className="bg-white rounded-xl border border-blue-200 focus:border-cyan-500 focus:ring-cyan-500">
              <Editor
                editorState={editorState}
                onEditorStateChange={(state: EditorState) => {
                  setEditorState(state);
                  setTouched((prev) => ({ ...prev, noiDung: true }));
                }}
                toolbar={{
                  options: [
                    "inline",
                    "blockType",
                    "list",
                    "textAlign",
                    "history",
                    "link",
                    "emoji",
                    "image",
                  ],
                  inline: {
                    options: [
                      "bold",
                      "italic",
                      "underline",
                      "strikethrough",
                      "monospace",
                    ],
                    bold: { className: "bordered-option-classname" },
                    italic: { className: "bordered-option-classname" },
                    underline: { className: "bordered-option-classname" },
                    strikethrough: { className: "bordered-option-classname" },
                    monospace: { className: "bordered-option-classname" },
                  },
                  blockType: {
                    inDropdown: true,
                    options: [
                      "Normal",
                      "H1",
                      "H2",
                      "H3",
                      "H4",
                      "H5",
                      "H6",
                      "Blockquote",
                      "Code",
                    ],
                    className: "bordered-option-classname",
                  },
                  list: {
                    inDropdown: false,
                    options: ["unordered", "ordered", "indent", "outdent"],
                    className: "bordered-option-classname",
                  },
                  textAlign: {
                    inDropdown: false,
                    options: ["left", "center", "right", "justify"],
                    className: "bordered-option-classname",
                  },
                  link: {
                    inDropdown: false,
                    options: ["link", "unlink"],
                    className: "bordered-option-classname",
                  },
                  history: {
                    inDropdown: false,
                    options: ["undo", "redo"],
                    className: "bordered-option-classname",
                  },
                }}
                wrapperClassName="wysiwyg-wrapper"
                editorClassName="wysiwyg-editor min-h-[180px] px-3 py-2 text-blue-900"
                toolbarClassName="wysiwyg-toolbar rounded-t-xl bg-blue-50 border-blue-200"
                onBlur={() => handleBlur("noiDung")}
              />
            </div>
            {touched.noiDung && formErrors.noiDung && (
              <p className="mt-1 text-sm text-red-600 font-medium">
                {formErrors.noiDung}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-800">
              Ảnh đại diện blog
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              onBlur={() => handleBlur("hinhAnh")}
              className="mt-1 block w-full text-base bg-blue-50 text-blue-900"
              style={{
                color:
                  touched.hinhAnh && formErrors.hinhAnh ? "#f56565" : "inherit",
              }}
            />
            {touched.hinhAnh && formErrors.hinhAnh && (
              <p className="mt-1 text-sm text-red-600 font-medium">
                {formErrors.hinhAnh}
              </p>
            )}
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-2 w-40 h-28 object-cover rounded-xl border border-blue-200 mx-auto"
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-800">
              Chủ đề (phân tách bằng dấu phẩy)
            </label>
            <input
              type="text"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              onBlur={() => handleBlur("topics")}
              placeholder="Ví dụ: sức khỏe, tâm lý, dinh dưỡng"
              className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-base px-4 py-3 bg-blue-50 text-blue-900 placeholder-blue-400"
              style={{
                borderColor:
                  touched.topics && formErrors.topics ? "#f56565" : "#bae6fd",
              }}
            />
            {touched.topics && formErrors.topics && (
              <p className="mt-1 text-sm text-red-600 font-medium">
                {formErrors.topics}
              </p>
            )}
          </div>
          
          {/* Trạng thái xuất bản - chỉ hiển thị cho admin */}
          {isAdmin && (
            <div>
              <label className="block text-sm font-medium text-blue-800">
                Trạng thái xuất bản
              </label>
              <select
                value={trangThai}
                onChange={(e) => setTrangThai(e.target.value as 'draft' | 'published' | 'unpublished' | 'rejected')}
                className="mt-1 block w-full rounded-xl border border-blue-200 shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-base px-4 py-3 bg-blue-50 text-blue-900"
              >
                <option value="published">Xuất bản</option>
                <option value="unpublished">Ngừng xuất bản</option>
              </select>
            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 border border-blue-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={dangTai}
              className={`px-4 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 rounded-md shadow-md border border-cyan-700 ${dangTai ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {dangTai ? "Đang xử lý..." : initialData ? "Cập nhật" : "Tạo mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBlogForm;
