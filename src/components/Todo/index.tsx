import '../../assets/css/Todo/todo.css'

import { motion } from 'framer-motion'
import Viewer from './components/viewer'
import ActivityPanel from './components/panel'
import TodoTree from './components/tree'

const Todo = () => {
    return (
        <div className="todo-cont">
            <div className="todo-main">
                <TodoTree />
                <Viewer />
                <ActivityPanel />
            </div>
        </div>
    )
}

export default Todo
