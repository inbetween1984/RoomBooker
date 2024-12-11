import { useState, useEffect } from 'react'
import {API_URL} from "../index";

export const useGetRooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("");

    useEffect(() => {
        fetch(API_URL)
            .then(response => response.json())
            .then(data => {
                setRooms(data)
            })
            .catch(error => {
                setError("Failed to fetch data. Please try again later.");
            })
            .finally(() => setLoading(false));
    }, []);

    return {rooms, loading, error};
}