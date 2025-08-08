
import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const LandList = ({ onSelectFeature }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [allData, setAllData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

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
            padding: '10px',
            fontSize: '12px',
            fontWeight: 'normal',
            background: 'white',
            boxSizing: 'border-box',
            fontFamily: "'iannnnnPDF2008', sans-serif"
        }}>
            <h3 style={{
                fontSize: '16px',
                fontWeight: 'normal',
                fontFamily: "'iannnnnPDF2008', sans-serif",
                color: 'black',
                lineHeight: '0'
            }}
            >ค้นหาคลินิกหรือร้านขายยา</h3>
            <input
                type="text"
                placeholder="กรอกชื่อคลินิกหรือร้านขายยา..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                    width: '95%',
                    padding: '8px',
                    fontWeight: 'normal',
                    marginBottom: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ccc',
                    fontFamily: "'iannnnnPDF2008', sans-serif"
                }}
            />
            {filteredData.length > 0 && (
                <ul style={{
                    listStyle: 'none',
                    padding: '5px',
                    maxHeight: '325px',
                    overflowY: 'auto',
                    border: '1px solid #ccc',
                    borderRadius: '5px',
                    background: '#fff'
                }}>
                    {filteredData.map((feature, index) => (
                        <li key={index}
                            onClick={() => handleSelect(feature)}
                            style={{
                                padding: '8px',
                                cursor: 'pointer',
                                borderBottom: '1px solid #ddd',
                                textAlign: 'left'
                            }}>
                            {feature["ชื่อ"]}
                            <span style={{ marginLeft: '8px' }}>({feature["Class"]})</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default LandList;
