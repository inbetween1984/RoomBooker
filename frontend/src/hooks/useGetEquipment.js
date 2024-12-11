import {useEffect, useState} from "react";

export const useGetEquipment = () => {
    const [equipment, setEquipment] = useState([]);
    const [loading, setLoading] = useState(true)

    const [error, setError] = useState("");

    useEffect(() => {
        fetch('http://localhost:8000/api/equipments/')
            .then(response => response.json())
            .then(data => setEquipment(data))
            .catch(e => {
                    setError("Ошибка получения оборудования");
                }
            )
            .finally(() => setLoading(false));
    }, []);

    return {equipment, error, loading};
}