export const shelters = [
    // --- CHENNAI (Flood Prone Areas) ---
    {
        id: 1, name: "Phoenix Marketcity (Velachery)",
        lat: 12.9915, lng: 80.2181,
        capacity: 5000, occupied: 1200, incoming: 50,
        type: "Mall", resources: { food: "High", medical: "Low", water: "High" }
    },
    {
        id: 2, name: "Rajiv Gandhi Govt Hospital",
        lat: 13.0801, lng: 80.2764,
        capacity: 2000, occupied: 1800, incoming: 10,
        type: "Hospital", resources: { food: "Med", medical: "High", water: "High" }
    },
    {
        id: 3, name: "Anna University (Guindy)",
        lat: 13.0109, lng: 80.2354,
        capacity: 8000, occupied: 300, incoming: 200,
        type: "College", resources: { food: "High", medical: "Med", water: "High" }
    },
    {
        id: 4, name: "Chennai Trade Centre",
        lat: 13.0185, lng: 80.1913,
        capacity: 4000, occupied: 500, incoming: 50,
        type: "Govt Hall", resources: { food: "Med", medical: "Low", water: "High" }
    },

    // --- COIMBATORE ---
    {
        id: 5, name: "CODISSIA Trade Fair Complex",
        lat: 11.0284, lng: 77.0252,
        capacity: 10000, occupied: 100, incoming: 0,
        type: "Hall", resources: { food: "High", medical: "Low", water: "High" }
    },
    {
        id: 6, name: "Coimbatore Medical College",
        lat: 11.0305, lng: 77.0006,
        capacity: 1500, occupied: 900, incoming: 20,
        type: "Hospital", resources: { food: "Med", medical: "High", water: "Med" }
    },

    // --- MADURAI ---
    {
        id: 7, name: "Madurai Medical College",
        lat: 9.9312, lng: 78.1394,
        capacity: 2000, occupied: 1100, incoming: 40,
        type: "Hospital", resources: { food: "Low", medical: "High", water: "Med" }
    },
    {
        id: 8, name: "Vishal de Mall",
        lat: 9.9390, lng: 78.1404,
        capacity: 3000, occupied: 400, incoming: 10,
        type: "Mall", resources: { food: "High", medical: "Low", water: "High" }
    },

    // --- TRICHY ---
    {
        id: 9, name: "NIT Trichy Campus",
        lat: 10.7610, lng: 78.8139,
        capacity: 6000, occupied: 200, incoming: 0,
        type: "College", resources: { food: "High", medical: "Med", water: "High" }
    }
];
