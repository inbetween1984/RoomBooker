import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {Button, Card, Col, Container, Row, Spinner, Form} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {API_URL, PAY_URL} from "../../index";
import './RoomDetail.css';


const RoomDetail = () => {
    const { id } = useParams();
    const [room, setRoom] = useState(null);
    const [bookedDates, setBookedDates] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [showReviews, setShowReviews] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [error, setError] = useState("");
    const [reviewError, setReviewError] = useState("");
    const [success, setSuccess] = useState("");

    const [rating, setRating] = useState("");
    const [comment, setComment] = useState("");

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
            setError(
                <>
                    You need to be{" "}
                    <a href="/login" className="text-decoration-none" style={{ color: "blue" }}>
                        logged in
                    </a>{" "}
                    to book a room.
                </>
            );
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

    const fetchReviews = () => {
        fetch(`${API_URL}${id}/reviews`)
            .then((response) => response.json())
            .then(setReviews)
            .catch(() => setReviewError("Failed to load reviews."));
    };

    const toggleReviews = () => {
        setShowReviews((prev) => {
            if (!prev && reviews.length === 0) {
                fetchReviews();
            }
            return !prev;
        });
    };

    const handleReviewSubmit = () => {
        const token = localStorage.getItem("authToken");

        if (!token) {
            setReviewError(
                <>
                    You need to be{" "}
                    <a href="/login" className="text-decoration-none" style={{ color: "blue" }}>
                        logged in
                    </a>{" "}
                    to submit a review.
                </>
            );
            setRating("");
            setComment("");
            return;
        }

        if (!rating || !comment) {
            setReviewError("Please provide both rating and comment.");
            return;
        }

        fetch(`${API_URL}${id}/create_review/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ rating, comment }),
        })
            .then((response) => {
                if (!response.ok) {
                    return response.json().then((err) => {
                        throw new Error(err.error || "Failed to submit review.");
                    });
                }
                return response.json();
            })
            .then((reviewData) => {
                setReviews((prevReviews) => {
                    if (Array.isArray(prevReviews)) {
                        return [...prevReviews, reviewData];
                    } else {
                        return [reviewData];
                    }
                });
                setRating("");
                setComment("");
                setReviewError("");
            })
            .catch((error) => {
                setRating("");
                setComment("");
                console.error("Error submitting review:", error);
                setReviewError(error.message || "Failed to submit review. Please try again later.");
            });
    };


    return (
        <Container className="mt-4">
            {error && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center mt-2">
                    <span>{error}</span>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setError("")}
                    ></button>
                </div>
            )}
            {success && (
                <div className="alert alert-danger d-flex justify-content-between align-items-center mt-2">
                    <span>{success}</span>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={() => setSuccess("")}
                    ></button>
                </div>
            )}
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
            <Button onClick={toggleReviews} className="mt-3">
                {showReviews ? "Скрыть отзывы" : "Отзывы"}
            </Button>
            {showReviews && (
                <div>
                    {reviewError && (
                        <div className="alert alert-danger d-flex justify-content-between align-items-center mt-2">
                            <span>{reviewError}</span>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => setReviewError("")}
                            ></button>
                        </div>
                    )}
                    <Card className="mt-4">
                        <Card.Body>
                        <Card.Title as="h5">Добавить отзыв</Card.Title>
                            <Form>
                                <Form.Group controlId="reviewRating">
                                    <Form.Label>Rating</Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={rating}
                                        onChange={(e) => setRating(e.target.value)}
                                    >
                                        <option value="">Select rating</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </Form.Control>
                                </Form.Group>
                                <Form.Group controlId="reviewComment" className="mt-2">
                                    <Form.Label>Comment</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={3}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                    />
                                </Form.Group>
                                <Button onClick={handleReviewSubmit} className="mt-3" variant="primary">
                                    Submit Review
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                    {reviews.length > 0 ? (
                        reviews.map((review, index) => (
                            <Card key={index} className="mt-3">
                                <Card.Body>
                                    <strong>{review.user}</strong>
                                    <p>Rating: {review.rating}/5</p>
                                    <p>{review.comment}</p>
                                </Card.Body>
                            </Card>
                        ))
                    ) : (
                        <p>No reviews yet.</p>
                    )}

                </div>
            )}
        </Container>
    );
};

export default RoomDetail;
