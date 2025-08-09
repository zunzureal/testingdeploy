import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const MapLegend = () => {
    const map = useMap();

    useEffect(() => {
        const legend = L.control({ position: 'bottomleft' });

        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'legend');
            const isMobile = window.innerWidth <= 768;
            
            div.innerHTML = `
                <div style="
                    background: rgba(255, 255, 255, 0.95); 
                    padding: ${isMobile ? '8px' : '10px'}; 
                    border-radius: 8px; 
                    font-size: ${isMobile ? '12px' : '14px'};
                    font-family: 'THSarabun', sans-serif;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                    border: 1px solid #ddd;
                    min-width: ${isMobile ? '120px' : '140px'};
                ">
                    <p style="
                        margin: 0 0 8px 0; 
                        font-weight: bold; 
                        font-size: ${isMobile ? '13px' : '15px'};
                        color: #333;
                        text-align: center;
                    "><strong>คำอธิบายสัญลักษณ์</strong></p>
                    <div style="
                        display: flex; 
                        align-items: center; 
                        gap: 6px;
                        margin-bottom: 4px;
                    ">
                        <img src="${process.env.PUBLIC_URL}/assets/Clinic.png" 
                             style="width: ${isMobile ? '24px' : '28px'}; height: ${isMobile ? '24px' : '28px'};" 
                             alt="คลินิก" /> 
                        <span>คลินิก</span>
                    </div>
                    <div style="
                        display: flex; 
                        align-items: center; 
                        gap: 6px;
                    ">
                        <img src="${process.env.PUBLIC_URL}/assets/Pharmacy.png" 
                             style="width: ${isMobile ? '24px' : '28px'}; height: ${isMobile ? '24px' : '28px'};" 
                             alt="ร้านขายยา" /> 
                        <span>ร้านขายยา</span>
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