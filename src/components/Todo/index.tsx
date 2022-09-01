import '../../assets/css/Todo/todo.css'

import { AnimatePresence, motion } from 'framer-motion'
import Viewer from './components/viewer'
import ActivityPanel from './components/panel'
import TodoTree from './components/tree'
import { useRouteMatch, Switch, Redirect, useLocation, Route } from 'react-router'

const Todo = () => {
    const { path, url } = useRouteMatch()
    return (
        <div className="todo-cont">
            <div className="todo-main">
                <>
                    <TodoTree url={url} />
                    <Viewer key="viewer" path={path} url={url} />
                    <ActivityPanel key="activity-panel" />
                </>
            </div>
        </div>
    )
}

export default Todo
