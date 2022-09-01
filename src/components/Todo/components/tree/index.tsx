import React from 'react'
import { motion } from 'framer-motion'
import { TodoVariants } from '../../../../AnimationVariants'
import { NavLink as Link } from 'react-router-dom'


interface TodoTreeProps {
    url: string
}
const TodoTree: React.FC<TodoTreeProps> = ({ url }) => {
    return (
        <motion.div className="todo-tree"
            variants={TodoVariants.tree}
            initial='hidden'
            animate='visible'
            exit='exit'
        >
            <div className="task-shortcuts">
                <div className="shortcut-cont">
                    <Link className="shortcut-links" activeClassName="active" to={`${url}/inbox`}>Inbox</Link>
                </div>
                <div className="shortcut-cont">
                    <Link className="shortcut-links" activeClassName="active" to={`${url}/today`}>Today</Link>
                </div>
                <div className="shortcut-cont">
                    <Link className="shortcut-links" activeClassName="active" to={`${url}/week`}>7 Days</Link>
                </div>
                <div className="shortcut-cont">
                    <Link className="shortcut-links" activeClassName="active" to={`${url}/all`}>All Tasks</Link>
                </div>
            </div>

            <div className="projects-cont">
                <h4>Projects</h4>
            </div>
        </motion.div>
    )
}

export default TodoTree
