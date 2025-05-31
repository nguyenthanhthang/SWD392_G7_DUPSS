import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Danh sách menu
  const menuGroups = [
    {
      title: 'TRANG CHỦ',
      items: [
        {
          title: 'Tổng quan',
          path: '/admin',
          icon: 'dashboard'
        }
      ]
    },
    {
      title: 'QUẢN LÝ HỆ THỐNG',
      items: [
        {
          title: 'Quản lý người dùng',
          path: '/admin/users',
          icon: 'people'
        },
        {
          title: 'Quản lý tư vấn viên',
          path: '/admin/consultants',
          icon: 'support_agent'
        },
        {
          title: 'Quản lý lịch tư vấn',
          path: '/admin/schedules',
          icon: 'calendar_today'
        },
        {
          title: 'Quản lý bài viết',
          path: '/admin/blogs',
          icon: 'article'
        },
        {
          title: 'Quản lý chương trình',
          path: '/admin/programs',
          icon: 'campaign'
        },
        {
          title: 'Quản lý khảo sát',
          path: '/admin/surveys',
          icon: 'poll'
        }
      ]
    },
    {
      title: 'BÁO CÁO & THỐNG KÊ',
      items: [
        {
          title: 'Báo cáo tổng quan',
          path: '/admin/dashboard',
          icon: 'analytics'
        },
        {
          title: 'Xuất báo cáo Excel',
          path: '/admin/reports/export',
          icon: 'file_download'
        }
      ]
    },
    {
      title: 'CẤU HÌNH',
      items: [
        {
          title: 'Cài đặt hệ thống',
          path: '/admin/settings',
          icon: 'settings'
        }
      ]
    }
  ];

  // Kiểm tra mục có đang được chọn hay không
  const isActive = (path: string) => {
    // Xử lý trường hợp đặc biệt cho trang dashboard
    if (path === '/admin' && currentPath === '/admin') {
      return true;
    }
    // Đối với các trang khác, kiểm tra nếu path hiện tại bắt đầu bằng path của mục
    return currentPath.startsWith(path) && path !== '/admin';
  };

  return (
    <div className="hidden md:block w-64 bg-white dark:bg-darkgray shadow-md h-screen fixed left-0">
      <div className="px-4 py-6 bg-white sticky top-0 w-64 z-50">
        <div className="flex justify-center items-center">
          <h1 className="text-2xl font-bold text-indigo-600">DUPSS Admin</h1>
        </div>
      </div>
      
      <nav className="mt-2 overflow-y-auto h-[calc(100vh-6rem)]">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-4">
            <h6 className="px-4 mb-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
              {group.title}
            </h6>
            <ul>
              {group.items.map((item, itemIndex) => {
                const active = isActive(item.path);
                return (
                  <li key={itemIndex} className="mb-1 px-4">
                    <Link 
                      to={item.path}
                      className={`flex items-center py-2 px-3 ${
                        active 
                          ? 'bg-indigo-500 text-white font-medium rounded-full' 
                          : 'text-gray-700 dark:text-gray-200 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}
                    >
                      <span className={`material-icons-outlined mr-3 ${active ? 'text-white' : ''}`}>
                        {item.icon}
                      </span>
                      <span>{item.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 