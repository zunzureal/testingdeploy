import React, { useEffect, useState, useRef } from 'react'
import Papa from 'papaparse'
import { Marker, Tooltip, Popup } from 'react-leaflet'
import MapPopup from '../MapPopup';
import L from 'leaflet'
import './style.css'

// import รูปจาก public/assets
const iconclinic = process.env.PUBLIC_URL + '/assets/Clinic.png'
const iconpharmacy = process.env.PUBLIC_URL + '/assets/Pharmacy.png'
const iconShadow = process.env.PUBLIC_URL + '/assets/marker-shadow.png'

// สร้าง icon สำหรับแต่ละประเภท
const ClinicIcon = L.icon({
    iconUrl: iconclinic,
    shadowUrl: iconShadow,
    iconSize: [60, 60],
    iconAnchor: [25.5, 20.5]
})

const PharmacyIcon = L.icon({
    iconUrl: iconpharmacy,
    shadowUrl: iconShadow,
    iconSize: [60, 60],
    iconAnchor: [25.5, 20.5]
})

const CSVFileLocal = (props) => {
    const [data, setData] = useState([])

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const file1 = process.env.PUBLIC_URL + '/assets/pointclinic.csv'
        const file2 = process.env.PUBLIC_URL + '/assets/pointpharmacy.csv'

        console.log("Debug - Fetching files:", { file1, file2 });

        try {
            const res1 = await fetch(file1)
            console.log("Debug - Clinic file response:", res1.status, res1.ok);
            const text1 = await res1.text();
            console.log("Debug - Clinic file size:", text1.length, "characters");
            const json1 = Papa.parse(text1, { header: true }).data
            console.log("Debug - Clinic parsed data:", json1.length, "rows");
            const filterData1 = json1.filter(
                item =>
                    item.long !== '' &&
                    item.lat !== '' &&
                    !isNaN(parseFloat(item.lat)) &&
                    !isNaN(parseFloat(item.long))
            ).map(item => ({ ...item, type: 'clinic' }))
            console.log("Debug - Clinic filtered data:", filterData1.length, "valid rows");

            const res2 = await fetch(file2)
            console.log("Debug - Pharmacy file response:", res2.status, res2.ok);
            const text2 = await res2.text();
            console.log("Debug - Pharmacy file size:", text2.length, "characters");
            const json2 = Papa.parse(text2, { header: true }).data
            console.log("Debug - Pharmacy parsed data:", json2.length, "rows");
            const filterData2 = json2.filter(
                item =>
                    item.long !== '' &&
                    item.lat !== '' &&
                    !isNaN(parseFloat(item.lat)) &&
                    !isNaN(parseFloat(item.long))
            ).map(item => ({ ...item, type: 'pharmacy' }))
            console.log("Debug - Pharmacy filtered data:", filterData2.length, "valid rows");

            const combined = [...filterData1, ...filterData2]
            console.log("Debug - Combined data:", combined.length, "total rows");
            console.log("Debug - Sample combined data:", combined.slice(0, 2));
            setData(combined)
        } catch (error) {
            console.error("Debug - Error fetching data:", error);
        }
    }

const { type } = props;
let markers = [];

const filterAndOmitColumns = (items) =>
    items.map(({ "สิทธิประกันสุขภาพ 30 บาท": thirty, "สิทธิประกันสังคม": ss, ...rest }) => rest); // ลบคอลัมน์สิทธิ์

