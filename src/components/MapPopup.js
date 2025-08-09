import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

const MapPopup = ({ feature, onClose, popupInfo }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const popupRef = useRef(null);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ป้องกัน event bubbling และ map interaction
    const handlePopupInteraction = (e) => {
        e.stopPropagation();
        // อนุญาตให้เลื่อนภายใน popup แต่ป้องกันไม่ให้ส่งผลต่อแผนที่
        if (e.type === 'wheel' || e.type === 'touchmove') {
            const target = e.currentTarget;
            const scrollTop = target.scrollTop;
            const scrollHeight = target.scrollHeight;
            const height = target.clientHeight;
            const atTop = scrollTop === 0;
            const atBottom = scrollTop >= scrollHeight - height;
            
            // ถ้าเลื่อนถึงขอบแล้วยังพยายามเลื่อนต่อ ให้ป้องกัน
            if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
                e.preventDefault();
            }
        }
    };

    const handleButtonClick = (e) => {
        e.stopPropagation();
    };

    useEffect(() => {
        const popupElement = popupRef.current;
        if (popupElement) {
            // เพิ่ม event listeners เพื่อป้องกัน map interaction เฉพาะ wheel event
            popupElement.addEventListener('wheel', handlePopupInteraction, { passive: false });
            
            return () => {
                popupElement.removeEventListener('wheel', handlePopupInteraction);
            };
        }
    }, []);

    if (!feature) return null;


    // รองรับทั้ง feature ที่มี properties (GeoJSON) และ object ธรรมดา (CSV point)
    const data = feature && feature.properties ? feature.properties : feature;
    const popupContent = data && typeof data === 'object' ? Object.entries(data)
        .filter(([key]) => !['type', 'Image URL', 'Class', 'P_30bant', 'P_ss', 'lat', 'long'].includes(key))
        .map(([key, value]) => {
            // ถ้าเป็นคอลัมน์เวลาให้บริการ ให้แสดงแต่หัวคอลัมน์เท่านั้น
            if (['Time', 'เวลาให้บริการ', 'เวลา'].includes(key.trim())) {
                return `<strong>${key}</strong>`;
            }
            if (key === 'ความชันเฉลี่ย (Degree)mean') {
                value = parseFloat(value).toFixed(3);
            }
            // เพิ่มการตรวจสอบค่าว่างสำหรับคอลัมน์ 30 บาท และ ประกันสังคม
            if (['ประกันสุขภาพ 30 บาท', 'ประกันสังคม'].includes(key)) {
                if (!value || value.trim() === '' || value === 'ไม่มี' || value === 'ไม่รับสิทธิ์') {
                    return null; // ไม่แสดงถ้าไม่มีข้อมูล
                }
            }
            return `<strong>${key}:</strong> ${value || 'ไม่ระบุ'}`;
        })
        .filter(item => item !== null) // กรองออกรายการที่เป็น null
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
        <div 
            ref={popupRef}
            className="custom-popup"
            onWheel={handlePopupInteraction}
            style={{
                position: 'fixed', // เปลี่ยนจาก absolute เป็น fixed
                bottom: isMobile ? '5px' : '20px',
                right: isMobile ? '5px' : '20px',
                left: isMobile ? '5px' : 'auto',
                background: 'white',
                padding: isMobile ? '10px' : '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                zIndex: 10000, // เพิ่ม z-index
                maxWidth: isMobile ? 'none' : '350px',
                width: isMobile ? 'auto' : 'auto',
                maxHeight: isMobile ? '70vh' : '70vh',
                overflowY: 'auto',
                fontFamily: "'THSarabun', sans-serif",
                // เพิ่ม CSS สำหรับ smooth scrolling
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch', // สำหรับ iOS
                // ป้องกันการ interaction กับแผนที่
                pointerEvents: 'auto'
            }}
        >
            <button onClick={(e) => { handleButtonClick(e); onClose(); }} style={{
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
            <button onClick={(e) => { handleButtonClick(e); handleSaveImage(); }} title="บันทึกภาพ" style={{
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
                justifyContent: 'center',
                padding: '0'
            }}>
                <img 
                    src="/assets/downloadfolder.jpeg" 
                    alt="บันทึกภาพ" 
                    style={{
                        width: isMobile ? '16px' : '18px',
                        height: isMobile ? '16px' : '18px',
                        objectFit: 'contain'
                    }}
                />
            </button>
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
