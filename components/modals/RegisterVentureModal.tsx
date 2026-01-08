"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { Coffee, Clock, Phone, MapPin, Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
    ventureToEdit?: any; // If provided, we are in Edit Mode
}

export default function RegisterVentureModal({ isOpen, onClose, onSuccess, ventureToEdit }: Props) {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Basic Info, 2: Catalog

    // Pre-fill state if editing, otherwise defaults
    const [name, setName] = useState(ventureToEdit?.name || "");
    const [description, setDescription] = useState(ventureToEdit?.description || "");
    const [category, setCategory] = useState(ventureToEdit?.category || "Food & Beverages");
    const [timing, setTiming] = useState(ventureToEdit?.timing || "");
    const [contact, setContact] = useState(ventureToEdit?.contact || "");
    const [hostel, setHostel] = useState(ventureToEdit?.hostel || "");

    // Catalog State
    const [catalog, setCatalog] = useState<any[]>(
        ventureToEdit?.catalog && Array.isArray(ventureToEdit.catalog)
            ? ventureToEdit.catalog
            : [{ name: "Best Sellers", items: [] }]
    );

    // Logo State
    const [logo, setLogo] = useState(ventureToEdit?.logo || "");

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setLogo(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // Reset form when opening/closing or changing ventureToEdit
    // We use a key or useEffect in parent usually, but re-initializing state on open is good
    // Here we rely on the parent to unmount/remount or we can add a useEffect to sync if needed.
    // For simplicity, we assume the modal is conditionally rendered or state is lifted. 
    // Actually, to be safe, let's add a useEffect to sync state when ventureToEdit changes.
    // However, since we are inside the component body, let's just make sure we handle the submit correctly.

    const addGroup = () => {
        setCatalog([...catalog, { name: "New Category", items: [] }]);
    };

    const deleteGroup = (groupIndex: number) => {
        const newCatalog = [...catalog];
        newCatalog.splice(groupIndex, 1);
        setCatalog(newCatalog);
    };

    const updateGroupName = (index: number, newName: string) => {
        const newCatalog = [...catalog];
        newCatalog[index].name = newName;
        setCatalog(newCatalog);
    };

    const addItem = (groupIndex: number) => {
        const newCatalog = [...catalog];
        newCatalog[groupIndex].items.push({ name: "", price: "" });
        setCatalog(newCatalog);
    };

    const updateItem = (groupIndex: number, itemIndex: number, field: string, value: string) => {
        const newCatalog = [...catalog];
        newCatalog[groupIndex].items[itemIndex][field] = value;
        setCatalog(newCatalog);
    };

    const deleteItem = (groupIndex: number, itemIndex: number) => {
        const newCatalog = [...catalog];
        newCatalog[groupIndex].items.splice(itemIndex, 1);
        setCatalog(newCatalog);
    };

    const validateStep1 = () => {
        if (!name.trim()) return "Business Name is required";
        if (!description.trim()) return "Description is required";
        if (!timing.trim()) return "Operating Hours are required";
        if (!contact.trim()) return "Contact Number is required";
        if (!hostel.trim()) return "Hostel/Location is required";
        return null;
    };

    const handleNext = () => {
        const error = validateStep1();
        if (error) {
            alert(error);
            return;
        }
        setStep(2);
    };

    const handleSubmit = async () => {
        setLoading(true);

        try {
            const url = ventureToEdit ? "/api/ventures" : "/api/ventures";
            const method = ventureToEdit ? "PUT" : "POST";

            const payload = {
                ventureId: ventureToEdit?.id, // Only for PUT
                name,
                description,
                category,
                timing,
                contact,
                hostel,
                logo,
                catalog
            };

            console.log("Submitting payload:", { ...payload, logo: logo ? "String length: " + logo.length : "empty" });

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                if (onSuccess) onSuccess();
                onClose();
                // Only reset if NOT editing (or rely on parent to close modal)
                if (!ventureToEdit) {
                    setName("");
                    setDescription("");
                    setTiming("");
                    setContact("");
                    setHostel("");
                    setCatalog([{ name: "Best Sellers", items: [] }]);
                    setStep(1);
                }
            } else {
                const text = await res.text();
                try {
                    const errorData = JSON.parse(text);
                    alert(`Failed to ${ventureToEdit ? "update" : "register"}: ${errorData.error || "Unknown error"}`);
                } catch {
                    console.error("Non-JSON error response:", text);
                    alert(`Server Error (${res.status}): Please check console for details.`);
                }
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={step === 1 ? (ventureToEdit ? "Edit Business (1/2)" : "Register Business (1/2)") : "Build Your Menu (2/2)"}>
            {step === 1 ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Business Name</label>
                        <input
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. The late Night Kitchen"
                            className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 px-4 text-white focus:outline-none focus:border-amber-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Description (Short Bio)</label>
                        <textarea
                            required
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What do you sell?"
                            className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 px-4 text-white focus:outline-none focus:border-amber-500/50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                            <div className="relative">
                                <Coffee className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500/50 appearance-none"
                                >
                                    <option>Food & Beverages</option>
                                    <option>Merchandise</option>
                                    <option>Services</option>
                                    <option>Events</option>
                                    <option>Arts & Crafts</option>
                                    <option>Stationery & Books</option>
                                    <option>Technology & Gadgets</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Hostel / Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
                                <input
                                    required
                                    type="text"
                                    value={hostel}
                                    onChange={(e) => setHostel(e.target.value)}
                                    placeholder="e.g. J Hostel"
                                    className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500/50"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Operating Hours</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
                                <input
                                    required
                                    type="text"
                                    value={timing}
                                    onChange={(e) => setTiming(e.target.value)}
                                    placeholder="e.g. 8 PM - 2 AM"
                                    className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500/50"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Contact Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
                                <input
                                    required
                                    type="tel"
                                    value={contact}
                                    onChange={(e) => setContact(e.target.value)}
                                    placeholder="+91"
                                    className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-amber-500/50"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Title Photo (Optional)</label>
                        <div className="border border-[#333] border-dashed rounded-xl p-3 flex items-center justify-center gap-4 bg-[#111] hover:bg-[#181818] transition-colors relative overflow-hidden">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            {logo ? (
                                <img src={logo} alt="Preview" className="h-20 w-full object-cover rounded-lg opacity-80" />
                            ) : (
                                <div className="text-gray-500 flex flex-col items-center">
                                    <Plus className="w-5 h-5 mb-1" />
                                    <span className="text-xs">Upload Banner</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleNext}
                        type="button"
                        className="w-full py-3 bg-[#222] text-white font-bold rounded-xl hover:bg-[#333] transition-all border border-[#333]"
                    >
                        Next: Build Menu
                    </button>
                </div>
            ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    <p className="text-xs text-gray-500">Create categories (e.g., "Snacks") and add items under them.</p>

                    {catalog.map((group, gIndex) => (
                        <div key={gIndex} className="bg-[#111] border border-[#222] rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={group.name}
                                    onChange={(e) => updateGroupName(gIndex, e.target.value)}
                                    className="bg-transparent text-amber-500 font-bold text-sm w-full focus:outline-none border-b border-dashed border-amber-500/30"
                                    placeholder="Category Name"
                                />
                                <button onClick={() => deleteGroup(gIndex)} className="text-gray-600 hover:text-red-500">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2 pl-2 border-l border-[#222]">
                                {group.items.map((item: any, iIndex: number) => (
                                    <div key={iIndex} className="flex gap-2 items-start bg-[#181818] p-2 rounded-lg border border-[#333]">
                                        {/* Image Upload for Item */}
                                        <div className="relative w-10 h-10 flex-shrink-0 bg-[#222] rounded overflow-hidden group">
                                            {item.image ? (
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-500 text-center leading-none">
                                                    No Img
                                                </div>
                                            )}

                                            {/* Hover Overlay for Upload */}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                                <UploadButton
                                                    endpoint="imageUploader"
                                                    onClientUploadComplete={(res) => {
                                                        if (res && res[0]) {
                                                            updateItem(gIndex, iIndex, "image", res[0].url);
                                                        }
                                                    }}
                                                    onUploadError={(error: Error) => {
                                                        alert(`ERROR! ${error.message}`);
                                                    }}
                                                    appearance={{
                                                        button: "w-full h-full opacity-0 absolute inset-0 cursor-pointer", // Invisible clickable area
                                                        allowedContent: "hidden"
                                                    }}
                                                />
                                                <Plus className="w-4 h-4 text-white pointer-events-none" />
                                            </div>
                                        </div>

                                        <div className="flex-1 flex gap-2">
                                            <input
                                                type="text"
                                                value={item.name}
                                                onChange={(e) => updateItem(gIndex, iIndex, "name", e.target.value)}
                                                className="flex-[2] bg-transparent rounded px-1 py-1 text-xs text-white border-b border-[#333] focus:border-amber-500 focus:outline-none"
                                                placeholder="Item Name"
                                            />
                                            <input
                                                type="text"
                                                value={item.price}
                                                onChange={(e) => updateItem(gIndex, iIndex, "price", e.target.value)}
                                                className="flex-1 bg-transparent rounded px-1 py-1 text-xs text-white border-b border-[#333] focus:border-amber-500 focus:outline-none"
                                                placeholder="Amount"
                                            />
                                        </div>
                                        <button onClick={() => deleteItem(gIndex, iIndex)} className="text-gray-600 hover:text-red-500 self-center">
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => addItem(gIndex)}
                                    className="text-xs text-gray-500 hover:text-white flex items-center gap-1 mt-2"
                                >
                                    <Plus className="w-3 h-3" /> Add Item
                                </button>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={addGroup}
                        className="w-full py-2 border border-dashed border-[#333] text-gray-500 rounded-xl hover:border-gray-400 hover:text-gray-300 transition-all text-sm"
                    >
                        + Add New Category
                    </button>

                    <div className="flex gap-3 pt-4 border-t border-[#222]">
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 py-3 bg-[#181818] text-white font-bold rounded-xl hover:bg-[#222] transition-all"
                        >
                            Back
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-[2] py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform hover:scale-[1.02] disabled:opacity-50"
                        >
                            {loading ? "Launching..." : "Launch Venture"}
                        </button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
