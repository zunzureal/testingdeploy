import React, { useState, useEffect } from 'react';
import { MapContainer, LayersControl, LayerGroup, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import proj4 from 'proj4';

// Fix for default marker icons in Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

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
import 'leaflet/dist/leaflet.css';
import 'leaflet.pattern';
import './map.css';

 
import customIconUrl from './images/Marker.png';

const CustomIcon = L.icon({
    iconUrl: customIconUrl,
    iconSize: [50, 50], // ปรับขนาดไอคอนให้เล็กลง
    iconAnchor: [25, 50] // ปรับตำแหน่ง anchor ให้เหมาะสม
});

const MapContents = () => {
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [markerPosition, setMarkerPosition] = useState(null);
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);

    useEffect(() => {
        document.title = "แผนที่แสดงเอกสารสิทธิ์และพื้นที่ทับซ้อน";
    }, []);

    const handleMapClick = (e) => {
        if (!selectedFeature) {
            setMarkerPosition(null);
        }
    };

    const handleClosePopup = () => {
        setSelectedFeature(null);
        setMarkerPosition(null);
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
        <div style={{ display: 'flex', height: '100vh', backgroundColor: '#ffffffff' }}>
            {isSidebarVisible && (
                <div style={{
                    flex: 1,
                    padding: '10px',
                    fontSize: '18px',
                    fontFamily: "'iannnnnPDF2008', sans-serif",
                    textAlign: 'center',
                    lineHeight: '0',
                    position: 'relative'
                }}>
                    <p style={{ lineHeight: '1' }}>
                        <img src={`${process.env.PUBLIC_URL}/assets/logo.png`} alt="Logo" style={{ height: '150px' }} />
                    </p>
                    <p style={{ fontSize: '24px', color: 'black', lineHeight: '1.6' }}>
                        คลินิกและร้านขายยา< br />สิทธิ 30 บาท และประกันสังคม
                    </p>
                    <p style={{ lineHeight: '1.6' }}>
                        <LandList onSelectFeature={handleSelectFeature} />
                    </p>
                    <button onClick={toggleSidebar} style={{
                        position: 'absolute',
                        zIndex: 1000,
                        top: '50%',
                        right: '-20px',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'white',
                        color: 'black',
                        border: '1px solid black',
                        borderRadius: '5px',
                        padding: '10px',
                        cursor: 'pointer'
                    }}>
                        {'<'}
                    </button>
                </div>
            )}

            <div style={{ flex: isSidebarVisible ? 3 : 1 }}>
                {!isSidebarVisible && (
                    <button onClick={toggleSidebar} style={{
                        position: 'absolute',
                        zIndex: 1000,
                        top: '50%',
                        left: '10px',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'white',
                        color: 'black',
                        border: '1px solid black',
                        borderRadius: '5px',
                        padding: '10px',
                        cursor: 'pointer'
                    }}>
                        {'>'}
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
                                <CSVFileLocal type="thirty" />
                            </LayerGroup>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="สิทธิประกันสังคม" checked>
                            <LayerGroup>
                                <CSVFileLocal type="ss" />
                            </LayerGroup>
                        </LayersControl.Overlay>
                        <LayersControl.Overlay name="ใช้ได้ทั้ง 2 สิทธิ์" checked>
                            <LayerGroup>
                                <CSVFileLocal type="both" />
                            </LayerGroup>
                        </LayersControl.Overlay>
                        {/* เพิ่มเลเยอร์อื่น ๆ ที่นี่ */}
                    </LayersControl>

                    <MapZoomToFeature feature={selectedFeature} markerPosition={markerPosition} />
                    <MapLegend />
                    
                    {selectedFeature && <MapPopup feature={selectedFeature} markerPosition={markerPosition} onClose={handleClosePopup} />}
                    {/* ไม่ต้องแสดง Marker ซ้ำ ให้ซูมไปยัง point อย่างเดียว */}
                </MapContainer>
            </div>
        </div>
    );
};

export default MapContents;