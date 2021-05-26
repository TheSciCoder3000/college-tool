import '../../assets/css/dashboard/calendar.css'
import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import createCalendar from '../public/CalendarLogic'

const Calendar = () => {
    const [appDate, setAppDate] = useState(new Date())
    const [monthState, setMonthState] = useState(appDate.getMonth())
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']


    const switchCalendar = (value) => {
        let updatedDate = appDate
        updatedDate.setMonth(appDate.getMonth() + value)
        setAppDate(updatedDate)
        setMonthState(updatedDate.getMonth())
    }

    return (
        <div className="calendar-widget">
            <div className="calendar-header">
                <button id="calendar-left"
                        className="calendar-btn"
                        onClick={() => switchCalendar(-1)}>
                    <FontAwesomeIcon icon="chevron-left"
                                     id="calendar-left" />
                </button>
                <h1 id="month-header">{months[monthState]}</h1>
                <button id="calendar-right"
                        className="calendar-btn"
                        onClick={() => switchCalendar(1)}>
                    <FontAwesomeIcon icon="chevron-right"
                                     id="calendar-right" />
                </button>
            </div>
            <div className="calendar-body">
                <div className="cal-row days">
                    <div className="day">
                        S
                    </div>
                    <div className="day">
                        M
                    </div>
                    <div className="day">
                        T
                    </div>
                    <div className="day">
                        W
                    </div>
                    <div className="day">
                        T
                    </div>
                    <div className="day">
                        F
                    </div>
                    <div className="day">
                        S
                    </div>
                </div>
                {createCalendar(appDate)}
            </div>
        </div>
    )
}

export default Calendar
