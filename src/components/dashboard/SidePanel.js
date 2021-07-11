import '../../assets/css/dashboard/SidePanel.css'
import Calendar from './calendar'
import Tasks from './Tasks'

import { motion } from 'framer-motion'
import { DashboardVariants } from '../../AnimationVariants'


const SidePanel = () => {
    const sampleTask = [
        {
            id: 0,
            name: 'Feed the Dogs',
            Important: false,
            Time_Date: new Date(),
            Finished: false,
        },
        {
            id: 1,
            name: 'Go to Mass',
            Important: true,
            Time_Date: new Date(),
            Finished: false,
        },
        {
            id: 3,
            name: 'Finish the Calculus Assignment',
            Important: false,
            Time_Date: new Date(),
            Finished: true,
        },
        {
            id: 4,
            name: 'Physics Quipper',
            Important: false,
            Time_Date: new Date(),
            Finished: false,
        }
    ]

    return (
        <motion.div className="side-panel"
            variants={DashboardVariants.SidePanel}
            initial='hidden'
            animate='visible'
            exit='exit'
        >
            <Calendar />
            <Tasks tasks={sampleTask}/>
        </motion.div>
    )
}

export default SidePanel
