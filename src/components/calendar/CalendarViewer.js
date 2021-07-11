import { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import '../../assets/css/calendar/CalendarViewer.css'
import { motion } from 'framer-motion'

const CalendarVariant = {
    hidden: {
        opacity: 0
    },
    visible: {
        opacity: 1,
        transition: {
            delay: 0.8
        }
    },
    exit: {
        opacity: 0
    }
}

const CalendarViewer = () => {
    const [ViewDate, setViewDate] = useState(new Date())
    const [monthState, setMonthState] = useState(ViewDate.getMonth())
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    function renderCalenderViewer(calendarDate) {
        let calendarView = []
        let emptyIndx = 0
        let cDate = new Date()                                         // Get current date
        let cMonth = calendarDate.getMonth()                           // Get month from date argument
        let cYear = calendarDate.getFullYear()                         // Get year from date argument
        let cachedDate = new Date(cYear, cMonth, 1)                    // Create date cache for iteration

        for (let w = 0; w < 6; w++) {
            // Generate week element
            let week = []
            for (let d = 0; d < 7; d++) {
                if (d === cachedDate.getDay() && cachedDate.getMonth() === cMonth) {                  // If day and month corresponds to cache
                    // Append to day to week list
                    week.push(
                        <div key={`viewer-${cachedDate.getDate()}`} 
                             className={`date ${cDate.getDate() === cachedDate.getDate() 
                             && cDate.getMonth() === cachedDate.getMonth() ? 'current' : ''}`}>
                            <span>{cachedDate.getDate()}</span>
                        </div>
                    )
                    cachedDate.setDate(cachedDate.getDate() + 1)                                   // Increment date cache for iteration

                } else {                                                                           // Else append to week list as empty date
                    week.push(
                        <div key={`empty-${emptyIndx}`} className="empty-date-viewer">
                        </div>
                    )
                    emptyIndx++
                }
            }

            // Append week to calendar list
            calendarView.push(
                <div className="cal-viewer-row week"
                    key={`week-${calendarView.length}`}>
                    {week.map((day) => (
                        day
                    ))}
                </div>
            )
        }
        return calendarView
    }
    
    const switchCalendar = (value) => {
        let updatedDate = ViewDate
        updatedDate.setMonth(ViewDate.getMonth() + value)
        setViewDate(updatedDate)                                            // Update View Date
        setMonthState(updatedDate.getMonth())                               // Change calendar viewer
    }


    return (
        <motion.div className="calendar-viewer"
            variants={CalendarVariant}
            initial='hidden'
            animate='visible'
            exit='exit'
        >
            <div className="calendar-viewer-header">
                <h1 id="calendar-month-header">{months[monthState]}</h1>
                <button id="viewer-left"
                        className="calendar-btn"
                        onClick={() => switchCalendar(-1)}>
                    <FontAwesomeIcon icon="chevron-left"
                                     id="calendar-left-icon" />
                </button>
                <button id="viewer-right"
                        className="calendar-btn"
                        onClick={() => switchCalendar(1)}>
                    <FontAwesomeIcon icon="chevron-right"
                                     id="calendar-right-icon" />
                </button>
            </div>
            <div className="calendar-viewer-body">
                <div className="cal-viewer-row cal-days">
                    <div className="cal-day">
                        Sunday
                    </div>
                    <div className="cal-day">
                        Monday
                    </div>
                    <div className="cal-day">
                        Tuesday
                    </div>
                    <div className="cal-day">
                        Wednesday
                    </div>
                    <div className="cal-day">
                        Thursday
                    </div>
                    <div className="cal-day">
                        Friday
                    </div>
                    <div className="cal-day">
                        Saturday
                    </div>
                </div>
                {renderCalenderViewer(ViewDate)}
            </div>
        </motion.div>
    )
}

export default CalendarViewer