if (type === "thirty") {
    markers = filterAndOmitColumns(
        data.filter(item =>
            item["สิทธิประกันสุขภาพ 30 บาท"] && item["สิทธิประกันสุขภาพ 30 บาท"] !== "ไม่รับสิทธิ์" &&
            (!item["สิทธิประกันสังคม"] || item["สิทธิประกันสังคม"] === "ไม่รับสิทธิ์")
        )
    );
} else if (type === "ss") {
    console.log("Debug SS - Total data:", data.length);
    console.log("Debug SS - Sample data:", data.slice(0, 3));
    
    const filtered = data.filter(item => {
        const hasSSRight = item["สิทธิประกันสังคม"] && item["สิทธิประกันสังคม"] !== "ไม่รับสิทธิ์";
        // เปลี่ยนเงื่อนไข: แสดงทุกคลินิกที่รับประกันสังคม (ไม่ว่าจะรับ 30 บาทด้วยหรือไม่)
        
        if (hasSSRight) {
            console.log("Debug SS - Found SS item:", {
                name: item["ชื่อ"],
                ssValue: item["สิทธิประกันสังคม"],
                thirtyValue: item["สิทธิประกันสุขภาพ 30 บาท"],
                hasSSRight,
                passFilter: hasSSRight
            });
        }
        
        return hasSSRight;
    });
    
    console.log("Debug SS - Filtered items:", filtered.length, filtered);
    markers = filterAndOmitColumns(filtered);
} else if (type === "both") {
    markers = filterAndOmitColumns(
        data.filter(item =>
            item["สิทธิประกันสุขภาพ 30 บาท"] && item["สิทธิประกันสุขภาพ 30 บาท"] !== "ไม่รับสิทธิ์" &&
            item["สิทธิประกันสังคม"] && item["สิทธิประกันสังคม"] !== "ไม่รับสิทธิ์"
        )
    );
} else {
    markers = filterAndOmitColumns(data);
}
    const [popupInfo, setPopupInfo] = useState({ feature: null, position: null });
    const popupRefs = useRef({});

    useEffect(() => {
        if (popupInfo.feature) {
            const key = `${popupInfo.feature["ชื่อ"]}-${popupInfo.feature.lat}-${popupInfo.feature.long}`;
            if (popupRefs.current[key] && popupRefs.current[key].leafletElement) {
                popupRefs.current[key].leafletElement.openOn(popupRefs.current[key].leafletElement._map);
            }
        }
    }, [popupInfo]);

    // ถ้ามี prop onSelectFeature ให้ register callback เพื่อให้ parent เรียกเปิด popup ได้
    React.useEffect(() => {
        if (props.onSelectFeature) {
            props.onSelectFeature((item) => {
                setPopupInfo({ feature: null, position: null });
                setTimeout(() => {
                    setPopupInfo({ feature: item, position: [parseFloat(item.lat), parseFloat(item.long)] });
                }, 0);
            });
        }
    }, [props]);

    return <>
        {markers.map((item, index) => (
            <Marker
                key={index}
                position={[parseFloat(item.lat), parseFloat(item.long)]}
                icon={item.type === 'clinic' ? ClinicIcon : PharmacyIcon}
                eventHandlers={{
                    click: () => {
                        setPopupInfo({ feature: null, position: null });
                        setTimeout(() => {
                            setPopupInfo({ feature: item, position: [parseFloat(item.lat), parseFloat(item.long)] });
                        }, 0);
                    }
                }}
            >
                <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent={false}>
                    {item["ชื่อ"]}
                </Tooltip>
                {/* Popup แยกสำหรับชื่อ: เปิดเฉพาะ marker ที่ถูกเลือก */}
                {item["Image URL"] && item["Image URL"].startsWith("http") &&
                 popupInfo.feature &&
                 item.lat === popupInfo.feature.lat &&
                 item.long === popupInfo.feature.long &&
                 item["ชื่อ"] === popupInfo.feature["ชื่อ"] && (
                    <Popup
                        key={`popup-${item["ชื่อ"]}-${item.lat}-${item.long}-${popupInfo.feature["ชื่อ"]}`}
                        ref={el => {
                            const refKey = `${item["ชื่อ"]}-${item.lat}-${item.long}`;
                            if (el) popupRefs.current[refKey] = el;
                        }}
                    >
                        <div style={{ textAlign: 'center', minWidth: 100, minHeight: 30, fontFamily: 'THSarabun' }}>
                            <div style={{ fontWeight: 'bold', fontSize: 16 }}>{item["ชื่อ"]}</div>
                        </div>
                    </Popup>
                )}
            </Marker>
        ))}
        {popupInfo.feature && popupInfo.position && (
            <MapPopup feature={popupInfo.feature} markerPosition={popupInfo.position} onClose={() => setPopupInfo({ feature: null, position: null })} />
        )}
    </>;
}




export default CSVFileLocal;