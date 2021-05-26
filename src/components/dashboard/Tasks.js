import '../../assets/css/dashboard/Task.css'
import Task from './Task'

const Tasks = ({ tasks }) => {
    return (
        <>
            <div className="task-header">
                <h2>Task</h2>
            </div>
            <div className="tasks-container">
                {tasks.map((task) => <Task key={task.id} task={task}/>)}
            </div>
        </>
    )
}

export default Tasks
