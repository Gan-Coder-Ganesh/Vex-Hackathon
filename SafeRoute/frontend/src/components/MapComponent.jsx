import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Popup, Marker, useMap } from 'react-leaflet';
import { Navigation, Home, X, AlertTriangle, CloudRain } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// import { shelters } from '../data/shelters'; // Removed in favor of props

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const userIcon = L.divIcon({
    className: 'custom-user-marker',
    html: '<div class="bg-blue-500 w-4 h-4 rounded-full border-2 border-white shadow-lg animate-pulse"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
});

const chennai = [13.0827, 80.2707];

const dummyReports = [
    { id: 1, lat: 13.0827, long: 80.2707, type: 'flood', verified: true },
    { id: 2, lat: 13.06, long: 80.25, type: 'road_block', verified: false },
    { id: 3, lat: 13.1, long: 80.28, type: 'flood', verified: true },
];

// --- Sub-Components ---

// 1. Routing Controller (Robust)
const RoutingController = ({ userLocation, activeRoute, setRouteMetrics }) => {
    const map = useMap();

    useEffect(() => {
        if (!activeRoute || !userLocation) return;
        if (!L.Routing) {
            console.error("Leaflet Routing Machine not loaded");
            return;
        }

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(userLocation[0], userLocation[1]),
                L.latLng(activeRoute[0], activeRoute[1])
            ],
            lineOptions: {
                styles: [{ color: '#3b82f6', opacity: 0.7, weight: 6 }]
            },
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            fitSelectedRoutes: true, // Auto-zoom to fit route
            showAlternatives: false,
            containerClassName: 'hidden'
        })
            .on('routingerror', function (e) {
                console.error("Routing Error:", e);
                if (e.error && e.error.message) {
                    alert(`Route Calculation Failed. \n\nReason: The OSRM demo server may reject long distances (>100km) or requests are too frequent.\n\nPlease try a closer shelter.`);
                } else {
                    alert("Could not calculate route. Check internet connection or try a closer point.");
                }
            })
            .on('routesfound', function (e) {
                const routes = e.routes;
                const summary = routes[0].summary;
                if (summary) {
                    const distance = (summary.totalDistance / 1000).toFixed(1) + " km";
                    const time = Math.round(summary.totalTime / 60) + " mins";
                    setRouteMetrics({ distance, time });
                }
            })
            .addTo(map);

        return () => {
            try {
                map.removeControl(routingControl);
            } catch (e) {
                console.warn("Error removing routing control", e);
            }
        };
    }, [map, activeRoute, userLocation]);

    return null;
};

// 1.5 FlyTo Controller (Handles external fly actions)
const FlyToController = ({ target }) => {
    const map = useMap();
    useEffect(() => {
        if (target) {
            map.flyTo(target, 14, { duration: 2.0 });
        }
    }, [map, target]);
    return null;
};

// 2. Recenter Button ("My Location")
const RecenterButton = ({ userLocation }) => {
    const map = useMap();

    const handleRecenter = () => {
        if (userLocation) {
            map.flyTo(userLocation, 15, { animate: true, duration: 1.5 });
        } else {
            // If no location yet (or still loading), just center on default
            map.flyTo(chennai, 13, { duration: 1.5 });
        }
    };

    return (
        <div className="leaflet-bottom leaflet-right">
            <div className="leaflet-control leaflet-bar">
                <button
                    onClick={handleRecenter}
                    className="bg-white p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-center border-none"
                    title="My Location"
                    style={{ width: '34px', height: '34px' }}
                >
                    <Navigation className="w-5 h-5 text-gray-700" />
                </button>
            </div>
        </div>
    );
};

// 3. Route Controls (Cancel Button & Metrics)
const RouteControls = ({ activeRoute, onCancelRoute, routeMetrics }) => {
    if (!activeRoute) return null;
    return (
        <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2 items-end">
            {/* Metrics Card */}
            {routeMetrics && (
                <div className="bg-slate-900/90 text-white p-4 rounded-xl shadow-2xl backdrop-blur border border-slate-700 w-48 animate-in slide-in-from-top-4">
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Trip Summary</div>
                    <div className="flex justify-between items-end mb-1">
                        <span className="text-2xl font-bold">{routeMetrics.time}</span>
                        <span className="text-sm text-slate-300 font-medium">{routeMetrics.distance}</span>
                    </div>
                    <div className="text-xs text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Best Route
                    </div>
                </div>
            )}

            <button
                onClick={onCancelRoute}
                className="bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-red-700 transition"
            >
                <X className="w-4 h-4" />
                Exit Navigation
            </button>
        </div>
    );
};

// --- Helper Functions ---

const clusterReports = (reports) => {
    const clusters = [];
    const THRESHOLD = 0.003; // approx 300m

    reports.forEach(report => {
        let added = false;

        // Try to find an existing cluster to add to
        for (let cluster of clusters) {
            const dLat = Math.abs(cluster.lat - report.lat);
            const dLng = Math.abs(cluster.lng - (report.long || report.lng)); // Handle both property names

            if (dLat < THRESHOLD && dLng < THRESHOLD) {
                cluster.count += 1;
                cluster.reports.push(report);
                // Upgrade type to flood if any report is flood (priority)
                if (report.type === 'flood') cluster.type = 'flood';
                added = true;
                break;
            }
        }

        if (!added) {
            clusters.push({
                lat: report.lat,
                lng: report.long || report.lng,
                count: 1,
                type: report.type,
                reports: [report]
            });
        }
    });

    return clusters;
};

// --- Main Component ---

