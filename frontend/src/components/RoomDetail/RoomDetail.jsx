import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Alert, Button, Card, Col, Container, Row, Spinner} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {API_URL, PAY_URL} from "../../index";
import './RoomDetail.css';


const RoomDetail = () => {
    const { id } = useParams();
    const [room, setRoom] = useState(null);
    const [bookedDates, setBookedDates] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetch(`${API_URL}${id}/`)
            .then((response) => response.json())
            .then((data) => {
                setRoom(data.room);
                setBookedDates(data.booked_dates.map((date) => new Date(date)));
            })
            .catch((error) => {
                console.error("Error fetching room details:", error);
                setError("Failed to load room details. Please try again later.");
            });
    }, [id]);

    const handleBooking = () => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            setError("You need to be logged in to book a room.");
            return;
        }

        const formattedDate = selectedDate.toLocaleDateString("en-CA");

        fetch(`${API_URL}${id}/book/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ date: formattedDate }),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((err) => {
                        throw new Error(err.error || "Failed to book the room.");
                    });
                }
                return response.json();
            })
            .then((bookingData) => {
                // Запрос на создание платежа
                fetch(`${PAY_URL}payment/create/${bookingData.id}/`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error("Failed to create payment.");
                        }
                        return response.json();
                    })
                    .then((paymentData) => {
                        window.location.href = paymentData.payment_url;
                    })
                    .catch((error) => {
                        console.error("Error creating payment:", error);
                        setError("Failed to create payment. Please try again later.");
                    });

                setSuccess("Booking request submitted successfully.");
                setSelectedDate(null);
                setError("");
            })
            .catch((error) => {
                console.error("Error submitting booking:", error);
                setError(error.message || "Failed to submit booking. Please try again later.");
            });
    };


    return (
        <Container className="mt-4">
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            {room ? (
                <Row>
                    <Col md={8} className="mb-4">
                        <Card>
                            <Card.Body>
                                <Card.Title as="h1" className="text-primary">
                                    {room.name}
                                </Card.Title>
                                <Card.Text>
                                    <strong>Вместимость:</strong> {room.capacity}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Оборудование:</strong> {room.equipment.join(", ")}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Адрес:</strong> {room.address}
                                </Card.Text>
                                <Card.Text>
                                    <strong>Цена:</strong> {room.price_per_day}
                                </Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                        <Card>
                            <Card.Body>
                                <Card.Title as="h2" className="mb-4">Забронировать зал</Card.Title>
                                <DatePicker
                                    selected={selectedDate}
                                    onChange={(date) => setSelectedDate(date)}
                                    minDate={new Date()}
                                    excludeDates={bookedDates}
                                    dateFormat="yyyy-MM-dd"
                                    className="form-control mb-3"
                                />
                                <Button
                                    variant="primary"
                                    onClick={handleBooking}
                                    disabled={!selectedDate}
                                    className="w-100"
                                >
                                    Бронировать
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            ) : (
                <div className="d-flex justify-content-center align-items-center mt-5">
                    <Spinner animation="border" variant="primary" />
                </div>
            )}
        </Container>
    );
};

export default RoomDetail;
