import React, { useState } from 'react';
import { useGetEquipment } from '../../hooks/useGetEquipment';
import { Form, Button, Spinner, Alert, Row, Col, Card } from 'react-bootstrap';

const FilterRooms = ({ allRooms, onApplyFilters }) => {
    const { equipment, loading: equipmentLoading, error: equipmentError } = useGetEquipment();
    const [filters, setFilters] = useState({
        capacityFrom: '',
        capacityTo: '',
        selectedEquipment: [],
        dateFrom: '',
        dateTo: '',
    });

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (filters.capacityFrom) params.append('capacity_from', filters.capacityFrom);
        if (filters.capacityTo) params.append('capacity_to', filters.capacityTo);
        if (filters.dateFrom) params.append('date_from', filters.dateFrom);
        if (filters.dateTo) params.append('date_to', filters.dateTo);
        filters.selectedEquipment.forEach((id) => params.append('equipment', id));

        fetch(`http://localhost:8000/api/rooms/?${params.toString()}`)
            .then((response) => response.json())
            .then((data) => onApplyFilters(data))
            .catch(() => alert('Ошибка при фильтрации'));
    };

    const resetFilters = () => {
        setFilters({
            capacityFrom: '',
            capacityTo: '',
            selectedEquipment: [],
            dateFrom: '',
            dateTo: '',
        });
        onApplyFilters(allRooms);
    };

    return (
        <Card className="p-4">
            <h2 className="text-center mb-4">Фильтр залов</h2>

            {equipmentError && <Alert variant="danger">{equipmentError}</Alert>}
            {equipmentLoading ? (
                <div className="text-center">
                    <Spinner animation="border" />
                    <p>Загрузка оборудования...</p>
                </div>
            ) : (
                <Form>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="capacityFrom">
                                <Form.Label>Вместимость (от):</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Минимальная вместимость"
                                    value={filters.capacityFrom}
                                    onChange={(e) =>
                                        setFilters({ ...filters, capacityFrom: e.target.value })
                                    }
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="capacityTo">
                                <Form.Label>Вместимость (до):</Form.Label>
                                <Form.Control
                                    type="number"
                                    placeholder="Максимальная вместимость"
                                    value={filters.capacityTo}
                                    onChange={(e) =>
                                        setFilters({ ...filters, capacityTo: e.target.value })
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group controlId="equipment" className="mb-3">
                        <Form.Label>Оборудование:</Form.Label>
                        <div>
                            {equipment.map((equip) => (
                                <Form.Check
                                    key={equip.id}
                                    type="checkbox"
                                    label={equip.name}
                                    value={equip.id}
                                    checked={filters.selectedEquipment.includes(equip.id)}
                                    onChange={(e) => {
                                        const selectedEquipment = [...filters.selectedEquipment];
                                        if (e.target.checked) {
                                            selectedEquipment.push(equip.id);
                                        } else {
                                            const index = selectedEquipment.indexOf(equip.id);
                                            selectedEquipment.splice(index, 1);
                                        }
                                        setFilters({ ...filters, selectedEquipment });
                                    }}
                                />
                            ))}
                        </div>
                    </Form.Group>

                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Group controlId="dateFrom">
                                <Form.Label>Дата (от):</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) =>
                                        setFilters({ ...filters, dateFrom: e.target.value })
                                    }
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="dateTo">
                                <Form.Label>Дата (до):</Form.Label>
                                <Form.Control
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) =>
                                        setFilters({ ...filters, dateTo: e.target.value })
                                    }
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <div className="d-flex justify-content-between">
                        <Button variant="primary" onClick={applyFilters}>
                            Применить
                        </Button>
                        <Button variant="secondary" onClick={resetFilters}>
                            Сбросить
                        </Button>
                    </div>
                </Form>
            )}
        </Card>
    );
};

export default FilterRooms;
