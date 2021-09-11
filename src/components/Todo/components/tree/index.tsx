import { motion } from 'framer-motion'
import { TodoVariants } from '../../../../AnimationVariants'

const TodoTree = () => {
    return (
        <motion.div className="todo-tree"
            variants={TodoVariants.tree}
            initial='hidden'
            animate='visible'
            exit='exit'
        >
            todo tree
        </motion.div>
    )
}

export default TodoTree