const MapComponent = ({ userLocation, activeRoute, onCancelRoute, flyToTarget, reports = [], routeMetrics, setRouteMetrics, shelters = [], onNavigate }) => {
    // Debug Log
    useEffect(() => {
        if (shelters.length > 0) {
            console.log("📍 Map received shelters:", shelters);
        }
    }, [shelters]);
    // Merge dummyReports with live reports if needed, or just use live.
    const displayReports = reports.length > 0 ? reports : dummyReports;

    // Cluster Reports
    const clusters = useMemo(() => clusterReports(displayReports), [displayReports]);

    return (
        <div className="w-full h-full relative z-0">
            <MapContainer
                center={chennai}
                zoom={13}
                style={{ height: "100%", width: "100%", background: "#f8fafc" }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />

                <RoutingController
                    userLocation={userLocation}
                    activeRoute={activeRoute}
                    setRouteMetrics={setRouteMetrics}
                />

                <FlyToController target={flyToTarget} />

                <RecenterButton userLocation={userLocation} />

                <RouteControls
                    activeRoute={activeRoute}
                    onCancelRoute={onCancelRoute}
                    routeMetrics={routeMetrics}
                />

                {/* User Marker */}
                {userLocation && (
                    <Marker position={userLocation} icon={userIcon}>
                        <Popup>
                            <div className="font-bold text-center text-slate-800">You are here</div>
                        </Popup>
                    </Marker>
                )}

                {/* Clustered Flood/Roadblock Reports */}
                {clusters.map((cluster, idx) => {
                    const isVerified = cluster.count >= 5;
                    const color = isVerified ? '#ef4444' : '#eab308'; // Red if >= 5, else Yellow

                    return (
                        <Circle
                            key={`cluster-${idx}`}
                            center={[cluster.lat, cluster.lng]}
                            pathOptions={{
                                color: color,
                                fillColor: color,
                                fillOpacity: 0.5,
                                weight: 2
                            }}
                            radius={200}
                        >
                            <Popup className="font-sans">
                                <div className="text-slate-900 min-w-[200px]">
                                    <h3 className="font-bold text-sm mb-1 uppercase flex items-center gap-2">
                                        {cluster.type === 'road_block' ? <AlertTriangle className="w-4 h-4 text-amber-600" /> : <CloudRain className="w-4 h-4 text-blue-600" />}
                                        {cluster.type === 'road_block' ? 'Road Block' : 'Flood Alert'}
                                    </h3>

                                    <div className="mb-2 p-2 bg-slate-100 rounded text-xs">
                                        <div className="flex justify-between font-semibold mb-1">
                                            <span>Verification Level:</span>
                                            <span className={isVerified ? "text-red-600" : "text-yellow-600"}>
                                                {isVerified ? "HIGH (Verified)" : "LOW (Unverified)"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>User Reports:</span>
                                            <span className="font-mono font-bold">{cluster.count}</span>
                                        </div>
                                    </div>

                                    {/* Show description of the most recent report in cluster if available */}
                                    {cluster.reports[0].description && (
                                        <div className="text-xs text-slate-500 italic border-t border-slate-200 pt-1 mt-1">
                                            "{cluster.reports[0].description}"
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Circle>
                    );
                })}

                {/* Shelter Markers */}
                {/* Shelter Markers */}
                {shelters.map(shelter => {
                    // Support both formats during transition
                    const lat = shelter.lat;
                    const lng = shelter.lng;

                    if (!lat || !lng) return null; // Skip invalid data

                    // Capacity Logic for Popup
                    const occupied = shelter.occupied || 0;
                    const capacity = shelter.capacity || 100;
                    const occupiedPct = (occupied / capacity) * 100;

                    let barColor = "bg-green-500";
                    if (occupiedPct > 50) barColor = "bg-yellow-500";
                    if (occupiedPct > 80) barColor = "bg-red-600";

                    // Resources (Flat vs Nested)
                    const foodStatus = shelter.food_status || shelter.resources?.food || "Unknown";
                    const medicalStatus = shelter.medical_status || shelter.resources?.medical || "Unknown";

                    return (
                        <Marker
                            key={`shelter-${shelter.id}`}
                            position={[lat, lng]}
                        >
                            <Popup className="font-sans">
                                <div className="text-slate-900 min-w-[150px]">
                                    <h3 className="font-bold text-sm mb-1 flex items-center gap-1">
                                        <Home className="w-3 h-3" />
                                        {shelter.name}
                                    </h3>
                                    <div className="text-xs text-gray-500 mb-1">{shelter.type}</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                                        <div
                                            className={`h-2 rounded-full ${barColor}`}
                                            style={{ width: `${Math.min(occupiedPct, 100)}%` }}
                                        ></div>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1 text-right">
                                        {occupied} / {capacity} Occupied
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2 grid grid-cols-2 gap-1 border-t pt-1">
                                        <div>Food: <span className={foodStatus === 'High' ? 'text-green-600' : 'text-amber-600'}>{foodStatus}</span></div>
                                        <div>Med: <span className={medicalStatus === 'High' ? 'text-green-600' : 'text-amber-600'}>{medicalStatus}</span></div>
                                    </div>

                                    <button
                                        onClick={() => onNavigate && onNavigate(shelter)}
                                        className="w-full mt-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded flex items-center justify-center gap-1 transition shadow-sm"
                                    >
                                        <Navigation className="w-3 h-3" />
                                        Navigate Here
                                    </button>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

            </MapContainer>

            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-slate-900/10 to-transparent pointer-events-none z-[400]" />
        </div>
    );
};

export default MapComponent;
