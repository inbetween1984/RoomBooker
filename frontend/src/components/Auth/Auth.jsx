import React, { useState } from 'react';
import {
    MDBContainer,
    MDBRow,
    MDBCol,
    MDBCard,
    MDBCardBody,
    MDBInput,
} from 'mdb-react-ui-kit';
import { useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import axios from "axios";

const Auth = ({ mode = "login" }) => {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const isRegister = mode === "register";

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");

        if (isRegister) {
            if (password !== confirmPassword) {
                setMessage("Пароли не совпадают");
                return;
            }

            try {
                 await axios.post("http://localhost:8000/api/register/", {
                    username,
                    password,
                });
                setMessage("Регистрация успешна! Вы можете войти.");
            } catch (err) {
                setMessage("Ошибка: " + (err.response?.data?.error || "Не удалось зарегистрироваться"));
            }
        } else {
            try {
                const response = await axios.post("http://localhost:8000/api/login/", {
                    username,
                    password,
                });

                localStorage.setItem("authToken", response.data.access);
                localStorage.setItem("username", response.data.username);

                navigate("/");
            } catch (err) {
                setMessage("Ошибка: " + (err.response?.data?.error || "Не удалось войти"));
            }
        }
    };

    return (
        <MDBContainer fluid className='p-4 background-radial-gradient overflow-hidden'>
            <MDBRow>
                <MDBCol md='6' className='text-center text-md-start d-flex flex-column justify-content-center'>
                    <h1 className="my-5 display-3 fw-bold ls-tight px-3" style={{ color: 'hsl(218, 81%, 95%)' }}>
                        Простое решение <br />
                        <span style={{ color: 'hsl(218, 81%, 75%)' }}>для аренды конференц-залов</span>
                    </h1>
                    <p className='px-3' style={{ color: 'hsl(218, 81%, 85%)' }}>
                        RoomBooker — это удобный сервис для поиска и бронирования конференц-залов
                        для ваших встреч, тренингов и мероприятий. Широкий выбор залов, прозрачные
                        условия аренды и интуитивно понятный интерфейс.
                    </p>
                </MDBCol>
                <MDBCol md='6' className='position-relative'>
                    <div id="radius-shape-1" className="position-absolute rounded-circle shadow-5-strong"></div>
                    <div id="radius-shape-2" className="position-absolute shadow-5-strong"></div>
                    <MDBCard className='my-5 bg-glass'>
                        <MDBCardBody className='p-5'>
                            <h1 className="text-center mb-4">
                                {isRegister ? "Регистрация" : "Авторизация"}
                            </h1>
                            <form onSubmit={handleSubmit}>
                                <MDBInput
                                    wrapperClass='mb-4'
                                    id='form3'
                                    type='text'
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    placeholder="Логин"
                                />
                                <MDBInput
                                    wrapperClass='mb-4'
                                    id='form4'
                                    type='password'
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    placeholder="Пароль"
                                />
                                {isRegister && (
                                    <MDBInput
                                        wrapperClass='mb-4'
                                        id='form5'
                                        type='password'
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        placeholder="Повторите пароль"
                                    />
                                )}
                                <Button className='mb-4' size='md' type="submit" variant="primary">
                                    {isRegister ? "Зарегистрироваться" : "Войти"}
                                </Button>
                            </form>
                            {message && <p className="text-center text-danger mt-3">{message}</p>}
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    );
};

export default Auth;
