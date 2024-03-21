import { Container, Row, Col, Card } from 'react-bootstrap'
import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import NavigationBar from '../../component/NavigationBar'
import './Dashboard.css'
import Footer from '../../component/Footer'
import api from '../../axiosConfig'

const Dashboard = () => {
    let username = ''
    const [bookings, setBookings] = useState([])
    const [bookingHistory, setBookingHistory] = useState([])

    username = localStorage.getItem('username')

    api.get(`/user/schedule/${localStorage.getItem('userid')}`).then(
        async (res, err) => {
            if (!err) {
                const bookings = []
                const bookingHistory = []

                for (const reservation of res.data.reservations) {
                    try {
                        const schedule = await api.get(
                            `/schedule/${reservation.scheduleId}`
                        )

                        const scheduleData = schedule.data[0]
                        if (scheduleData && scheduleData.routeId) {
                            const route = await api.get(
                                `/route/${schedule.data[0].routeId}`
                            )

                            const booking = {
                                route: `${route.data.origin} → ${route.data.destination}`,
                                date: formatDate(reservation.date),
                            }

                            hasDatePassed(reservation.date)
                                ? bookingHistory.push(booking)
                                : bookings.push(booking)
                        }
                    } catch (error) {
                        console.error(
                            'Error fetching schedule or route:',
                            error
                        )
                    }
                }
                setBookings(bookings)
                setBookingHistory(bookingHistory)
            } else {
                console.error('Error fetching user schedule:', err)
            }
        }
    )

    function formatDate(inputDate) {
        const dateParts = inputDate.split('-') // Split the date string by '-'
        const month = dateParts[1]
        const day = dateParts[2]

        // Format the date as "MM/DD"
        const formattedDate = `${month}/${day}`

        return formattedDate
    }

    function hasDatePassed(dateString) {
        const inputDate = new Date(dateString)
        const currentDate = new Date()
        return inputDate <= currentDate
    }

    const paymentHistory = [{ payId: '#33894', date: '01/03' }]

    return (
        <>
            {/*NavBar*/}
            <NavigationBar />
            {/* Main Content Section */}
            <Container fluid>
                <Row>
                    <Col md="6">
                        <h1>Hi {username}!</h1>
                    </Col>

                    <Col md="6" className="text-md-right">
                        {/* Account Settings Link */}
                        <a
                            href="/account-settings"
                            className="account-settings-link"
                        >
                            Account Settings →
                        </a>
                    </Col>
                </Row>

                <Row>
                    <Col md="6">
                        {/* Upcoming Bookings Card */}
                        <h5>Upcoming Bookings</h5>
                        <Card className="upcoming-bookings">
                            <Card.Body>
                                {bookings.map((booking, index) => (
                                    <div className="booking-item" key={index}>
                                        <span>{booking.route}</span>
                                        <span className="booking-date badge bg-info text-dark">
                                            {booking.date}
                                        </span>
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md="6">
                        <h5 className="booking-text">Booking History</h5>
                        <Card className="booking-history">
                            <Card.Body>
                                {bookingHistory.map((bookingHistory, index) => (
                                    <div className="booking-item" key={index}>
                                        <span>{bookingHistory.route}</span>
                                        <span className="booking-date badge bg-info text-dark">
                                            {bookingHistory.date}
                                        </span>
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col md="6">
                        <h5>Payment History</h5>
                        <Card className="payment-history">
                            <Card.Body>
                                {paymentHistory.map((paymentHistory, index) => (
                                    <div className="booking-item" key={index}>
                                        <span>{paymentHistory.payId}</span>
                                        <span className="booking-date badge bg-info text-dark">
                                            {paymentHistory.date}
                                        </span>
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md="6">
                        {/* Useful Links Card */}
                        <Card className="link-card">
                            <span>Useful Links</span>
                            <Card.Body>
                                {/* Repeat this block for each useful link */}
                                <Card.Link className="links" href="#">
                                    Feedback and Suggestions →
                                </Card.Link>
                                <Card.Link className="links" href="#">
                                    Support and Help →
                                </Card.Link>
                                <Card.Link className="links" href="#">
                                    Support and Help →
                                </Card.Link>
                                <Card.Link className="links" href="#">
                                    Security Information →
                                </Card.Link>
                                {/* ...more links */}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </>
    )
}

export default Dashboard
