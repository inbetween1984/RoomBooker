import React, { useState } from "react";
import axios from "axios";
import Form from 'react-bootstrap/Form';
import {Button} from "react-bootstrap";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage("");
        try {
            const response = await axios.post("http://localhost:8000/api/register/", {
                username,
                password,
            });
            setMessage(`Registration successful! Token: ${response.data.token}`);
        } catch (err) {
            setMessage("Error: " + (err.response?.data?.error || "Registration failed"));
        }
    };

    return (
        <Form onSubmit={handleRegister}>
            <h1>Регистрация</h1>
            <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                <Form.Label>Логин:</Form.Label>
                <Form.Control
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicPassword">
                <Form.Label>Пароль:</Form.Label>
                <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </Form.Group>
            <Button variant="primary" type="submit">
                Зарегистрироваться
            </Button>
            {message && <p>{message}</p>}
        </Form>
    );
};

export default Register;
