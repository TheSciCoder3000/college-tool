import React from 'react'
import { motion } from 'framer-motion'
import { Route, Switch, Redirect, useLocation } from "react-router-dom";
import { TodoVariants } from '../../../../AnimationVariants'

interface ViewerProps {
    path: string
    url: string
}


const Viewer: React.FC<ViewerProps> = ({ path, url }) => {
    const location = useLocation()
    return (
        <motion.div className="todo-viewer"
            variants={TodoVariants.viewer}
            initial='hidden'
            animate='visible'
            exit='exit'
        >
            <Switch location={location} key={location.pathname}>
                <Route exact path="/Todo">
                    <Redirect to="/Todo/inbox" />
                </Route>
                <Route path={`${path}/inbox`}>
                    inbox
                </Route>
                <Route path={`${path}/today`}>
                    today
                </Route>
                <Route path={`${path}/week`}>
                    7 days
                </Route>
                <Route path={`${path}/all`}>
                    all tasks
                </Route>
            </Switch>
        </motion.div>
    )
}

export default Viewer
