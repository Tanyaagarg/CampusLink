"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Trash2, X } from "lucide-react";
import { useNotifications } from "@/components/providers/NotificationContext";
import { UserAvatar } from "@/components/UserAvatar";

export default function NotificationsPage() {
    const { notifications, unreadCount, markAsRead, deleteNotification } = useNotifications();
    const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

    // Grouping Logic
    const groupedNotifications = {
        Today: notifications.filter(n => {
            const date = new Date(n.timestamp);
            const today = new Date();
            return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
        }),
        Yesterday: notifications.filter(n => {
            const date = new Date(n.timestamp);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();
        }),
        Earlier: notifications.filter(n => {
            const date = new Date(n.timestamp);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            return date < yesterday; // Anything before yesterday
        })
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        Notifications
                        {unreadCount > 0 && (
                            <span className="bg-neon-blue text-black text-xs font-bold px-2 py-1 rounded-full">
                                {unreadCount} New
                            </span>
                        )}
                    </h1>
                    <p className="text-gray-400">Stay updated with your campus activity.</p>
                </div>
            </div>

            {/* Notification List */}
            <div className="space-y-8">
                {Object.entries(groupedNotifications).map(([group, items]) => (
                    items.length > 0 && (
                        <div key={group} className="space-y-4">
                            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pl-1">{group}</h2>
                            <AnimatePresence mode="popLayout">
                                {items.map((notif) => (
                                    <motion.div
                                        key={notif.id}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                        onClick={() => markAsRead(notif.id)}
                                        className={`group relative p-4 rounded-xl border transition-all cursor-pointer overflow-hidden ${notif.read
                                            ? 'bg-[#0a0a0a] border-[#222] hover:border-[#333] hover:bg-[#0f0f0f]'
                                            : 'bg-[#111] border-neon-blue/30 shadow-[0_0_15px_rgba(0,136,255,0.05)] hover:shadow-[0_0_20px_rgba(0,136,255,0.1)] hover:bg-[#1a1a1a]'
                                            }`}
                                    >
                                        {/* Unread Indicator Effect (Left Border Glow) */}
                                        {!notif.read && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-blue shadow-[0_0_10px_#0088ff]" />
                                        )}

                                        <div className="flex gap-4 items-start pl-2">
                                            {/* Icon or Avatar */}
                                            <div className="shrink-0 relative">
                                                {notif.avatar ? (
                                                    <UserAvatar
                                                        src={notif.avatar}
                                                        name={notif.title}
                                                        className="w-12 h-12 border-2 border-[#222]"
                                                    />
                                                ) : (
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${notif.bg} ${notif.color} border border-white/5`}>
                                                        <notif.icon className="w-6 h-6" />
                                                    </div>
                                                )}

                                                {/* Type Icon Badges for Avatars */}
                                                {notif.avatar && (
                                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full ${notif.bg} ${notif.color} flex items-center justify-center border-2 ${notif.read ? 'border-[#0a0a0a]' : 'border-[#111]'}`}>
                                                        <notif.icon className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start pr-6">
                                                    <h3 className={`font-semibold truncate transition-colors ${notif.read ? 'text-gray-300' : 'text-white'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{notif.time}</span>
                                                </div>
                                                <p className={`text-sm mt-1 line-clamp-2 transition-colors ${notif.read ? 'text-gray-600' : 'text-gray-400'}`}>
                                                    {notif.message}
                                                </p>
                                            </div>

                                            {/* Delete Action (Visible on Hover) */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setNotificationToDelete(notif.id);
                                                }}
                                                className="absolute right-4 bottom-4 p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200"
                                                title="Delete notification"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No notifications yet</p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {notificationToDelete && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setNotificationToDelete(null)}>
                    <div className="bg-[#181818] border border-[#222] rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-2">Delete Notification?</h3>
                        <p className="text-gray-400 text-sm mb-6">Are you sure you want to delete this notification? This action cannot be undone.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setNotificationToDelete(null)}
                                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-[#222] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (notificationToDelete) {
                                        deleteNotification(notificationToDelete);
                                        setNotificationToDelete(null);
                                    }
                                }}
                                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

