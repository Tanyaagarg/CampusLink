"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import { MapPin, Calendar, Clock, Car } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function CreateRideModal({ isOpen, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);
    const [from, setFrom] = useState("Thapar Campus");
    const [to, setTo] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [vehicle, setVehicle] = useState("");
    const [seats, setSeats] = useState(3);
    const [price, setPrice] = useState("");
    const [type, setType] = useState("Car");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/rides", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    from,
                    to,
                    date,
                    time,
                    vehicle,
                    seats,
                    price,
                    type,
                }),
            });

            if (res.ok) {
                if (onSuccess) onSuccess();
                onClose();
                // Reset form slightly
                setTo("");
                setPrice("");
                setDate("");
                setTime("");
            } else {
                console.error("Failed to create ride");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Offer a Ride">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">From</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
                            <input
                                required
                                type="text"
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-green/50"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">To</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
                            <input
                                required
                                type="text"
                                placeholder="Destination"
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-green/50"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
                            <input
                                required
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-green/50 appearance-none"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Time</label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
                            <input
                                required
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-green/50 appearance-none"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Vehicle Details</label>
                    <div className="relative">
                        <Car className="absolute left-3 top-2.5 text-gray-600 w-5 h-5" />
                        <input
                            required
                            type="text"
                            placeholder="e.g. Swift Dzire (White)"
                            value={vehicle}
                            onChange={(e) => setVehicle(e.target.value)}
                            className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-neon-green/50"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Seats Available</label>
                        <select
                            value={seats}
                            onChange={(e) => setSeats(Number(e.target.value))}
                            className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 px-4 text-white focus:outline-none focus:border-neon-green/50"
                        >
                            {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Price per seat</label>
                        <input
                            required
                            type="number"
                            placeholder="₹"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 px-4 text-white focus:outline-none focus:border-neon-green/50"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Vehicle Type</label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-[#181818] border border-[#333] rounded-xl py-2 px-4 text-white focus:outline-none focus:border-neon-green/50"
                    >
                        <option value="Car">Car</option>
                        <option value="Bike">Bike</option>
                        <option value="Scooter">Scooter</option>
                        <option value="Auto">Auto</option>
                        <option value="Cab">Cab</option>
                        <option value="Other">Other</option>
                    </select>
                </div>

                <button
                    disabled={loading}
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-neon-green to-emerald-600 text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all transform hover:scale-[1.02] disabled:opacity-50"
                >
                    {loading ? "Publishing..." : "Publish Ride"}
                </button>
            </form>
        </Modal>
    );
}
