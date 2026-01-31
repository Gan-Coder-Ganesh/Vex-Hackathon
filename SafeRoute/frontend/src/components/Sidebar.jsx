import React from 'react';
import { Shield, Users, ArrowRight, Navigation, AlertTriangle } from 'lucide-react';

// import { shelters } from '../data/shelters'; // Now passed via props

const Sidebar = ({ shelters, onNavigate, onShelterClick, onReportClick }) => {
    return (
        <div className="w-80 h-full bg-slate-800 border-r border-slate-700 flex flex-col shadow-xl z-20 relative">
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-2xl font-bold flex items-center gap-2 text-blue-400">
                    <Shield className="w-8 h-8" />
                    SafeRoute
                </h1>
                <p className="text-slate-400 text-sm mt-1">Disaster Shelter Finder</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Nearby Shelters</h2>

                {shelters && shelters.map((shelter) => {
                    // Calculate Percentages
                    const occupiedPct = (shelter.occupied / shelter.capacity) * 100;
                    const incomingPct = (shelter.incoming / shelter.capacity) * 100;
                    const totalPct = occupiedPct + incomingPct;

                    // Occupied Color Logic
                    let barColor = "bg-green-500";
                    if (occupiedPct > 50) barColor = "bg-yellow-500";
                    if (occupiedPct > 80) barColor = "bg-red-600"; // Trigger red earlier as per request >80%

                    return (
                        <div
                            key={shelter.id}
                            onClick={() => onShelterClick && onShelterClick(shelter)}
                            className="bg-slate-700/50 p-4 rounded-lg hover:bg-slate-700 transition group border border-transparent hover:border-slate-600 cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium text-slate-100 group-hover:text-blue-300 transition">{shelter.name}</h3>
                                <span className="text-xs text-slate-400 bg-slate-800 px-2 py-1 rounded">{shelter.type}</span>
                            </div>

                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                                <div className="flex items-center gap-2">
                                    <Users className="w-3 h-3" />
                                    <span>{shelter.occupied} / {shelter.capacity}</span>
                                </div>
                                {shelter.incoming > 0 && (
                                    <span className="text-blue-300">+{shelter.incoming} incoming</span>
                                )}
                            </div>

                            {/* Dual-Layer Progress Bar */}
                            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden mb-2 relative flex">
                                {/* Base Layer: Occupied */}
                                <div
                                    className={`h-full ${barColor} transition-all duration-500`}
                                    style={{ width: `${Math.min(occupiedPct, 100)}%` }}
                                />
                                {/* Top Layer: Incoming */}
                                <div
                                    className="h-full bg-blue-300 transition-all duration-500 opacity-80"
                                    style={{ width: `${Math.min(incomingPct, 100 - occupiedPct)}%` }}
                                />
                            </div>

                            {/* Overload Warning */}
                            {totalPct > 100 ? (
                                <div className="text-xs font-bold text-red-500 flex items-center gap-1 mb-3 animate-pulse">
                                    <AlertTriangle className="w-3 h-3" />
                                    ⚠ OVERLOAD PREDICTED
                                </div>
                            ) : (
                                <div className="mb-3 text-xs text-slate-500 text-right">
                                    {Math.round(totalPct)}% Predicted Load
                                </div>
                            )}

                            <div className="text-xs text-slate-500 mb-3 grid grid-cols-3 gap-1">
                                <div>Food: <span className={(shelter.food_status || shelter.resources?.food) === 'High' ? 'text-green-400' : 'text-yellow-500'}>{shelter.food_status || shelter.resources?.food}</span></div>
                                <div>Med: <span className={(shelter.medical_status || shelter.resources?.medical) === 'High' ? 'text-green-400' : 'text-yellow-500'}>{shelter.medical_status || shelter.resources?.medical}</span></div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation(); // Prevent firing onShelterClick
                                    onNavigate(shelter);
                                }}
                                className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-semibold rounded flex items-center justify-center gap-1 transition"
                            >
                                <Navigation className="w-3 h-3" />
                                Navigate
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                <button
                    onClick={onReportClick}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                    Report Incident
                    <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
