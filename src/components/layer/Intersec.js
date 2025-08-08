import React from 'react';
import { GeoJSON } from 'react-leaflet';
import intersecData from '../data/Intersec.json';

const Intersec = ({ onSelectFeature }) => {
    const onEachFeature = (feature, layer) => {
        const ownerName = feature.properties.ชื่อเจ้าของสวนยางพารา || "ไม่ระบุ";

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
                fillColor: 'orange'
            });
        });

        // คลิกเลือกพื้นที่ทับซ้อน
        layer.on('click', () => onSelectFeature(feature));
    };

    return (
        <GeoJSON
            data={intersecData}
            style={{
                weight: 1,
                color: 'black',
                fillColor: 'orange',
                fillOpacity: 1,
                zIndex: 9999,
            }}
            onEachFeature={onEachFeature}
        />
    );
};

export default Intersec;