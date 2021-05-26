import '../../assets/css/viewer.css'
import Schedule from './Schedule'
import { useState } from 'react'
import LiveClock from "react-live-clock";

const Viewer = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    let date = new Date()

    const sampleSchedule = {
        id: 0,
        name: 'Physics 2',
        time: '3:00 pm - 4:00 pm',
    }

    function switchSched() {
        console.log('sched is being switched')
    }

    return (
        <div className="viewer">
            <div className="greeting">
                <div className="time-date">
                    <div className="greeting-time">
                        <LiveClock format="h:mm A" ticking />
                    </div>
                    <div className="greeting-date">
                        {`${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`}
                    </div>
                </div>
                <Schedule sched={sampleSchedule} onSwitchSched={switchSched}/>
            </div>
        </div>
    )
}

export default Viewer
