import React, { useState } from "react";
import { ChevronDown, Plus, Filter, Download, Search, Settings, Bell, User, Share2, Bookmark, Clock, Calendar, MoreHorizontal } from 'lucide-react';

// Dữ liệu mẫu
const taskData = [
  {
    id: "develop-processing-1",
    title: "Develop Processing Plans",
    color: "bg-pink-100",
    textColor: "text-gray-800",
    assignee: {
      name: "Clair Burge",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      date: "12.11.23"
    }
  },
  {
    id: "resolve-payment",
    title: "Resolve Payment Disputes",
    color: "bg-pink-100",
    textColor: "text-gray-800",
    assignee: {
      name: "Clair Burge",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      date: "8.11.23"
    }
  },
  {
    id: "train-employees",
    title: "Train Employees",
    color: "bg-pink-100",
    textColor: "text-gray-800",
    assignee: {
      name: "Craig Curry",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      date: "8.11.23"
    }
  },
  {
    id: "recruit-new-talent",
    title: "Recruit New Talent",
    color: "bg-yellow-300",
    textColor: "text-gray-800",
    assignee: {
      name: "Heina Julie",
      avatar: "https://randomuser.me/api/portraits/women/65.jpg",
      date: "4.11.23"
    }
  },
  {
    id: "oversee-operations",
    title: "Oversee Operations",
    color: "bg-gray-100",
    textColor: "text-gray-800",
    assignee: {
      name: "Christian Bass",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      date: "11.2.23"
    }
  },
  {
    id: "develop-strategic",
    title: "Develop Strategic Plans",
    color: "bg-pink-100",
    textColor: "text-gray-800",
    assignee: {
      name: "Christian Bass",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      date: "15.11.23"
    }
  },
  {
    id: "provide-customer",
    title: "Provide Customer Service",
    color: "bg-pink-100",
    textColor: "text-gray-800",
    assignee: {
      name: "Christian Bass",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      date: "9.11.23"
    }
  },
  {
    id: "improve-efficiency",
    title: "Improve Efficiency",
    color: "bg-pink-100",
    textColor: "text-gray-800",
    assignee: {
      name: "Christian Bass",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      date: "10.11.23"
    }
  },
  {
    id: "market-services",
    title: "Market Services",
    color: "bg-yellow-300",
    textColor: "text-gray-800",
    assignee: {
      name: "Clair Burge",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      date: "6.11.23"
    }
  },
  {
    id: "implement-new-tech",
    title: "Implement New Technologies",
    color: "bg-gray-100",
    textColor: "text-gray-800",
    assignee: {
      name: "Clair Burge",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      date: "4.12.23"
    }
  }
];

// Tổ chức dữ liệu theo cột
const columns = [
  {
    id: "develop",
    title: "Develop Processing Plans",
    tasks: taskData.filter(t => t.id.includes("develop")),
  },
  {
    id: "resolve",
    title: "Resolve Payment Disputes",
    tasks: taskData.filter(t => t.id.includes("resolve")),
  },
  {
    id: "train",
    title: "Train Employees",
    tasks: taskData.filter(t => t.id.includes("train")),
  },
  {
    id: "recruit",
    title: "Recruit New Talent",
    tasks: taskData.filter(t => t.id.includes("recruit")),
  },
  {
    id: "oversee",
    title: "Oversee Operations",
    tasks: taskData.filter(t => t.id.includes("oversee")),
  }
];

export default function ScheduleManagement() {
  const [selectedTab, setSelectedTab] = useState("pipeline");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-black rounded-md flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="ml-2 font-bold text-lg">salesforce</span>
            </div>
            <button className="ml-6 flex items-center text-sm text-gray-600">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <button className={`px-4 py-2 rounded-full ${selectedTab === "pipeline" ? "bg-black text-white" : "bg-gray-100 text-gray-700"}`} 
              onClick={() => setSelectedTab("pipeline")}>
              Pipeline
            </button>
            <button className={`px-4 py-2 rounded-full ${selectedTab === "activity" ? "bg-black text-white" : "bg-gray-100 text-gray-700"}`}
              onClick={() => setSelectedTab("activity")}>
              Activity
            </button>
            <button className={`px-4 py-2 rounded-full ${selectedTab === "comments" ? "bg-black text-white" : "bg-gray-100 text-gray-700"}`}
              onClick={() => setSelectedTab("comments")}>
              Comments
            </button>
            <button className={`px-4 py-2 rounded-full ${selectedTab === "reports" ? "bg-black text-white" : "bg-gray-100 text-gray-700"}`}
              onClick={() => setSelectedTab("reports")}>
              Reports
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Title Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="text-sm text-gray-500">Task Schedule</div>
            <h1 className="text-3xl font-bold">Daily Operation</h1>
          </div>

          <div className="flex items-center space-x-2">
            <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600">
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-full text-sm">
            <span className="mr-1">Still Running</span>
            <span className="bg-yellow-400 text-black w-5 h-5 rounded-full flex items-center justify-center text-xs">5</span>
          </div>
          <div className="flex items-center bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm">
            <span className="mr-1">Disqualified</span>
            <span className="bg-white text-black w-5 h-5 rounded-full flex items-center justify-center text-xs">4</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-xl shadow-sm border-b-4 border-gray-200">
            <div className="text-sm text-gray-500">Week's Tasks</div>
            <div className="text-2xl font-bold">132</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-b-4 border-gray-200">
            <div className="text-sm text-gray-500">Pending Approval</div>
            <div className="text-2xl font-bold">34</div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-b-4 border-yellow-400">
            <div className="text-sm text-gray-500">Employees Involved</div>
            <div className="text-2xl font-bold">22</div>
          </div>
        </div>

        {/* Task Board */}
        <div className="grid grid-cols-5 gap-5">
          {columns.map((column) => (
            <div key={column.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 flex justify-between items-center">
                <h3 className="font-semibold text-gray-700">{column.title}</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreHorizontal size={16} />
                </button>
              </div>
              
              <div className="px-3 pb-3">
                {column.tasks.map((task) => (
                  <div 
                    key={task.id}
                    className={`${task.color} ${task.textColor} mb-3 p-4 rounded-lg relative`}
                  >
                    {/* Task bookmark indicator */}
                    {task.id === "provide-customer" && (
                      <div className="absolute right-4 top-4">
                        <div className="w-4 h-5 bg-black"></div>
                      </div>
                    )}
                    
                    <h4 className="font-medium mb-3">{task.title}</h4>
                    
                    {/* Progress bar */}
                    <div className="w-full h-1.5 bg-gray-200 rounded-full mb-4">
                      <div className="h-full bg-gray-400 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    
                    {/* Assignee */}
                    <div className="flex items-center">
                      <img 
                        src={task.assignee.avatar} 
                        alt={task.assignee.name} 
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium">{task.assignee.name}</div>
                        <div className="text-xs text-gray-500">{task.assignee.date}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
