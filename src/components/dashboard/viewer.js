import '../../assets/css/dashboard/home.css'
import LiveClock from "react-live-clock";
import { NavLink as Link, useHistory } from 'react-router-dom';
import { useCallback } from 'react';

import { motion } from 'framer-motion';
import { DashboardVariants } from '../../AnimationVariants';


const Viewer = ({ showSidePanel }) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    let date = new Date()

    const history = useHistory()
    const CalendarDbClickHandler = useCallback(() => {
        showSidePanel(false)
        history.push('/Calendar')
    }, [history])

    return (
        <motion.div className="viewer"
            variants={DashboardVariants.Viewer}
            initial='hidden'
            animate='visible'
            exit='exit'
        >
            <div className="greeting">
                <div className="time-date">
                    <div className="greeting-time">
                        <LiveClock format="h:mm A" ticking />
                    </div>
                    <div className="greeting-date" onClick={() => showSidePanel(state => !state)}>
                        {`${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`}
                    </div>
                </div>
            </div>

            <div className="nav-container">
                <Link className='dashboard-nav-links' to='/Notes'>Notes</Link>
                <Link className='dashboard-nav-links' to='/dashboard'>Dashboard</Link>
                <Link className='dashboard-nav-links' to='/Todo'>Todo</Link>
                <a onClick={() => showSidePanel(sidePanelState => !sidePanelState)} 
                   className="dashboard-nav-links"
                   onDoubleClick={CalendarDbClickHandler}>Calendar</a>
            </div>
        </motion.div>
    )
}

export default Viewer
