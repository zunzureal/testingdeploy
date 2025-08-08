import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';


const MapZoomToFeature = ({ feature, markerPosition }) => {
    const map = useMap();

    useEffect(() => {
        if (markerPosition && Array.isArray(markerPosition) && markerPosition.length === 2) {
            // ซูมไปยังตำแหน่ง lat/lng จาก CSV
            map.setView(markerPosition, 17); // กำหนด zoom level ตามต้องการ
        } else if (feature) {
            // กรณี GeoJSON
            try {
                const bounds = L.geoJSON(feature).getBounds();
                map.fitBounds(bounds, { padding: [20, 20] });
            } catch (e) {
                // feature ไม่ใช่ GeoJSON
            }
        }
    }, [feature, markerPosition, map]);

    return null;
};

export default MapZoomToFeature;