import React, { useState } from 'react';
import { ChevronDown, Plus, Filter, Download, Search, Settings, Bell, User } from 'lucide-react';
import logo from '/avarta.png';

const ConsultantDashboard = () => {
  const [selectedRows, setSelectedRows] = useState([1, 2, 5]);

  const employees = [
    {
      id: 0,
      name: "Anatoly Belik",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face&auto=format",
      jobTitle: "Head of Design",
      department: "Product",
      site: "🇸🇪 Stockholm",
      salary: "$1,350",
      startDate: "Mar 13, 2023",
      lifecycle: "Hired",
      status: "Invited"
    },
    {
      id: 1,
      name: "Ksenia Bator",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332c647?w=40&h=40&fit=crop&crop=face&auto=format",
      jobTitle: "Fullstack Engineer",
      department: "Engineering",
      site: "🇺🇸 Miami",
      salary: "$1,500",
      startDate: "Oct 13, 2023",
      lifecycle: "Hired",
      status: "Absent"
    },
    {
      id: 2,
      name: "Bogdan Nikitin",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face&auto=format",
      jobTitle: "Mobile Lead",
      department: "Product",
      site: "🇺🇦 Kyiv",
      salary: "$2,600",
      startDate: "Nov 4, 2023",
      lifecycle: "Employed",
      status: "Invited"
    },
    {
      id: 3,
      name: "Arsen Yatsenko",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face&auto=format",
      jobTitle: "Sales Manager",
      department: "Operations",
      site: "🇨🇦 Ottawa",
      salary: "$900",
      startDate: "Sep 4, 2021",
      lifecycle: "Employed",
      status: "Invited"
    },
    {
      id: 4,
      name: "Daria Yurchenko",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face&auto=format",
      jobTitle: "Network engineer",
      department: "Product",
      site: "🇧🇷 Sao Paulo",
      salary: "$1,000",
      startDate: "Feb 21, 2023",
      lifecycle: "Hired",
      status: "Invited"
    },
    {
      id: 5,
      name: "Yulia Polishchuk",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face&auto=format",
      jobTitle: "Head of Design",
      department: "Product",
      site: "🇬🇧 London",
      salary: "$1,700",
      startDate: "Aug 2, 2024",
      lifecycle: "Employed",
      status: "Absent"
    }
  ];

  const toggleRowSelection = (id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Invited':
        return 'bg-green-100 text-green-800';
      case 'Absent':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-8">
            <div className="flex items-center bg-[#e6f0fa] rounded-full px-4 py-2">
              <img src={logo} alt="Logo" className="h-8 w-8 mr-2" />
              <span className="text-xl font-semibold text-gray-800">HopeHub</span>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="#" className="text-gray-600 hover:text-gray-800">Dashboard</a>
              <a href="#" className="bg-blue-800 text-white px-4 py-2 rounded-full">People</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">Hiring</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">Devices</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">Apps</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">Salary</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">Calendar</a>
              <a href="#" className="text-gray-600 hover:text-gray-800">Reviews</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Settings className="w-5 h-5 text-gray-600 cursor-pointer" />
            <Bell className="w-5 h-5 text-gray-600 cursor-pointer" />
            <User className="w-5 h-5 text-gray-600 cursor-pointer" />
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg">
          {/* Page Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-8">People</h1>
          
          {/* Stats Section */}
          <div className="flex items-center space-x-8 mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Interviews</span>
                <div className="flex items-center">
                  <div className="bg-blue-800 text-white px-3 py-1 rounded-l-full text-sm">25%</div>
                  <div className="bg-blue-200 text-blue-800 px-6 py-1 rounded-r-full text-sm">51%</div>
                </div>
                <span className="text-sm text-gray-600 ml-2">Hired</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Project time</span>
              <div className="bg-blue-100 px-3 py-1 rounded-full text-sm text-blue-800">10%</div>
              <span className="text-sm text-gray-600">Output</span>
              <div className="bg-blue-100 px-3 py-1 rounded-full text-sm text-blue-800">14%</div>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Directory</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Org Chat</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Insights</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Table Controls */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Columns</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Department</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Site</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Lifecycle</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Status</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Entity</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Search" 
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="bg-blue-100 p-2 rounded-lg">
                <Plus className="w-4 h-4 text-blue-800" />
              </button>
              <button className="bg-blue-100 p-2 rounded-lg">
                <Filter className="w-4 h-4 text-blue-800" />
              </button>
              <button className="flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-lg">
                <Download className="w-4 h-4 text-blue-800" />
                <span className="text-sm text-blue-800">Export</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-lg border border-blue-100">
            <table className="w-full">
              <thead className="bg-blue-50">
                <tr>
                  <th className="w-12 px-6 py-3 text-left">
                    <input type="checkbox" className="rounded border-blue-300" />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                    Job title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                    Site
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                    Start date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                    Lifecycle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-blue-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-blue-100">
                {employees.map((employee) => (
                  <tr 
                    key={employee.id} 
                    className={`hover:bg-blue-50 ${
                      selectedRows.includes(employee.id) ? 'bg-blue-100' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-blue-300"
                        checked={selectedRows.includes(employee.id)}
                        onChange={() => toggleRowSelection(employee.id)}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={employee.avatar} 
                          alt={employee.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.jobTitle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.site}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.salary}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.startDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {employee.lifecycle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultantDashboard;
