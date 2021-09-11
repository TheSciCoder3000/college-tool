import { motion } from 'framer-motion'
import { TodoVariants } from '../../../../AnimationVariants'

const Viewer = () => {
    return (
        <motion.div className="todo-viewer"
            variants={TodoVariants.viewer}
            initial='hidden'
            animate='visible'
            exit='exit'
        >
            task viewer
        </motion.div>
    )
}

export default Viewer
