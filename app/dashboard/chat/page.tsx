
"use client";

import { Suspense } from "react";
import { useState, useRef, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MoreVertical, Paperclip, Send, Check, CheckCheck, ArrowLeft, Phone, Trash2, MessageSquare, Plus, Info } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";

function ChatContent() {
    const [activeChat, setActiveChat] = useState<any | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [mobileShowChat, setMobileShowChat] = useState(false);
    const [conversations, setConversations] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [currentUser, setCurrentUser] = useState<{ id: string, name: string | null, image: string | null } | null>(null);
    const [chatSearchTerm, setChatSearchTerm] = useState("");
    const [showChatSearch, setShowChatSearch] = useState(false);

    // Sidebar search (filtering conversations)
    const [sidebarSearchTerm, setSidebarSearchTerm] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check for ID in params
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialChatId = searchParams.get("id");
    const targetUserId = searchParams.get("userId");

    // Fetch current user
    useEffect(() => {
        const fetchUser = async () => {
            try {
                // detailed user fetch
                const res = await fetch("/api/user/me");
                if (res.ok) {
                    const data = await res.json();
                    if (data?.id) {
                        setCurrentUser(data);
                        return; // Success
                    }
                }

                // Fallback to session if API fails (guarantees Name/Image)
                const sessionRes = await fetch("/api/auth/session");
                const session = await sessionRes.json();
                if (session?.user) {
                    setCurrentUser({
                        id: session.user.id || "",
                        name: session.user.name || "",
                        image: session.user.image || ""
                    });
                }
            } catch (e) {
                console.error("Failed to fetch current user", e);
            }
        };
        fetchUser();
    }, []);

    // Helper to check equality
    const isSameData = (prev: any[], next: any[]) => {
        return JSON.stringify(prev) === JSON.stringify(next);
    };

    // Fetch conversations - Modified to return data
    const fetchConversations = async () => {
        try {
            const res = await fetch("/api/chat");
            if (res.ok) {
                const data = await res.json();

                // Only update if changed
                setConversations(prev => {
                    if (isSameData(prev, data)) return prev;
                    return data;
                });

                // If ID present in URL (e.g. ?id=xyz), select it only if we haven't selected one yet
                if (initialChatId && !activeChat && !targetUserId) {
                    const target = data.find((c: any) => c.id === initialChatId);
                    if (target) setActiveChat(target);
                }

                return data; // Return for usage in other functions
            }
        } catch (error) {
            console.error("Failed to fetch chats", error);
        }
        return null;
    };

    // Handle targetUserId (for starting chat from other modules)
    useEffect(() => {
        const initChatWithUser = async () => {
            if (!targetUserId) return;

            // Check if already in correct chat
            if (activeChat?.otherUser?.id === targetUserId) {
                return;
            }

            try {
                const res = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ targetUserId })
                });

                if (res.ok) {
                    const newConversation = await res.json();

                    // IMMEDIATE UPDATE: Set active chat directly from response
                    // This bypasses the wait for the list to update
                    setActiveChat(newConversation);
                    setMobileShowChat(true);

                    // Background: Refresh list so it appears in sidebar
                    fetchConversations();
                }
            } catch (error) {
                console.error("Failed to init chat", error);
            }
        };

        if (targetUserId) {
            initChatWithUser();
        }
    }, [targetUserId, activeChat]); // Depend on activeChat to check current state

    // Initial Load & Polling (Interval reduced to 1s for responsiveness)
    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 1000);
        return () => clearInterval(interval);
    }, []);

    // Fetch messages
    const fetchMessages = async (chatId: string) => {
        try {
            const res = await fetch(`/api/chat/${chatId}`);
            if (res.ok) {
                const data = await res.json();
                const formatted = data.map((m: any) => ({
                    id: m.id,
                    text: m.text,
                    type: m.type,
                    attachment: m.attachment,
                    sender: activeChat?.otherUser?.id && m.senderId !== activeChat.otherUser.id ? "me" : "them",
                    senderId: m.sender.id,
                    time: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: m.read ? "read" : "sent"
                }));

                // Only update if changed
                setMessages(prev => {
                    if (isSameData(prev, formatted)) return prev;
                    return formatted;
                });
            }
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    // Polling for messages (Interval reduced to 1s for responsiveness)
    useEffect(() => {
        if (!activeChat?.id) return;
        fetchMessages(activeChat.id);
        const interval = setInterval(() => fetchMessages(activeChat.id), 1000);
        return () => clearInterval(interval);
    }, [activeChat?.id]);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handlers
    const handleSendMessage = async (payload?: { text?: string, type?: string, attachment?: string }) => {
        if ((!messageInput.trim() && !payload) || !activeChat) return;

        const body = payload || { text: messageInput, type: "text" };
        const tempId = "temp-" + Date.now();
        const tempMessage = {
            id: tempId,
            text: body.text || "",
            type: body.type || "text",
            attachment: body.attachment,
            sender: "me",
            senderId: currentUser?.id,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: "sending"
        };

        // Optimistic update
        setMessageInput("");
        setMessages(prev => [...prev, tempMessage]);

        try {
            const res = await fetch(`/api/chat/${activeChat.id}`, {
                method: "POST",
                body: JSON.stringify(body)
            });

            if (res.ok) {
                // Fetch latest to get real ID and status
                fetchMessages(activeChat.id);
                fetchConversations();
            } else {
                // If failed, remove the temp message
                setMessages(prev => prev.filter(m => m.id !== tempId));
                console.error("Failed to send message: Server error");
            }
        } catch (error) {
            console.error("Failed to send message", error);
            // If failed, remove the temp message
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const type = file.type.startsWith("image/") ? "image" : "file";
                    handleSendMessage({
                        text: type === "image" ? "Sent an image" : "Sent a file",
                        type,
                        attachment: event.target.result as string
                    });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleContactClick = (conversation: any) => {
        setActiveChat(conversation);
        setMobileShowChat(true);
        setChatSearchTerm("");
        setShowChatSearch(false);
    };

    const handleBackToContacts = () => {
        setMobileShowChat(false);
    };

    // Unsend Message Logic
    const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
    const [chatToDelete, setChatToDelete] = useState<string | null>(null);

    const handleDeleteMessage = async (messageId: string) => {
        try {
            const res = await fetch(`/api/chat/message/${messageId}`, {
                method: "DELETE"
            });
            if (res.ok) {
                // Remove from local state immediately
                setMessages(prev => prev.filter(m => m.id !== messageId));
                setMessageToDelete(null);
            } else {
                const errorText = await res.text();
                alert(`Error: ${errorText} `);
            }
        } catch (error) {
            console.error("Failed to delete message", error);
            alert("Failed to delete message. Network or Code error.");
        }
    };

    const handleDeleteChat = async (chatId: string) => {
        try {
            const res = await fetch(`/api/chat/${chatId}`, { method: "DELETE" });
            if (res.ok) {
                setConversations(prev => prev.filter(c => c.id !== chatId));
                if (activeChat?.id === chatId) {
                    setActiveChat(null);
                    setMessages([]);
                }
                setChatToDelete(null);
            } else {
                const errorText = await res.text();
                alert(`Error: ${errorText} `);
            }
        } catch (error) {
            console.error("Failed to delete chat", error);
        }
    };

    // Filter conversations list (and deduplicate by user)
    const filteredConversations = conversations
        .filter(c =>
            c.otherUser?.name?.toLowerCase().includes(sidebarSearchTerm.toLowerCase()) ||
            c.lastMessage?.toLowerCase().includes(sidebarSearchTerm.toLowerCase())
        )
        .filter((chat, index, self) =>
            // Deduplicate: Keep only the first occurrence of each otherUser.id
            index === self.findIndex((c) => c.otherUser?.id === chat.otherUser?.id)
        );

    // Filter messages in active chat
    const filteredMessages = messages.filter(m =>
        m.text.toLowerCase().includes(chatSearchTerm.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-140px)] flex overflow-hidden rounded-2xl bg-[#0a0a0a] border border-[#222] shadow-2xl">

            {/* Sidebar - Contact List */}
            <div className={`${mobileShowChat ? 'hidden md:flex' : 'flex'} w-full md:w-[350px] flex-col border-r border-[#222] bg-[#0f0f0f]`}>

                {/* Sidebar Header */}
                <div className="p-4 bg-[#111] border-b border-[#222] flex justify-between items-center h-16">
                    <div className="flex items-center gap-3">
                        <div
                            onClick={() => {
                                const targetUrl = currentUser?.id
                                    ? `/dashboard/profile?userId=${currentUser.id}`
                                    : `/dashboard/profile`;
                                console.log("Navigating to:", targetUrl);
                                router.push(targetUrl);
                            }}
                            className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm shadow-[0_0_10px_rgba(0,136,255,0.4)] cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                            title="View My Profile"
                        >
                            {currentUser?.image ? (
                                <img src={currentUser.image} alt="Me" className="w-full h-full object-cover" />
                            ) : (
                                <span>
                                    {currentUser?.name
                                        ? currentUser.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
                                        : "ME"
                                    }
                                </span>
                            )}
                        </div>
                        <span className="font-bold text-white">Chats</span>
                    </div>
                </div>

                {/* Sidebar Search */}
                <div className="p-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            value={sidebarSearchTerm}
                            onChange={(e) => setSidebarSearchTerm(e.target.value)}
                            className="w-full bg-[#181818] border-none rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-1 focus:ring-neon-blue/50 placeholder:text-gray-600"
                        />
                    </div>
                </div>

                {/* Contacts List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredConversations.map((chat) => (
                        <div
                            key={chat.id}
                            onClick={() => handleContactClick(chat)}
                            className={`group relative flex items-center gap-3 p-3 cursor-pointer transition-colors border-b border-[#1a1a1a] hover:bg-[#181818] ${activeChat?.id === chat.id ? 'bg-[#181818]' : ''} `}
                        >
                            <UserAvatar
                                src={chat.otherUser?.image}
                                name={chat.otherUser?.name}
                                className="w-12 h-12"
                            />

                            <div className="flex-1 min-w-0 pr-7">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className="font-semibold text-white truncate">{chat.otherUser?.name || "Unknown"}</h3>
                                    <span className={`text-xs text-gray-500 transition-opacity group-hover:opacity-0`}>
                                        {new Date(chat.updatedAt).toLocaleDateString()}
                                    </span>
                                    {chat.unreadCount > 0 && (
                                        <span className="ml-2 bg-neon-blue text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center transition-opacity group-hover:opacity-0">
                                            {chat.unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-400 truncate">{chat.lastMessage}</p>
                                </div>
                            </div>

                            {/* Delete Chat Button */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setChatToDelete(chat.id);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-all"
                                title="Delete Conversation"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}
                </div>
            </div >

            {/* Main Chat Area */}
            <div className={`${!mobileShowChat ? 'hidden md:flex' : 'flex'} w-full flex-col bg-[#050505] relative`}>

                {
                    activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="h-16 px-4 bg-[#111] border-b border-[#222] flex justify-between items-center z-10">
                                <div className="flex items-center gap-3">
                                    <button onClick={handleBackToContacts} className="md:hidden text-gray-400 hover:text-white">
                                        <ArrowLeft className="w-6 h-6" />
                                    </button>
                                    {activeChat.otherUser && (
                                        <div
                                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => router.push(`/dashboard/profile?userId=${activeChat.otherUser.id}`)}
                                        >
                                            <div className="relative">
                                                <UserAvatar
                                                    src={activeChat.otherUser.image}
                                                    name={activeChat.otherUser.name}
                                                    className="w-10 h-10"
                                                />
                                                {(() => {
                                                    const lastSeenVal = activeChat.otherUser?.lastSeen;
                                                    const isOnline = lastSeenVal && (new Date().getTime() - new Date(lastSeenVal).getTime() < 5 * 60 * 1000);
                                                    return isOnline ? (
                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111]"></div>
                                                    ) : null;
                                                })()}
                                            </div>
                                            <div className="flex flex-col">
                                                <h3 className="font-bold text-white leading-tight">{activeChat.otherUser.name || "Unknown"}</h3>
                                                {(() => {
                                                    const lastSeenVal = activeChat.otherUser?.lastSeen;
                                                    const isOnline = lastSeenVal && (new Date().getTime() - new Date(lastSeenVal).getTime() < 5 * 60 * 1000);

                                                    if (isOnline) {
                                                        return <span className="text-xs text-green-500 font-medium">Online</span>;
                                                    }

                                                    const dateStr = lastSeenVal || activeChat.updatedAt;
                                                    if (!dateStr) return null;

                                                    const date = new Date(dateStr);
                                                    const now = new Date();
                                                    const isToday = now.toDateString() === date.toDateString();
                                                    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                                    const dateString = date.toLocaleDateString();

                                                    return (
                                                        <span className="text-xs text-gray-500">
                                                            Last seen {isToday ? `at ${timeString} ` : `on ${dateString} `}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* In-Chat Search Toggle */}
                                <div className="flex items-center gap-5 text-neon-blue">
                                    {showChatSearch ? (
                                        <div className="flex items-center bg-[#181818] rounded-lg px-2 py-1">
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Find in chat..."
                                                value={chatSearchTerm}
                                                onChange={(e) => setChatSearchTerm(e.target.value)}
                                                className="bg-transparent border-none text-white text-sm focus:outline-none w-32"
                                                onBlur={() => !chatSearchTerm && setShowChatSearch(false)}
                                            />
                                            <button onClick={() => { setShowChatSearch(false); setChatSearchTerm(""); }} className="ml-2 text-gray-400 hover:text-white">
                                                <MoreVertical className="w-4 h-4 rotate-45" />
                                            </button>
                                        </div>
                                    ) : (
                                        <Search
                                            onClick={() => setShowChatSearch(true)}
                                            className="w-5 h-5 cursor-pointer text-gray-400 hover:text-white"
                                        />
                                    )}
                                </div>
                            </div >

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 custom-scrollbar">
                                {
                                    filteredMessages.map((msg) => (
                                        <div key={msg.id} className={`flex group ${msg.sender === 'me' ? 'justify-end' : 'justify-start'} `}>

                                            {/* Delete Button (Only for 'me') */}
                                            {msg.sender === 'me' && (
                                                <button
                                                    onClick={() => setMessageToDelete(msg.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity mr-2 text-gray-500 hover:text-red-500"
                                                    title="Unsend Message"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}

                                            <div className={`max-w-[70%] rounded-xl px-4 py-2 relative shadow-md ${msg.sender === 'me'
                                                ? 'bg-cyan-500/20 text-white rounded-tr-none border border-cyan-500/30'
                                                : 'bg-[#181818] text-white rounded-tl-none border border-[#333]'
                                                } `}>

                                                {/* Attachments */}
                                                {msg.type === "image" && msg.attachment ? (
                                                    <img src={msg.attachment} alt="Attachment" className="rounded-lg mb-2 max-h-60 object-cover" />
                                                ) : msg.type === "audio" && msg.attachment ? (
                                                    <audio controls src={msg.attachment} className="mb-2 max-w-full" />
                                                ) : null}

                                                <p className="text-sm leading-snug">{msg.text}</p>

                                                <div className="flex justify-end items-center gap-1 mt-1">
                                                    <span className="text-[10px] text-gray-400/80">{msg.time}</span>
                                                    {(msg.sender === 'me') && (
                                                        msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-neon-blue" /> : <Check className="w-3 h-3 text-gray-400" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="h-16 px-4 bg-[#111] border-t border-[#222] flex items-center gap-3 z-10">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={handleFileSelect}
                                    accept="image/*,video/*,.pdf"
                                />
                                <Paperclip
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-6 h-6 text-gray-400 cursor-pointer hover:text-white transform rotate-45"
                                />

                                <input
                                    type="text"
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-[#181818] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-neon-blue/40 placeholder:text-gray-500"
                                />

                                <button
                                    onClick={() => handleSendMessage()}
                                    disabled={!messageInput.trim()}
                                    className={`p-2.5 rounded-full transition-colors ${messageInput.trim() ? 'bg-neon-blue/20 text-neon-blue hover:bg-neon-blue/30' : 'bg-[#222] text-gray-600 cursor-not-allowed'} `}
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 z-10">
                            <div className="w-20 h-20 bg-[#181818] rounded-full flex items-center justify-center mb-4">
                                <Phone className="w-8 h-8 text-gray-500" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">CampusLink Web</h2>
                            <p className="text-gray-500 max-w-md">Send and receive messages without keeping your phone online.<br />Select a contact to start chatting.</p>
                        </div>
                    )}
            </div>

            {/* Delete Confirmation Modal */}
            {
                messageToDelete && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                        <div className="bg-[#181818] border border-[#222] rounded-xl p-6 max-w-sm w-full shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-2">Unsend Message?</h3>
                            <p className="text-gray-400 text-sm mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setMessageToDelete(null)}
                                    className="px-4 py-2 rounded-lg text-gray-300 hover:bg-[#222] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteMessage(messageToDelete)}
                                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                >
                                    Unsend
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Delete Chat Confirmation Modal */}
            {
                chatToDelete && (
                    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                        <div className="bg-[#181818] border border-[#222] rounded-xl p-6 max-w-sm w-full shadow-xl">
                            <h3 className="text-lg font-bold text-white mb-2">Delete Conversation?</h3>
                            <p className="text-gray-400 text-sm mb-6">This will delete all messages in this chat. This action cannot be undone.</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setChatToDelete(null)}
                                    className="px-4 py-2 rounded-lg text-gray-300 hover:bg-[#222] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDeleteChat(chatToDelete)}
                                    className="px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full text-white">Loading...</div>}>
            <ChatContent />
        </Suspense>
    );
}
