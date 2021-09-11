import '../../assets/css/Todo/todo.css'

import { motion } from 'framer-motion'
import { TodoVariants } from '../../AnimationVariants'

import Viewer from './components/viewer'
import ActivityPanel from './components/panel'
import TodoTree from './components/tree'

const Todo = () => {
    return (
        <div className="todo-cont">
            <motion.div className="todo-main"
                variants={TodoVariants.viewer}
                initial='hidden'
                animate='visible'
                exit='exit'
            >
                <TodoTree />
                <Viewer />
                <ActivityPanel />
            </motion.div>
        </div>
    )
}

export default Todo
