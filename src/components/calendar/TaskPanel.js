import '../../assets/css/calendar/TaskPanel.css'
import { motion } from 'framer-motion'

const taskPanelVariant = {
    hidden: {
        x: '100vw'
    }, 
    visible: {
        x: 0,
        transition: {
            ease: 'easeOut',
            duration: 0.8
        }
    },
    exit: {
        x: '100vw',
        transition: {
            ease: 'easeIn'
        }
    }
}

const TaskPanel = () => {
    return (
        <motion.div className="task-panel"
            variants={taskPanelVariant}
            initial='hidden'
            animate='visible'
            exit='exit'
        >
            <h2>Task Panel</h2>
        </motion.div>
    )
}

export default TaskPanel
