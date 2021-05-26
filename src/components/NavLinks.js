import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const navLinks = ({icon, text}) => {
    return (
        <div className="Nav-Link">
            <FontAwesomeIcon className="Nav-icon" icon={icon} />
            <p>{text}</p>
        </div>
    )
}

export default navLinks

