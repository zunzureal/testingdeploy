import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas'; // เพิ่มบรรทัดนี้

const MapPopup = ({ feature, onClose, popupInfo }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
            bottom: isMobile ? '5px' : '20px',
            right: isMobile ? '5px' : '20px',
            left: isMobile ? '5px' : 'auto',
            background: 'white',
            padding: isMobile ? '10px' : '20px',
            borderRadius: '8px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            zIndex: 9999,
            maxWidth: isMobile ? 'none' : '350px',
            width: isMobile ? 'auto' : 'auto',
            maxHeight: isMobile ? '60vh' : '70vh', // เพิ่มความสูงในมือถือ
            overflowY: 'auto',
            fontFamily: "'THSarabun', sans-serif",
            // เพิ่ม CSS สำหรับ smooth scrolling
            scrollBehavior: 'smooth',
            WebkitOverflowScrolling: 'touch' // สำหรับ iOS
        }}>
            <button onClick={onClose} style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: '#ff4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                fontSize: isMobile ? '16px' : '18px',
                cursor: 'pointer',
                width: isMobile ? '30px' : '32px',
                height: isMobile ? '30px' : '32px',
                lineHeight: '1',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>×</button>
            <button onClick={handleSaveImage} title="บันทึกภาพ" style={{
                position: 'absolute',
                top: '8px',
                right: isMobile ? '45px' : '50px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: isMobile ? '10px' : '12px',
                width: isMobile ? '30px' : '32px',
                height: isMobile ? '30px' : '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>📷</button>
            <div id="popup-print-content" style={{ 
                margin: 0, 
                padding: 0, 
                background: 'white', 
                borderRadius: 0,
                paddingTop: isMobile ? '45px' : '40px'
            }}>
                {popupName && (
                    <div style={{ 
                        fontWeight: 'bold', 
                        fontSize: isMobile ? '20px' : '22px', 
                        marginBottom: isMobile ? '12px' : '15px', 
                        color: '#1a237e',
                        lineHeight: '1.3',
                        wordWrap: 'break-word'
                    }}>
                        {popupName}
                    </div>
                )}
                {/* แสดงรูปภาพถ้ามี Image URL และเป็น http */}
                {data["Image URL"] && typeof data["Image URL"] === 'string' && data["Image URL"].startsWith("http") && (
                    <img
                        src={data["Image URL"]}
                        alt="img"
                        style={{
                            width: isMobile ? '100%' : '280px',
                            height: isMobile ? 'auto' : '200px',
                            maxHeight: isMobile ? '200px' : '200px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            display: 'block',
                            margin: isMobile ? '0 auto 12px auto' : '0 auto 15px auto'
                        }}
                    />
                )}
                <div 
                    style={{
                        fontSize: isMobile ? '16px' : '16px',
                        lineHeight: '1.5',
                        wordWrap: 'break-word'
                    }}
                    dangerouslySetInnerHTML={{ __html: popupContent }} 
                />
            </div>
        </div>
    );
};

export default MapPopup;
