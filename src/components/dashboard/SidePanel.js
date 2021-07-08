import '../../assets/css/dashboard/SidePanel.css'
import Calendar from './calendar'
import Tasks from './Tasks'
import { motion } from 'framer-motion'

const SidePanelVariant = {
    hidden: {
        x: '20rem'
    },
    visible: {
        x: 0,
        transition: {
            type: 'linear',
            duration: 0.5,
            delay: 0.5
        }
    },
    exit: {
        x: '20rem',
        transition: {
            ease: 'easeIn', 
            duration: 0.8
        }
    }
}

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
            variants={SidePanelVariant}
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
