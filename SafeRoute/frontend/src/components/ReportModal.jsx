import React, { useState } from 'react';
import { X, AlertTriangle, CloudRain, MapPin } from 'lucide-react';

const ReportModal = ({ isOpen, onClose, userLocation, onSubmit }) => {
    const [reportType, setReportType] = useState('flood');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = () => {
        // Fallback or validation
        if (!userLocation) {
            alert("No user location found. Cannot verify report location.");
            return;
        }

        const reportData = {
            lat: userLocation[0],
            lng: userLocation[1],
            type: reportType, // 'flood', 'road_block', 'medical'
            description: description
        };

        onSubmit(reportData);
        // Clear and close
        setDescription('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        Report Incident
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">

                    {/* Location Preview */}
                    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 flex items-center gap-3">
                        <div className="bg-blue-500/20 p-2 rounded-full">
                            <MapPin className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Location</div>
                            <div className="text-sm text-slate-200 font-mono">
                                {userLocation ? `${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}` : 'Detecting...'}
                            </div>
                        </div>
                    </div>

                    {/* Report Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Incident Type</label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => setReportType('flood')}
                                className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition ${reportType === 'flood' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                            >
                                <CloudRain className="w-6 h-6" />
                                <span className="text-xs font-bold">FLOOD</span>
                            </button>
                            <button
                                onClick={() => setReportType('road_block')}
                                className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition ${reportType === 'road_block' ? 'bg-yellow-600/20 border-yellow-500 text-yellow-500' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                            >
                                <AlertTriangle className="w-6 h-6" />
                                <span className="text-xs font-bold">BLOCK</span>
                            </button>
                            <button
                                onClick={() => setReportType('medical')}
                                className={`p-3 rounded-lg border flex flex-col items-center gap-1 transition ${reportType === 'medical' ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500'}`}
                            >
                                <AlertTriangle className="w-6 h-6" />
                                <span className="text-xs font-bold">MEDICAL</span>
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Description <span className="text-slate-600">(Optional)</span></label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe severity, water level, etc..."
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition h-24 resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        onClick={handleSubmit}
                        disabled={!userLocation}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-red-900/20 transition flex items-center justify-center gap-2"
                    >
                        <AlertTriangle className="w-5 h-5" />
                        SUBMIT REPORT
                    </button>

                </div>
            </div>
        </div>
    );
};

export default ReportModal;
