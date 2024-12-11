import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Container, Table, Button, Alert } from "react-bootstrap";

const BookingList = () => {
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBookings = async () => {
            const token = localStorage.getItem("authToken");

            if (!token) {
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get("http://localhost:8000/api/bookings/", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBookings(response.data);
            } catch (err) {
                if (err.response?.status === 401) {
                    localStorage.removeItem("authToken");
                    navigate("/login");
                } else {
                    setError("Failed to fetch bookings.");
                }
            }
        };

        fetchBookings();
    }, [navigate]);

    const cancelBook = async (booking_id) => {
        const token = localStorage.getItem("authToken");
        try {
            await axios.post(
                `http://localhost:8000/api/cancel_book/${booking_id}/`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setBookings((prevBookings) =>
                prevBookings.filter((booking) => booking.id !== booking_id)
            );
        } catch (error) {
            setError(error.response?.data?.error || "Failed to cancel the booking");
        }
    };

    const isCancelable = (date) => {
        const today = new Date();
        const bookingEndDate = new Date(date);
        return bookingEndDate > today;
    };

    return (
        <Container className="mt-4">
            <h1 className="mb-4 text-primary">Your Bookings</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {bookings.length === 0 && !error ? (
                <Alert variant="info">No bookings found.</Alert>
            ) : (
                <Table bordered hover responsive>
                    <thead>
                    <tr>
                        <th>#</th>
                        <th>Room</th>
                        <th>Date</th>
                        <th>Approved</th>
                        <th>Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {bookings.map((booking, index) => (
                        <tr key={booking.id}>
                            <td>{index + 1}</td>
                            <td>{booking.room.name}</td>
                            <td>{booking.date}</td>
                            <td>{booking.approved ? "Yes" : "No"}</td>
                            <td>
                                {isCancelable(booking.date) && (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => cancelBook(booking.id)}
                                >
                                    Cancel
                                </Button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default BookingList;
