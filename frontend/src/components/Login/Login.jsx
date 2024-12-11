import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card, Container, Row, Col } from "react-bootstrap";
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const response = await axios.post("http://localhost:8000/api/login/", {
                username,
                password,
            });

            localStorage.setItem("authToken", response.data.access);
            localStorage.setItem("username", response.data.username);

            setMessage("Login successful!");
            navigate("/bookings");
        } catch (err) {
            setMessage("Error: " + (err.response?.data?.error || "Login failed"));
        }
    };

    return (
        <Container className="d-flex justify-content-center align-items-center min-vh-100">
            <Row className="w-100">
                <Col md={6} lg={4} className="mx-auto">
                    <Card className="shadow-lg">
                        <Card.Body>
                            <h1 className="text-center mb-4">Авторизация</h1>
                            <Form onSubmit={handleLogin}>
                                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                                    <Form.Label>Логин:</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        placeholder="Введите логин"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3" controlId="formBasicPassword">
                                    <Form.Label>Пароль:</Form.Label>
                                    <Form.Control
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        placeholder="Введите пароль"
                                    />
                                </Form.Group>
                                <Button variant="primary" type="submit" className="w-100">
                                    Войти
                                </Button>
                            </Form>
                            {message && <p className="text-center text-danger mt-3">{message}</p>}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;