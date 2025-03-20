import React, {useEffect, useMemo, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import FilterRooms from '../FilterRooms/FilterRooms';
import Modal from '../Modal/Modal';
import { useGetRooms } from '../../hooks/useGetRooms';
import { Button, Spinner, Alert, ListGroup, Container, Row, Col, Image } from 'react-bootstrap';
import './RoomList.css';
import YandexMap from "../YandexMap/YandexMap";

const RoomList = ({ searchTerm }) => {
    const navigate = useNavigate();
    const { rooms, loading, error} = useGetRooms();
    const [filterResults, setFilterResults] = useState(rooms);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [reset, setReset] = useState(false);

    const filteredRooms = useMemo(() => {
        if (filterResults.length > 0) {
            return filterResults.filter((room) =>
                room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                room.address.toLowerCase().includes(searchTerm.toLowerCase())

            );
        }
        return [];
    }, [filterResults, searchTerm]);

    useEffect(() => {
        setFilterResults(rooms);
    }, [rooms]);

    const handleFilterApply = (filteredData) => {
        setReset(true);
        setFilterResults(filteredData);
        setIsFilterModalOpen(false);
    };

    const handleFilterReset = () => {
        setReset(false);
        setFilterResults(rooms);
    }

    return (
        <Container className="mt-5">
            <Row>
                <Col>
                    <h1 className="text-center mb-4">Список залов</h1>
                    {!loading && !error && <YandexMap rooms={filteredRooms} />}

                    {loading && (
                        <div className="text-center">
                            <Spinner animation="border" />
                            <p>Loading...</p>
                        </div>
                    )}
                    {error && <Alert variant="danger">{error}</Alert>}

                    <div className="d-flex justify-content-center mb-3">
                        <Button variant="primary" onClick={() => setIsFilterModalOpen(true)}>
                            Фильтровать
                        </Button>
                        {reset && (
                            <Button
                                variant="secondary"
                                onClick={handleFilterReset}
                                className="ms-2"
                            >
                                Сброс
                            </Button>
                        )}
                    </div>

                    {isFilterModalOpen && (
                        <Modal onClose={() => setIsFilterModalOpen(false)}>
                            <FilterRooms allRooms={rooms} onApplyFilters={handleFilterApply} />
                        </Modal>
                    )}

                    {!loading && !error && (
                        <ListGroup>
                            {filteredRooms.length === 0 || filterResults.length === 0 ? (
                                <Alert variant="info">No rooms found</Alert>
                            ) : (
                                filteredRooms.map((room) => (
                                    <ListGroup.Item
                                        key={room.id}
                                        action
                                        onClick={() => navigate(`/${room.id}`)}
                                        className="room-item"
                                    >
                                        <Row>
                                            <Col xs={3}>
                                                {room.image && (
                                                    <Image
                                                        src={room.image}
                                                        alt={room.name}
                                                        thumbnail
                                                        className="room-image"
                                                    />
                                                )}
                                            </Col>
                                            <Col xs={9}>
                                                <strong>{room.name}</strong>
                                                <p>Вместимость: {room.capacity} чел.</p>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                ))
                            )}
                        </ListGroup>
                    )}
                </Col>
            </Row>
        </Container>
    );
};

export default RoomList;
