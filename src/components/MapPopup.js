import React from 'react';
import html2canvas from 'html2canvas'; // เพิ่มบรรทัดนี้

const MapPopup = ({ feature, onClose, popupInfo }) => {
    if (!feature) return null;


    // รองรับทั้ง feature ที่มี properties (GeoJSON) และ object ธรรมดา (CSV point)
    const data = feature && feature.properties ? feature.properties : feature;
    const popupContent = data && typeof data === 'object' ? Object.entries(data)
        .filter(([key]) => !['type', 'Image URL', 'Class'].includes(key))
        .map(([key, value]) => {
            // ถ้าเป็นคอลัมน์เวลาให้บริการ ให้แสดงแต่หัวคอลัมน์เท่านั้น
            if (['Time', 'เวลาให้บริการ', 'เวลา'].includes(key.trim())) {
                return `<strong>${key}</strong>`;
            }
            if (key === 'ความชันเฉลี่ย (Degree)mean') {
                value = parseFloat(value).toFixed(3);
            }
            return `<strong>${key}:</strong> ${value || 'ไม่ระบุ'}`;
        })
        .join('<br/>') : '';

    // ฟังก์ชันสำหรับบันทึกภาพ popup
    const handleSaveImage = () => {
        const popupElement = document.getElementById('popup-print-content');
        html2canvas(popupElement).then(canvas => {
            const link = document.createElement('a');
            link.download = 'popup.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    };

    // หาชื่อ Name (รองรับทั้ง GeoJSON และ CSV)
    let popupName = '';
    if (data) {
        popupName = data['Name'] || data['ชื่อ'] || data['name'] || '';
    }


    return (
        <div style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            background: 'white',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            zIndex: 9999,
            maxWidth: '250px'
        }}>
            <button onClick={onClose} style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                background: 'transparent',
                border: 'none',
                fontSize: '18px',
                cursor: 'pointer',
                width: '28px',
                height: '28px',
                lineHeight: '24px',
                textAlign: 'center'
            }}>×</button>
            <button onClick={handleSaveImage} title="บันทึกภาพ" style={{
                position: 'absolute',
                top: '3px',
                right: '25px',
                background: 'transparent',
                color: 'black',
                border: 'none',
                fontSize: '12px',
                width: '28px',
                height: '28px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>P</button>
            <div id="popup-print-content" style={{ margin: 0, padding: 0, background: 'white', borderRadius: 0 }}>
                {popupName && (
                    <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: 8, color: '#1a237e' }}>{popupName}</div>
                )}
                {/* แสดงรูปภาพถ้ามี Image URL และเป็น http */}
                {data["Image URL"] && typeof data["Image URL"] === 'string' && data["Image URL"].startsWith("http") && (
                    <img
                        src={data["Image URL"]}
                        alt="img"
                        style={{
                            width: 200,
                            height: 200,
                            objectFit: 'cover',
                            borderRadius: 10,
                            display: 'block',
                            margin: '0 auto 8px auto'
                        }}
                    />
                )}
                <div dangerouslySetInnerHTML={{ __html: popupContent }} />
            </div>
        </div>
    );
};

export default MapPopup;
