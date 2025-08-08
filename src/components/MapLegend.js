import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const MapLegend = () => {
    const map = useMap();

    useEffect(() => {
        const legend = L.control({ position: 'bottomleft' });

        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'legend');
            div.innerHTML = `
                <div style="background: rgba(255, 255, 255, 0.8); padding: 5px; border-radius: 5px; font-size:15px;">
                    <p><strong>คำอธิบายสัญลักษณ์</strong></p>
                    <div style="display: flex; align-items: center; gap: 1px;">
                        <img src="${process.env.PUBLIC_URL}/assets/Clinic.png" style="width: 40px; height: 40px;" /> คลินิก
                    </div>
                    <div style="display: flex; align-items: center; gap: 1px;">
                        <img src="${process.env.PUBLIC_URL}/assets/Pharmacy.png" style="width: 40px; height: 40px;" /> ร้านขายยา
                    </div>
                </div>
            `;
            return div;
        };

        legend.addTo(map);
        return () => map.removeControl(legend);
    }, [map]);

    return null;
};

export default MapLegend;