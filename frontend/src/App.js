import React, {Fragment, useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import RoomList from "./components/RoomList/RoomList";
import Header from "./components/Header/Header";
import BookingList from "./components/BookingList/BookingList";
import RoomDetail from "./components/RoomDetail/RoomDetail";
import Auth from "./components/Auth/Auth";
import PaymentSuccess from "./components/PaymentSuccess/PaymentSuccess";
import YandexMap from "./components/YandexMap/YandexMap";

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
                    <Route path="/register" element={<Auth mode={'register'} />} />
                    <Route path="/login" element={<Auth mode={'login'} />} />
                    <Route path="/bookings" element={<BookingList />} />
                    <Route path="/map" element={<YandexMap />} />
                    <Route path="/payment/success/" element={<PaymentSuccess />} />
                </Routes>
            </Fragment>
        </Router>
    );
}

export default App;
