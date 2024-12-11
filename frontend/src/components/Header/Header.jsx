import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { Button, InputGroup, Form } from 'react-bootstrap';

const Header = ({ onSearch }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem('authToken');

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/login');
    };

    return (
        <Navbar bg="light" expand="lg" className="shadow-sm">
            <Container fluid>
                <Navbar.Brand href="/" className="fw-bold text-primary">
                    RoomBooker
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/">Домашняя страница</Nav.Link>
                        {token && <Nav.Link href="/bookings">Мои бронирования</Nav.Link>}
                        {!token && (
                            <>
                                <Nav.Link href="/register">Регистрация</Nav.Link>
                                <Nav.Link href="/login">Авторизация</Nav.Link>
                            </>
                        )}
                    </Nav>
                    {location.pathname === '/' && (
                        <div className="d-flex mx-auto" style={{ maxWidth: '400px', flex: 1 }}>
                            <InputGroup>
                                <Form.Control
                                    type="text"
                                    placeholder="Поиск..."
                                    onChange={(e) => onSearch(e.target.value)}
                                />
                            </InputGroup>
                        </div>
                    )}
                    {token && (
                        <Nav className="ms-auto">
                            <Navbar.Text className="me-3">
                                Signed in as: <span className="fw-semibold">{localStorage.getItem('username') || 'User'}</span>
                            </Navbar.Text>
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={handleLogout}
                            >
                                Logout
                            </Button>
                        </Nav>
                    )}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Header;
