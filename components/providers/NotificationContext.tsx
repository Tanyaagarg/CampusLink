"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserPlus, Car, GraduationCap, MessageCircle, Bell } from "lucide-react";

export interface Notification {
    id: string; // Changed from number to string for UUIDs
    type: string;
    title: string;
    message: string;
    time: string; // We'll compute this from timestamp
    timestamp: number;
    read: boolean;
    icon: any;
    color: string;
    bg: string;
    avatar: string | null;
    createdAt?: string;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    chatUnreadCount: number;
    markAsRead: (id: string) => void;
    deleteNotification: (id: string) => void;
    refreshChatCount: () => void;
    refreshNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Helper to format time relative
const timeAgo = (date: string | Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return "Just now";
};

// Helper to map type to icon/color
const getNotificationStyle = (type: string) => {
    switch (type) {
        case "TEAM_REQUEST":
            return { icon: UserPlus, color: "text-blue-400", bg: "bg-blue-400/10" };
        case "RIDE_REQUEST":
            return { icon: Car, color: "text-green-400", bg: "bg-green-400/10" };
        case "TUTOR_REQUEST":
            return { icon: GraduationCap, color: "text-purple-400", bg: "bg-purple-400/10" };
        case "MESSAGE":
            return { icon: MessageCircle, color: "text-yellow-400", bg: "bg-yellow-400/10" };
        default:
            return { icon: Bell, color: "text-gray-400", bg: "bg-gray-400/10" };
    }
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        try {
            const res = await fetch("/api/notifications");
            if (res.ok) {
                const data = await res.json();
                const formatted = data.map((n: any) => {
                    const style = getNotificationStyle(n.type);
                    return {
                        id: n.id,
                        type: n.type,
                        title: n.title,
                        message: n.message,
                        read: n.read,
                        timestamp: new Date(n.createdAt).getTime(),
                        time: timeAgo(n.createdAt),
                        icon: style.icon,
                        color: style.color,
                        bg: style.bg,
                        avatar: null // Avatar logic might need user fetch, for now basic
                    } as Notification;
                });
                setNotifications(formatted);
            }
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        }
    };

    const fetchChatUnreadCount = async () => {
        try {
            const res = await fetch("/api/chat/unread");
            if (res.ok) {
                const data = await res.json();
                setChatUnreadCount(data.count || 0);
            }
        } catch (error) {
            console.error("Failed to fetch chat unread count", error);
        }
    };

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            await fetch(`/api/notifications/${id}`, { method: "PATCH" });
        } catch (error) {
            console.error("Failed to mark as read", error);
        }
    };

    const deleteNotification = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.filter(n => n.id !== id));
        try {
            await fetch(`/api/notifications/${id}`, { method: "DELETE" });
        } catch (error) {
            console.error("Failed to delete notification", error);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        fetchNotifications();
        fetchChatUnreadCount();
        const interval = setInterval(() => {
            fetchChatUnreadCount();
            fetchNotifications(); // Also poll notifications
        }, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            chatUnreadCount,
            markAsRead,
            deleteNotification,
            refreshChatCount: fetchChatUnreadCount,
            refreshNotifications: fetchNotifications
        }}>
            {children}
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
}
