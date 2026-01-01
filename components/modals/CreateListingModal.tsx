"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Tag, DollarSign, Image as ImageIcon } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateListingModal({ isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setSelectedImage(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        const data = {
            title: formData.get("title"),
            category: formData.get("category"),
            price: formData.get("price"),
            condition: formData.get("condition") || "Used",
            // For now we skip actual image upload until UploadThing is configured
            images: []
        };

        try {
            const res = await fetch("/api/marketplace", {
                method: "POST",
                body: JSON.stringify(data),
                headers: { "Content-Type": "application/json" }
            });

            if (res.ok) {
                onClose();
                form.reset();
                setSelectedImage(null);
                if (onSuccess) onSuccess();
            } else {
                alert("Failed to post item");
            }
        } catch (error) {
            console.error("Error posting item:", error);
            alert("Error posting item");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Sell an Item">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Item Name</label>
                    <input
                        name="title"
                        required
                        type="text"
                        placeholder="e.g. Engineering Mathematics Book"
                        className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 px-4 text-white focus:outline-none focus:border-cyan-400/50"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
                            <select name="category" className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-400/50 appearance-none">
                                <option>Books</option>
                                <option>Electronics</option>
                                <option>Furniture</option>
                                <option>Supplies</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Price</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-gray-400 font-bold">₹</span>
                            <input
                                name="price"
                                required
                                type="number"
                                placeholder="0"
                                className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-8 pr-4 text-white focus:outline-none focus:border-cyan-400/50"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Condition</label>
                    <div className="flex gap-2">
                        {["New", "Like New", "Good", "Used"].map(cond => (
                            <label key={cond} className="flex-1 cursor-pointer">
                                <input type="radio" name="condition" value={cond} className="peer sr-only" />
                                <div className="text-center py-2 rounded-lg bg-[#181818] border border-[#333] text-gray-400 peer-checked:bg-cyan-400/20 peer-checked:text-cyan-400 peer-checked:border-cyan-400/50 transition-all text-sm">
                                    {cond}
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Upload Image</label>
                    <div className="border-2 border-dashed border-[#333] rounded-xl p-4 flex flex-col items-center justify-center text-gray-500 hover:border-cyan-400/50 hover:bg-[#181818] transition-all cursor-pointer relative overflow-hidden group">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />

                        {selectedImage ? (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden">
                                <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <p className="text-white text-sm font-bold">Change Image</p>
                                </div>
                            </div>
                        ) : (
                            <div className="py-4 flex flex-col items-center">
                                <ImageIcon className="w-8 h-8 mb-2" />
                                <span className="text-xs">Click to upload photo</span>
                            </div>
                        )}
                    </div>
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-[1.02] disabled:opacity-50"
                >
                    {loading ? "Listing..." : "Post Item"}
                </button>
            </form>
        </Modal>
    );
}
