import { cn } from "@/lib/utils";

interface UserAvatarProps {
    src?: string | null;
    name?: string | null;
    className?: string;
}

export function UserAvatar({ src, name, className }: UserAvatarProps) {
    const getInitials = (name: string) => {
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    return (
        <div className={cn("relative overflow-hidden rounded-full shrink-0", className)}>
            {src ? (
                <img
                    src={src}
                    alt={name || "User"}
                    className="w-full h-full object-cover"
                    style={{ border: "none", background: "transparent" }}
                />
            ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                    {name ? getInitials(name) : "?"}
                </div>
            )}
        </div>
    );
}
