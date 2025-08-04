import React, { useState } from 'react';
import { Bell, MessageSquare, Megaphone, CheckCircle, X } from 'lucide-react';

interface Notification {
  id: string;
  type: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Sales' | 'Products' | 'Operations';
}

interface Message {
  id: string;
  from: string;
  title: string;
  preview: string;
  time: string;
  read: boolean;
}

const Communications: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'notifications' | 'announcements' | 'messages'>('notifications');
  const [unreadNotifications] = useState(2);
  const [newMessages] = useState(2);

  const notifications: Notification[] = [
    {
      id: '1',
      type: 'high',
      title: 'New Product Launch: Handcrafted Pottery Collection',
      message: "We're excited to announce the launch of our new handcrafted pottery collection from artisans in Khurja. These products are now available for distribution.",
      time: '2 hours ago',
      read: false
    },
    {
      id: '2',
      type: 'medium',
      title: 'Festival Season Promotion - 20% Off Textiles',
      message: 'Special promotion for the upcoming festival season. All textile products are now available at 20% discount for bulk orders above ₹50,000.',
      time: '1 day ago',
      read: false
    },
    {
      id: '3',
      type: 'high',
      title: 'Stock Replenishment Alert',
      message: 'Your inventory for Brass Decorative Bowls is running low. Please place a restock order to avoid stockouts.',
      time: '2 days ago',
      read: true
    },
    {
      id: '4',
      type: 'low',
      title: 'System Maintenance Scheduled',
      message: 'Scheduled maintenance on Sunday, 2 AM - 4 AM IST. The distributor portal will be temporarily unavailable during this time.',
      time: '3 days ago',
      read: true
    }
  ];

  const announcements: Announcement[] = [
    {
      id: '1',
      title: 'Q4 Sales Target Achievement Program',
      content: "We're launching a special incentive program for Q4. Distributors who achieve 120% of their sales target will receive a 5% bonus on all sales and priority access to new product launches.",
      date: '2024-01-15',
      category: 'Sales'
    },
    {
      id: '2',
      title: 'New Artisan Partnership - Madhya Pradesh',
      content: "We've partnered with 15 new artisans from Madhya Pradesh specializing in traditional woodwork and metal crafts. These products will be available for distribution starting next month.",
      date: '2024-01-12',
      category: 'Products'
    },
    {
      id: '3',
      title: 'Updated Shipping Policies',
      content: "We've updated our shipping policies to provide faster delivery times. All orders placed before 2 PM will now be processed the same day, with delivery within 3-5 business days.",
      date: '2024-01-10',
      category: 'Operations'
    }
  ];

  const messages: Message[] = [
    {
      id: '1',
      from: 'Regional Manager',
      title: 'Monthly Performance Review',
      preview: 'Your performance metrics for this month show excellent growth...',
      time: '1 hour ago',
      read: false
    },
    {
      id: '2',
      from: 'Product Team',
      title: 'New Product Training Materials',
      preview: "We've prepared comprehensive training materials for the new pottery collection...",
      time: '3 hours ago',
      read: false
    },
    {
      id: '3',
      from: 'Support Team',
      title: 'Customer Feedback Summary',
      preview: "Here's a summary of customer feedback for products in your region...",
      time: '1 day ago',
      read: true
    }
  ];

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sales':
        return 'bg-green-100 text-green-800';
      case 'Products':
        return 'bg-blue-100 text-blue-800';
      case 'Operations':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Communication Hub</h2>
        <p className="text-gray-600">Stay updated with announcements, notifications, and messages</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unread Notifications</p>
              <p className="text-2xl font-bold text-red-600">{unreadNotifications}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <Bell className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New Messages</p>
              <p className="text-2xl font-bold text-blue-600">{newMessages}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Recent Announcements</p>
              <p className="text-2xl font-bold text-green-600">{announcements.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <Megaphone className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('notifications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                selectedTab === 'notifications'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
              {unreadNotifications > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedTab('announcements')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                selectedTab === 'announcements'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Announcements</span>
            </button>
            <button
              onClick={() => setSelectedTab('messages')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                selectedTab === 'messages'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
              {newMessages > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {newMessages}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === 'notifications' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Notifications</h3>
            <p className="text-sm text-gray-500 mt-1">Important updates and alerts for your distribution network</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <div key={notification.id} className={`p-6 border-l-4 ${getNotificationColor(notification.type)} ${!notification.read ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-sm font-medium text-gray-900">{notification.title}</h4>
                      {notification.type === 'high' && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">High</span>
                      )}
                      {notification.type === 'medium' && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Medium</span>
                      )}
                      {notification.type === 'low' && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">Low</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {notification.read ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <button className="text-gray-400 hover:text-gray-600">
                        <CheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button className="text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'announcements' && (
        <div className="space-y-6">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(announcement.category)}`}>
                      {announcement.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{announcement.date}</p>
                </div>
              </div>
              <p className="text-gray-600">{announcement.content}</p>
            </div>
          ))}
        </div>
      )}

      {selectedTab === 'messages' && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
            <p className="text-sm text-gray-500 mt-1">Direct messages from the RootsReach team</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {messages.map((message) => (
              <div key={message.id} className={`p-6 hover:bg-gray-50 cursor-pointer ${!message.read ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-sm font-medium text-gray-900">{message.title}</p>
                      {!message.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">From: {message.from}</p>
                    <p className="text-sm text-gray-500">{message.preview}</p>
                    <p className="text-xs text-gray-400 mt-2">{message.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Communications;
