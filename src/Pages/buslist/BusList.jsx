import { useState, useEffect } from 'react'
import { Card, Button, Container, Row, Col, Badge } from 'react-bootstrap'
import './Buslist.css'
import NavigationBar from '../../component/NavigationBar'
import Footer from '../../component/Footer'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../axiosConfig'
import { format, formatDistance } from 'date-fns'

const BusList = () => {
    const navigate = useNavigate()
    const { data } = useParams()
    const decodedData = decodeURIComponent(data)
    const parsedData = JSON.parse(decodedData)
    const [buses, setBuses] = useState([])

    useEffect(() => {
        const updateBuses = async () => {
            try {
                let response = await api.get('route')
                response = response.data

                for (const key in response) {
                    let element = response[key]

                    if (
                        element.origin === parsedData.from &&
                        element.destination === parsedData.to
                    ) {
                        response = await api.get(`schedule/br/${element._id}`)
                        response = response.data

                        let busList = []

                        response.forEach((schedule) => {
                            console.log(schedule)
                            let busData = {
                                _id: schedule._id,
                                busId: schedule.busId,
                                origin: element.origin,
                                via: element.via,
                                destination: element.destination,
                                departure: new Date(schedule.departure),
                                arrival: schedule.arrival,
                                seats: isPlainObject(schedule.seats)
                                    ? schedule.seats
                                    : {},
                                price: element.price,
                                reqDate: parsedData.date,
                            }

                            busData.departure = new Date(busData.departure)
                            var currentDate = new Date()

                            busData.departure.setFullYear(
                                currentDate.getFullYear()
                            )
                            busData.departure.setMonth(currentDate.getMonth())
                            busData.departure.setDate(currentDate.getDate())

                            busList.push(busData)
                        })

                        // Sorting buses by departure time
                        busList.sort((a, b) => a.departure - b.departure)

                        setBuses(busList)
                        break
                    }
                }
            } catch (error) {
                console.error('Error fetching data: ', error)
            }
        }

        updateBuses()
    }, [parsedData.from, parsedData.to, parsedData.time, parsedData.date])

    const handleReserveSeatClick = (busData) => {
        navigate(`/seatselect/${encodeURIComponent(JSON.stringify(busData))}`)
    }

    function isPlainObject(value) {
        if (Object.prototype.toString.call(value) !== '[object Object]') {
            return false
        }

        const prototype = Object.getPrototypeOf(value)
        return prototype === null || prototype === Object.prototype
    }

    return (
        <>
            <NavigationBar />
            <div className="main-content">
                <Container className="mt-5 pt-3">
                    <Row className="mb-4">
                        <Col>
                            <h4>
                                Available buses on{' '}
                                <Badge bg="info" className="badge-custom">
                                    {parsedData.date}
                                </Badge>{' '}
                                from{' '}
                                <Badge bg="info" className="badge-custom">
                                    {parsedData.time}
                                </Badge>
                            </h4>
                        </Col>
                    </Row>
                    {buses.length > 0 ? (
                        <Row xs={1} md={2} lg={3} className="g-4">
                            {buses.map((bus) => (
                                <Col key={bus._id}>
                                    <Card className="bus-card" key={bus._id}>
                                        <Card.Body className="card-body">
                                            <div className="card-content">
                                                <Card.Title className="bus-time">
                                                    {format(
                                                        new Date(bus.departure),
                                                        'hh:mm aaa'
                                                    )}{' '}
                                                    {' • '}
                                                    <span className="timestamp">
                                                        {formatDistance(
                                                            new Date(
                                                                bus.departure
                                                            ).setFullYear(
                                                                new Date(
                                                                    parsedData.date
                                                                ).getFullYear(),
                                                                new Date(
                                                                    parsedData.date
                                                                ).getMonth(),
                                                                new Date(
                                                                    parsedData.date
                                                                ).getDate()
                                                            ),
                                                            new Date(),
                                                            { addSuffix: true }
                                                        )}
                                                    </span>
                                                </Card.Title>
                                                <Card.Text className="card-text">
                                                    Departing from {bus.origin},
                                                    the journey is expected to
                                                    reach {bus.destination}{' '}
                                                    around{' '}
                                                    {format(
                                                        new Date(bus.arrival),
                                                        'hh:mm aaa'
                                                    )}{' '}
                                                    via {bus.via}.
                                                </Card.Text>
                                            </div>
                                            <div className="button-wrapper">
                                                <Button
                                                    variant="primary"
                                                    className="w-100"
                                                    disable={
                                                        new Date(
                                                            bus.departure
                                                        ).setFullYear(
                                                            new Date(
                                                                parsedData.date
                                                            ).getFullYear(),
                                                            new Date(
                                                                parsedData.date
                                                            ).getMonth(),
                                                            new Date(
                                                                parsedData.date
                                                            ).getDate()
                                                        ) < new Date()
                                                            ? 'true'
                                                            : 'false'
                                                    }
                                                    onClick={() =>
                                                        handleReserveSeatClick(
                                                            bus
                                                        )
                                                    }
                                                >
                                                    Reserve seat →
                                                </Button>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    ) : (
                        <div className="text-center">
                            <p>
                                Sorry, there are no buses available right now in
                                the route you searched. <br />
                                Please try another date or change the Departure
                                & Arrival point & search again.
                            </p>
                            <p>
                                Example: Try Colombo - Badulla instead of
                                Bambalapitiya - Badulla
                            </p>
                        </div>
                    )}
                </Container>
            </div>
            <Footer />
        </>
    )
}

export default BusList
