import React from 'react';

const Dashboard = () => {
  return (
    <div className="space-y-6 mt-4">
      {/* Revenue Forecast */}
      <div className="bg-white dark:bg-darkgray p-6 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Dự báo doanh thu</h2>
          
          <div className="relative">
            <select className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm">
              <option>Tuần này</option>
              <option>Tháng này</option>
              <option>Năm nay</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="h-60 w-full">
          {/* Placeholder for chart */}
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-9 w-full h-full p-4">
              {/* Bar chart simulation */}
              {[1.2, 2.5, 1.3, 3.7, 2.1, 2.4, 2.0, 1.5, 2.2].map((height, index) => (
                <div key={index} className="flex flex-col items-center justify-end">
                  <div 
                    className={`w-6 bg-indigo-500 rounded-t-md`} 
                    style={{ height: `${height * 40}px` }}
                  ></div>
                  <div 
                    className={`w-6 bg-pink-400 rounded-b-md mt-0.5`} 
                    style={{ height: `${(Math.random() * 2) * 30}px` }}
                  ></div>
                  <span className="text-xs text-gray-500 mt-2">
                    {['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Customers */}
        <div className="bg-white dark:bg-darkgray p-6 rounded-lg">
          <div className="flex space-x-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Thành viên mới</h3>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-gray-500 mb-2">Mục tiêu mới</p>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: '83%' }}></div>
            </div>
            <div className="flex justify-end mt-1">
              <span className="text-sm font-medium text-gray-700">83%</span>
            </div>
          </div>
        </div>
        
        {/* Total Income */}
        <div className="col-span-2 bg-white dark:bg-darkgray p-6 rounded-lg">
          <div className="flex space-x-4 mb-6">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">Tổng thu nhập</h3>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">15.680.000đ</p>
              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">+18%</span>
            </div>
            
            <div className="w-40 h-16">
              {/* Placeholder for mini chart */}
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path 
                  d="M0,15 Q10,5 20,15 T40,15 T60,15 T80,5 T100,15" 
                  fill="none" 
                  stroke="#EC4899" 
                  strokeWidth="2"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      {/* Daily Activities */}
      <div className="bg-white dark:bg-darkgray p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-6">Hoạt động hàng ngày</h2>
        
        <div className="space-y-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 text-right text-sm text-gray-500">09:46</div>
            </div>
            <div className="relative flex items-center">
              <div className="flex-shrink-0 w-3 h-3 rounded-full bg-indigo-500 z-10"></div>
              <div className="flex-shrink-0 w-0.5 h-full bg-gray-200 absolute top-3 bottom-0 left-1.5 -z-10"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm">
                <span className="font-medium">Đã nhận thanh toán</span> từ Nguyễn Văn A <span className="font-medium">385.900đ</span>
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 text-right text-sm text-gray-500">08:12</div>
            </div>
            <div className="relative flex items-center">
              <div className="flex-shrink-0 w-3 h-3 rounded-full bg-indigo-500 z-10"></div>
              <div className="flex-shrink-0 w-0.5 h-full bg-gray-200 absolute top-3 bottom-0 left-1.5 -z-10"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm">
                <span className="font-medium">Đơn hàng mới</span> đã đặt #XF-2356
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3">
              <div className="w-10 text-right text-sm text-gray-500">07:25</div>
            </div>
            <div className="relative flex items-center">
              <div className="flex-shrink-0 w-3 h-3 rounded-full bg-indigo-500 z-10"></div>
            </div>
            <div className="ml-4">
              <p className="text-sm">
                <span className="font-medium">Chiến dịch đã gửi</span> tới Khách hàng #4
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 