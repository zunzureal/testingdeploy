import React from 'react';
import { GeoJSON } from 'react-leaflet';
import data from '../data/Province.json';

const Province = () => {

  const geostlye = (feature) => {
    return {
      weight: 0.5,
      color: 'black',
      fillColor: 'none',
      fillOpacity: 0, // ความเข้ม
      interactive: false, // ไม่ให้สามารถคลิกได้
      pointerEvents: 'none' // ปิดการโต้ตอบทั้งหมด
    };
  };

  return data && (
    <GeoJSON
      data={data}
      style={geostlye}
    />
  );
};

export default Province;