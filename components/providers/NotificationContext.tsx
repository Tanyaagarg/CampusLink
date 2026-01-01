"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UserPlus, Car, GraduationCap, MessageCircle } from "lucide-react";

interface Notification {
    id: number;
    type: string;
    title: string;
    message: string;
    time: string;
    timestamp: number;
    read: boolean;
    icon: any;
    color: string;
    bg: string;
    avatar: string | null;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    chatUnreadCount: number;
    markAsRead: (id: number) => void;
    deleteNotification: (id: number) => void;
    refreshChatCount: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const initialNotifications: Notification[] = [];

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
    const [chatUnreadCount, setChatUnreadCount] = useState(0);

    const markAsRead = (id: number) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const deleteNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
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

    // Initial fetch and polling
    useEffect(() => {
        fetchChatUnreadCount();
        const interval = setInterval(fetchChatUnreadCount, 2000); // Poll every 2 seconds
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
            refreshChatCount: fetchChatUnreadCount
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
