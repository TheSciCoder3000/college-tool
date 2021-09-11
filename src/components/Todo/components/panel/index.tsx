import { motion } from 'framer-motion'
import { TodoVariants } from '../../../../AnimationVariants'

const ActivityPanel = () => {
    return (
        <motion.div className="todo-panel"
            variants={TodoVariants.activity}
            initial='hidden'
            animate='visible'
            exit='exit'
        >
            todo panel
        </motion.div>
    )
}

export default ActivityPanel
