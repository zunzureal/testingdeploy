import React from 'react';
import { GeoJSON } from 'react-leaflet';
import RMUTSVDATA from '../data/RMUTSV.json';

const RMUTSV = ({ onSelectFeature }) => {
    const onEachFeature = (feature, layer) => {
        const ownerName = feature.properties.ชื่อ || "ไม่ระบุ";

        // แสดง Tooltip เมื่อ Hover
        layer.on('mouseover', function () {
            layer.bindTooltip(ownerName, { direction: 'top', permanent: false }).openTooltip();
            layer.setStyle({
                fillColor: 'yellow'
            });
        });

        layer.on('mouseout', function () {
            layer.closeTooltip();
            layer.setStyle({
                fillColor: 'red'
            });
        });

        // คลิกเลือกพื้นที่ทับซ้อน
        layer.on('click', () => onSelectFeature(feature));
    };

    return (
        <GeoJSON
            data={RMUTSVDATA}
            style={{
                weight: 1,
                color: 'black',
                fillColor: 'pink',
                fillOpacity: 1,
                zIndex: 5000,
            }}
            onEachFeature={onEachFeature}
        />
    );
};

export default RMUTSV;