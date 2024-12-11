import React, {Fragment, useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import RoomList from "./components/RoomList/RoomList";
import Header from "./components/Header/Header";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import BookingList from "./components/BookingList/BookingList";
import RoomDetail from "./components/RoomDetail/RoomDetail";
import Auth from "./components/Auth/Auth";
import PaymentSuccess from "./components/PaymentSuccess/PaymentSuccess";

function App() {
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = (term) => {
        setSearchTerm(term);
    };

    return (
        <Router>
            <Fragment>
                <Header onSearch={handleSearch} />
                <Routes>
                    <Route path="/" element={<RoomList searchTerm={searchTerm} />} />
                    <Route path="/:id" element={<RoomDetail />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/bookings" element={<BookingList />} />
                    <Route path="/test" element={<Auth />} />
                    <Route path="/payment/success/" element={<PaymentSuccess />} />
                </Routes>
            </Fragment>
        </Router>
    );
}

export default App;
