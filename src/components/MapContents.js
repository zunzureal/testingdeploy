import React, { useState, useEffect } from 'react';
import { MapContainer, LayersControl, LayerGroup, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import proj4 from 'proj4';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import BaseMap from './layer/BaseMap';
import LandList from './LandList';
import Forest from './layer/Forest';
import Province from './layer/Province';
import Intersec from './layer/Intersec';
import Land from './layer/Land';
import RMUTSV from './layer/RMUTSV';
import CSVFileLocal from './layer/CSVFileLocal'; 
import MapLegend from './MapLegend';
import MapPopup from './MapPopup';
import MapZoomToFeature from './MapZoomToFeature';
import customIconUrl from './images/Marker.png';

import 'leaflet/dist/leaflet.css';
import 'leaflet.pattern';
import './map.css';

// Configure Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const CustomIcon = L.icon({
    iconUrl: customIconUrl,
    iconSize: [50, 50], // ปรับขนาดไอคอนให้เล็กลง
    iconAnchor: [25, 50] // ปรับตำแหน่ง anchor ให้เหมาะสม
});

const MapContents = () => {
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [popupInfo, setPopupInfo] = useState({ feature: null, position: null });
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        document.title = "แผนที่แสดงเอกสารสิทธิ์และพื้นที่ทับซ้อน";
        
        const handleResize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);
            // ไม่ปิด sidebar อัตโนมัติในมือถือแล้ว - ให้ผู้ใช้เลือกเอง
        };
        
        window.addEventListener('resize', handleResize);
        handleResize(); // เรียกเพื่อตั้งค่าเริ่มต้น
        
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleMapClick = (e) => {
        if (!selectedFeature) {
            setMarkerPosition(null);
        }
        // ปิด popup เมื่อคลิกที่แผนที่
        setPopupInfo({ feature: null, position: null });
    };

    const handleClosePopup = () => {
        setSelectedFeature(null);
        setMarkerPosition(null);
        setPopupInfo({ feature: null, position: null });
    };

    const handleMarkerClick = (item) => {
        // ปิด popup เก่าก่อนเปิดใหม่
        setPopupInfo({ feature: null, position: null });
        setTimeout(() => {
            setPopupInfo({ 
                feature: item, 
                position: [parseFloat(item.lat), parseFloat(item.long)] 
            });
        }, 0);
    };

    const handleSelectFeature = (feature) => {
        setSelectedFeature(feature);
        // กรณี GeoJSON
        if (feature.properties && feature.properties['พิกัดกลางแปลง X (ม.)'] !== undefined && feature.properties['พิกัดกลางแปลง Y (ม.)'] !== undefined) {
            const centerX = feature.properties['พิกัดกลางแปลง X (ม.)'];
            const centerY = feature.properties['พิกัดกลางแปลง Y (ม.)'];
            const [longitude, latitude] = proj4('EPSG:32647', 'EPSG:4326', [centerX, centerY]);
            setMarkerPosition([latitude, longitude]);
        }
        // กรณี CSV (lat/long)
        else if ((feature.lat || feature.lat === 0) && (feature.long || feature.long === 0)) {
            // lat/long อาจเป็น string ต้องแปลงเป็น float
            const lat = parseFloat(feature.lat);
            const lng = parseFloat(feature.long);
            if (!isNaN(lat) && !isNaN(lng)) {
                setMarkerPosition([lat, lng]);
            } else {
                setMarkerPosition(null);
            }
        } else {
            setMarkerPosition(null);
        }
    };

    const toggleSidebar = () => {
        setIsSidebarVisible(!isSidebarVisible);
    };

    return (
        <div style={{ 
            display: 'flex', 
            height: '100vh', 
            backgroundColor: '#ffffffff',
            flexDirection: 'row' // เก็บเป็น row ทุกขนาดหน้าจอ
        }}>
            {isSidebarVisible && (
                <div style={{
                    flex: isMobile ? 'none' : 1,
                    width: isMobile ? '280px' : 'auto', // กำหนดความกว้างคงที่ในมือถือ
                    height: '100vh',
                    overflow: 'auto', // ให้เลื่อนได้เมื่อเนื้อหาเยอะ
                    padding: isMobile ? '8px' : '10px',
                    fontSize: isMobile ? '14px' : '18px',
                    fontFamily: "'THSarabun', sans-serif",
                    textAlign: 'center',
                    lineHeight: '0',
                    position: 'relative',
                    borderRight: '1px solid #ccc' // เพิ่มเส้นแบ่งด้านขวา
                }}>
                    <p style={{ lineHeight: '1' }}>
                        <img 
                            src={`${process.env.PUBLIC_URL}/assets/logo.png`} 
                            alt="Logo" 
                            style={{ 
                                height: isMobile ? '60px' : '150px', // ลดขนาดโลโก้ในมือถือ
                                maxWidth: '100%',
                                objectFit: 'contain'
                            }} 
                        />
                    </p>
                    <p style={{ 
                        fontSize: isMobile ? '14px' : '24px', 
                        color: 'black', 
                        lineHeight: '1.4',
                        margin: isMobile ? '5px 0' : '10px 0'
                    }}>
                        คลินิกและร้านขายยา<br />สิทธิ 30 บาท และประกันสังคม
                    </p>
                    <div style={{ lineHeight: '1.6' }}>
                        <LandList onSelectFeature={handleSelectFeature} />
                    </div>
                    <button onClick={toggleSidebar} style={{
                        position: 'absolute',
                        zIndex: 1000,
                        top: isMobile ? '5px' : '50%',
                        right: isMobile ? '5px' : '-20px',
                        transform: isMobile ? 'none' : 'translateY(-50%)',
                        backgroundColor: 'white',
                        color: 'black',
                        border: '1px solid black',
                        borderRadius: '5px',
                        padding: isMobile ? '5px 8px' : '10px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '12px' : '16px'
                    }}>
                        {isMobile ? '×' : '<'}
                    </button>
                </div>
            )}

            <div style={{ 
                flex: 1, // ให้แผนที่ใช้พื้นที่ที่เหลือ
                height: '100vh',
                position: 'relative'
            }}>
                {!isSidebarVisible && (
                    <button onClick={toggleSidebar} style={{
                        position: 'absolute',
                        zIndex: 1000,
                        top: '10px',
                        left: '10px',
                        backgroundColor: 'white',
                        color: 'black',
                        border: '1px solid black',
                        borderRadius: '5px',
                        padding: isMobile ? '8px 12px' : '10px 15px',
                        cursor: 'pointer',
                        fontSize: isMobile ? '14px' : '16px',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}>
                        {isMobile ? 'เมนู' : 'แสดงเมนู'}
                    </button>
                )}
                <MapContainer
                    style={{ width: '100%', height: '100%' }}
                    center={[7.177892 , 100.602965]}
                    zoom={13}
                    scrollWheelZoom={true}
                    onClick={handleMapClick}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LayersControl position="topright">
                        <LayersControl.Overlay name="BaseMap" checked>
                            <BaseMap />
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="สิทธิ 30 บาท" checked>
                            <LayerGroup>
                                <CSVFileLocal type="thirty" onMarkerClick={handleMarkerClick} />
                            </LayerGroup>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="สิทธิประกันสังคม" checked>
                            <LayerGroup>
                                <CSVFileLocal type="ss" onMarkerClick={handleMarkerClick} />
                            </LayerGroup>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="ใช้ได้ทั้ง 2 สิทธิ์" checked>
                            <LayerGroup>
                                <CSVFileLocal type="both" onMarkerClick={handleMarkerClick} />
                            </LayerGroup>
                        </LayersControl.Overlay>
                        {/* เพิ่มเลเยอร์อื่น ๆ ที่นี่ */}
                    </LayersControl>

                    <MapZoomToFeature feature={selectedFeature} markerPosition={markerPosition} />
                    <MapLegend />
                    
                    {selectedFeature && <MapPopup feature={selectedFeature} markerPosition={markerPosition} onClose={handleClosePopup} />}
                    {popupInfo.feature && popupInfo.position && (
                        <MapPopup feature={popupInfo.feature} markerPosition={popupInfo.position} onClose={() => setPopupInfo({ feature: null, position: null })} />
                    )}
                    {/* ไม่ต้องแสดง Marker ซ้ำ ให้ซูมไปยัง point อย่างเดียว */}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapContents;