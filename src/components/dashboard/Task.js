import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Task = ({ task }) => {
    return (
        <div className="task-item"
             id={`task-${task.id}`}>
            <span className="task-name">{ task.name }</span>
            <button className="task-more-btn">
                <FontAwesomeIcon icon="ellipsis-v"/>
            </button>
        </div>
    )
}

export default Task
