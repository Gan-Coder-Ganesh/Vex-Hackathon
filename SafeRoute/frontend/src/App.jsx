import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import MapComponent from './components/MapComponent';
import ReportModal from './components/ReportModal';
import { AlertTriangle, CloudRain, CheckCircle } from 'lucide-react';
import axios from 'axios';

function App() {
  const [alert, setAlert] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [flyToTarget, setFlyToTarget] = useState(null);
  const [routeMetrics, setRouteMetrics] = useState(null);

  // Data State
  const [shelters, setShelters] = useState([]);

  // Reporting State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [toast, setToast] = useState(null);

  // 1. Alert Polling & Reports Fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Weather
        const weatherRes = await axios.get('http://localhost:8000/weather');
        if (weatherRes.data.status === 'alert') {
          setAlert(weatherRes.data);
        } else {
          setAlert(null);
        }

        // Fetch Reports
        const reportsRes = await axios.get('http://localhost:8000/api/reports');
        if (Array.isArray(reportsRes.data)) {
          setReports(reportsRes.data);
        }

        // Fetch Shelters
        const sheltersRes = await axios.get('http://localhost:8000/api/shelters');
        setShelters(sheltersRes.data || []);

      } catch (error) {
        console.warn("API Fetch Error:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000); // Check every 10s for faster updates
    return () => clearInterval(interval);
  }, []);

  // 2. User Geolocation (Robust with Fallback)
  useEffect(() => {
    const demoLocation = [13.0827, 80.2707]; // Chennai Demo Point

    const useDemoLocation = () => {
      console.warn("Using Demo Location (GPS Failed/Denied/Timeout)");
      // Add a small offset so we aren't exactly on top of the "Anna Nagar" shelter or report if coincident
      setUserLocation([13.0830, 80.2710]);
    };

    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      useDemoLocation();
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    const success = (position) => {
      console.log("Using Real GPS Location");
      setUserLocation([position.coords.latitude, position.coords.longitude]);
    };

    const error = (err) => {
      console.warn(`Geolocation error (${err.code}): ${err.message}`);
      useDemoLocation();
    };

    // Attempt to get location
    navigator.geolocation.getCurrentPosition(success, error, options);

    // Also watch for updates
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        // console.log("GPS Location Updated");
        setUserLocation([position.coords.latitude, position.coords.longitude]);
      },
      (err) => {
        // console.warn("Watch Error:", err);
      },
      { ...options, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // 3. Navigation Handler
  const handleNavigate = (shelter) => {
    if (!userLocation) {
      window.alert("Waiting for user location...");
      return;
    }
    setActiveRoute([shelter.lat, shelter.lng]);
    setFlyToTarget(userLocation);
  };

  const handleShelterClick = (shelter) => {
    setFlyToTarget([shelter.lat, shelter.lng]);
  };

  const cancelRoute = () => {
    setActiveRoute(null);
    setRouteMetrics(null);
  };

  // 4. Report Handler
  const handleReportSubmit = async (reportData) => {
    try {
      // Optimistic update (show immediately)
      setReports(prev => [...prev, { ...reportData, id: 'temp-' + Date.now(), verified_status: 'PENDING' }]);

      await axios.post('http://localhost:8000/api/report', reportData);

      setToast({ message: "Report Sent! Verifying...", type: "success" });
      setTimeout(() => setToast(null), 3000);

      // Refresh (will replace optimistic)
      const res = await axios.get('http://localhost:8000/api/reports');
      setReports(res.data);
    } catch (e) {
      console.error(e);
      setToast({ message: "Failed to send report.", type: "error" });
    }
  };

  // 5. Distance Sorting logic
  const sortedShelters = useMemo(() => {
    if (!userLocation) return shelters;
    const getDistSq = (s) => {
      const dLat = s.lat - userLocation[0];
      const dLng = s.lng - userLocation[1];
      return dLat * dLat + dLng * dLng;
    };
    return [...shelters].sort((a, b) => getDistSq(a) - getDistSq(b));
  }, [userLocation, shelters]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-900">
      <Sidebar
        shelters={sortedShelters}
        onNavigate={handleNavigate}
        onShelterClick={handleShelterClick}
        onReportClick={() => setIsReportModalOpen(true)}
      />

      <div className="flex-1 relative z-0">
        <MapComponent
          userLocation={userLocation}
          activeRoute={activeRoute}
          flyToTarget={flyToTarget}
          onCancelRoute={cancelRoute}
          reports={reports} // Pass live reports
          routeMetrics={routeMetrics}
          routeMetrics={routeMetrics}
          setRouteMetrics={setRouteMetrics}
          setRouteMetrics={setRouteMetrics}
          shelters={shelters} // Pass dynamic shelters
          onNavigate={handleNavigate}
        />

        {/* Alert Banner */}
        {alert && (
          <div className="absolute top-4 left-4 right-16 z-[1001] flex justify-center w-full pointer-events-none">
            <div className="bg-red-600/90 text-white px-6 py-4 rounded-lg shadow-lg flex items-center animate-pulse backdrop-blur-sm pointer-events-auto border border-red-400">
              <AlertTriangle className="w-6 h-6 mr-3" />
              <div>
                <h3 className="font-bold text-lg leading-tight uppercase tracking-wider">Emergency Alert</h3>
                <p className="font-medium">{alert.message}</p>
              </div>
              <CloudRain className="w-6 h-6 ml-3 opacity-75" />
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[2000] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-slate-600">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        )}
      </div>

      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        userLocation={userLocation}
        onSubmit={handleReportSubmit}
      />
    </div>
  );
}

export default App;
