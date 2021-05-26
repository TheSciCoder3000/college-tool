import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Schedule = ({ sched, onSwitchSched }) => {
    return (
        <div className="schedule">
            <div className="sched-name">
                <h2>{sched.name}</h2>
            </div>
            <div className="row">
                <button className="sched-prev">
                    <FontAwesomeIcon icon="chevron-left" />
                </button>
                <div className="sched-time">
                    <h4>{sched.time}</h4>
                </div>
                <button className="sched-next">
                    <FontAwesomeIcon icon="chevron-right" />
                </button>
            </div>
        </div>
    )
}

export default Schedule
