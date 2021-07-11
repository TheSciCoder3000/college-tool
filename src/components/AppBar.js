import Links from './NavLinks'
import '../assets/css/navbar.css'
import { NavLink as Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AppBarVariants } from '../AnimationVariants'

const AppBar = () => {
    return (
        <motion.div className="Nav-bar"
            variants={AppBarVariants.NavBar}
            initial='hidden'
            animate='visible'
            exit='exit'
        >
            <Link className="router-link" activeClassName="selected-link" to="/dashboard"><Links icon="tachometer-alt" text="Dashboard"/></Link>
            <Link className="router-link" activeClassName="selected-link" to="/Notes"><Links icon="book-open" text="Notes"/></Link>
            <Link className="router-link" activeClassName="selected-link" to="/Calendar"><Links icon="calendar-check" text="Calendar"/></Link>
        </motion.div>
    )
}

export default AppBar



