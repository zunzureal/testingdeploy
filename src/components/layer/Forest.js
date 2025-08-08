import React from 'react';
import { GeoJSON } from 'react-leaflet';
import data from '../data/Forest.json';
import 'leaflet/dist/leaflet.css'; // เพิ่ม CSS

const Forest = () => {
  const handleEachFeature = (feature, layer) => {
    // ปิดการโต้ตอบเมื่อคลิก
    layer.options.interactive = false;

    // Tooltip ใช้ fr_name
    layer.bindTooltip(feature.properties.fr_name, {
      direction: 'right',
    });
  };

  // ตรวจสอบว่ามีข้อมูล
  return data && (
    <GeoJSON
      data={data}
      style={{
        weight: 1,
        color: 'Green',
        fillColor: 'Green',
        fillOpacity: 0.1,
        zIndex: 2,
      }}
      onEachFeature={handleEachFeature}
    />
  );
};

export default Forest;
