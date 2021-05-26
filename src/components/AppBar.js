import Links from './NavLinks'
import '../assets/css/navbar.css'
import { NavLink as Link } from 'react-router-dom'

const AppBar = () => {
    return (
        <div className="Nav-bar">
            <Link className="router-link" activeClassName="selected-link" to="/dashboard"><Links icon="tachometer-alt" text="Dashboard"/></Link>
            <Link className="router-link" activeClassName="selected-link" to="/Notes"><Links icon="book-open" text="Notes"/></Link>
            <Link className="router-link" activeClassName="selected-link" to="/Calendar"><Links icon="calendar-check" text="Calendar"/></Link>
        </div>
    )
}

export default AppBar



