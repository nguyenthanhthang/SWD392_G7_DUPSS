import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  // Danh sách menu
  const menuGroups = [
    {
      title: 'HOME',
      items: [
        {
          title: 'Dashboard',
          path: '/admin',
          icon: 'dashboard'
        }
      ]
    },
    {
      title: 'UTILITIES',
      items: [
        {
          title: 'Quản lý người dùng',
          path: '/admin/users',
          icon: 'people'
        },
        {
          title: 'Quản lý khóa học',
          path: '/admin/courses',
          icon: 'school'
        },
        {
          title: 'Quản lý blog',
          path: '/admin/blogs',
          icon: 'article'
        },
        {
          title: 'Quản lý tư vấn',
          path: '/admin/consulting',
          icon: 'support_agent'
        }
      ]
    },
    {
      title: 'REPORTS',
      items: [
        {
          title: 'Báo cáo thống kê',
          path: '/admin/reports',
          icon: 'bar_chart'
        },
        {
          title: 'Cài đặt hệ thống',
          path: '/admin/settings',
          icon: 'settings'
        }
      ]
    }
  ];

  return (
    <div className="hidden md:block w-64 bg-white dark:bg-darkgray shadow-md h-screen fixed left-0">
      <div className="px-6 py-4 flex items-center">
        <svg className="w-10 h-10 text-primary" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
        </svg>
        <h1 className="text-xl font-bold ml-2 text-primary">DUPSS Admin</h1>
      </div>
      
      <nav className="mt-6">
        {menuGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="mb-6">
            <h6 className="px-6 mb-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
              {group.title}
            </h6>
            <ul>
              {group.items.map((item, itemIndex) => (
                <li key={itemIndex} className="mb-1">
                  <Link 
                    to={item.path}
                    className="flex items-center px-6 py-3 text-gray-700 dark:text-gray-200 hover:bg-indigo-50 hover:text-indigo-600 rounded-md"
                  >
                    <span className="material-icons-outlined mr-3">{item.icon}</span>
                    <span>{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar; 