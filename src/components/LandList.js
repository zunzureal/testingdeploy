
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const LandList = ({ onSelectFeature }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        // โหลดข้อมูลจากทั้ง 2 ไฟล์ CSV เมื่อ component mount
        const fetchData = async () => {
            const file1 = process.env.PUBLIC_URL + '/assets/pointclinic.csv';
            const file2 = process.env.PUBLIC_URL + '/assets/pointpharmacy.csv';

            const res1 = await fetch(file1);
            const text1 = await res1.text();
            const json1 = Papa.parse(text1, { header: true }).data;
            const data1 = json1.filter(item => item["ชื่อ"] && item.lat && item.long);

            const res2 = await fetch(file2);
            const text2 = await res2.text();
            const json2 = Papa.parse(text2, { header: true }).data;
            const data2 = json2.filter(item => item["ชื่อ"] && item.lat && item.long);

            setAllData([...data1, ...data2]);
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredData([]);
            return;
        }
        // filter ข้อมูลจาก allData โดยใช้คอลัมน์ 'ชื่อ'
        const results = allData.filter(item =>
            item["ชื่อ"] && item["ชื่อ"].toString().toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredData(results);
    }, [searchTerm, allData]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSelect = (feature) => {
        onSelectFeature(feature); // ส่งค่าฟีเจอร์ที่เลือกไปยัง MapContents
        setSearchTerm(''); // เคลียร์ช่องค้นหาหลังจากเลือก
        setFilteredData([]); // ซ่อนผลลัพธ์หลังจากเลือก
    };

    return (
        <div style={{
            width: '100%',
            height: '100%',
            padding: isMobile ? '5px' : '10px',
            fontSize: isMobile ? '14px' : '16px',
            fontWeight: 'normal',
            background: 'white',
            boxSizing: 'border-box',
            fontFamily: "'THSarabun', sans-serif"
        }}>
            <h3 style={{
                fontSize: isMobile ? '14px' : '18px',
                fontWeight: 'normal',
                fontFamily: "'THSarabun', sans-serif",
                color: 'black',
                lineHeight: '1.2',
                margin: isMobile ? '5px 0' : '10px 0'
            }}>
                ค้นหาคลินิก/ร้านขายยา
            </h3>
            <input
                type="text"
                placeholder={isMobile ? "ชื่อคลินิก/ร้านขายยา..." : "กรอกชื่อคลินิกหรือร้านขายยา..."}
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                    width: '100%',
                    padding: isMobile ? '8px' : '6px', // ลดขนาด padding สำหรับ desktop จาก 12px เป็น 6px
                    fontWeight: 'normal',
                    marginBottom: isMobile ? '5px' : '5px', // ลด margin สำหรับ desktop จาก 10px เป็น 5px
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    fontFamily: "'THSarabun', sans-serif",
                    fontSize: isMobile ? '14px' : '14px', // ลดขนาดฟอนต์ desktop จาก 16px เป็น 14px
                    boxSizing: 'border-box'
                }}
            />
            {filteredData.length > 0 && (
                <ul style={{
                    listStyle: 'none',
                    padding: '0',
                    margin: '0',
                    maxHeight: isMobile ? '200px' : '325px',
                    overflowY: 'auto',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    background: '#fff'
                }}>
                    {filteredData.map((feature, index) => (
                        <li key={index}
                            onClick={() => handleSelect(feature)}
                            style={{
                                padding: isMobile ? '8px 6px' : '12px 10px',
                                cursor: 'pointer',
                                borderBottom: index < filteredData.length - 1 ? '1px solid #ddd' : 'none',
                                textAlign: 'left',
                                fontSize: isMobile ? '12px' : '14px',
                                lineHeight: '1.3',
                                wordWrap: 'break-word'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                            <div style={{ 
                                fontWeight: 'bold',
                                marginBottom: '2px'
                            }}>
                                {feature["ชื่อ"]}
                            </div>
                            <div style={{ 
                                fontSize: isMobile ? '10px' : '12px',
                                color: '#666',
                                fontStyle: 'italic'
                            }}>
                                ({feature["Class"]})
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LandList;
