import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const YandexMap = ({ rooms }) => {
    const navigate = useNavigate();
    const mapRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        if (!rooms || rooms.length === 0) return;

        const ymaps = window.ymaps;

        ymaps.ready(() => {
            if (mapRef.current) {
                mapRef.current.destroy();
                mapRef.current = null;
            }

            const map = new ymaps.Map(containerRef.current, {
                center: [rooms[0].latitude, rooms[0].longitude] || [55.751244, 37.618423],
                zoom: 10,
                controls: ["zoomControl", "fullscreenControl"],
            });

            rooms.forEach((room) => {
                if (room.latitude && room.longitude) {
                    const placemark = new ymaps.Placemark(
                        [room.latitude, room.longitude],
                        {
                            hintContent: room.name,
                            balloonContent: `
                                <strong>${room.name}</strong><br>
                                Вместимость: ${room.capacity} чел.<br>
                                Адрес: ${room.address}
                            `,
                        },
                        {
                            preset: "islands#blueDotIcon",
                        }
                    );

                    placemark.events.add("click", () => {
                        navigate(`/${room.id}`);
                    });

                    map.geoObjects.add(placemark);
                }
            });

            if (rooms.some((room) => [room.latitude, room.longitude])) {
                map.setBounds(map.geoObjects.getBounds(), {
                    checkZoomRange: true,
                });
            }

            mapRef.current = map;
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.destroy();
                mapRef.current = null;
            }
        };
    }, [rooms, navigate]);

    return (
        <div>
            <h2>Конференц-залы на карте</h2>
            <div
                ref={containerRef}
                style={{
                    width: "100%",
                    height: "500px",
                    border: "1px solid #ccc",
                }}
            />
        </div>
    );
};

export default YandexMap;