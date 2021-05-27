import { FaPlus } from 'react-icons/fa'
import { draggableGhostClone, followCursor, displayIndicator, findParentBySelector } from '../../assets/js/draggable.js'
import handles from '../../assets/img/handles.svg'

const NoteRow = ({ note, onDelete, onArrange, onAdd }) => {
    // Initialize ghost pos dictionary
    var pos = {
        pos1: 0,
        pos2: 0,
        pos3: 0,
        pos4: 0,
    }


    // Note row style
    const onOver = (e) => {

        var row = null
        if (e.target.classList.contains('note-row')) {
            row = e.target
        } else {
            row = findParentBySelector(e.target, '.note-row')
        }
        row.querySelector('.controls').style.display = "flex"
    }

    const onOut = (e) => {
        var row = null
        if (e.target.classList.contains('note-row')) {
            row = e.target
        } else {
            row = findParentBySelector(e.target, '.note-row')
        }
        row.querySelector('.controls').style.display = "none"
    } 


    // Event handlers
    const mouseDown = (e) => {
        draggableGhostClone(e, document.getElementById(`note-${note.id}`), pos)
        document.onmousemove = dragMouse
        document.onmouseup = mouseUp
    }

    const dragMouse = (e) => {
        e = e || window.event
        e.preventDefault()

        // Move the ghost task component to follow cursor/mouse
        followCursor(e, pos, document.getElementById(`note-${note.id}-clone`))

        // Detect which component it's closest to
        const taskContainer = document.querySelector('.doc-page')
        var afterElement = getDragAfterElement(taskContainer, e.clientY)

        // Display insert indicator
        displayIndicator(taskContainer, afterElement)
    }

    const getDragAfterElement = (container, y) => {
        // select all task components inside the container except the component that is currently being dragged
        const draggebleElements = [...container.querySelectorAll('.note-row:not(.dragging)')]

        // Compute closest component based on offset
        return draggebleElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect()
            const offset = y - box.top - box.height/2
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child }
            } else {
                return closest
            }
        }, { offset: Number.NEGATIVE_INFINITY })
    }

    const mouseUp = (e) => {
        var elmnt = document.getElementById(`note-${note.id}-clone`)

        // Remove Event Handlers
        document.onmousemove = null
        document.onmouseup = null

        // Remove the ghost task component
        elmnt.parentNode.removeChild(elmnt)

        // Reset class list of the dragged component
        var mainElmnt = document.getElementById(`note-${note.id}`)
        mainElmnt.classList.remove('dragging')

        // Get sibling data
        var nextSibling = {
            task: {
                element: mainElmnt.nextSibling,
                id: mainElmnt.nextSibling ? parseInt(mainElmnt.nextSibling.getAttribute('note')) : null
            },
            prev: {
                element: mainElmnt.previousSibling,
                id: mainElmnt.previousSibling ? parseInt(mainElmnt.previousSibling.getAttribute('note')) : null
            }
        }

        // Insert the dragged element 
        if (document.querySelector('.indicator-container')) document.querySelector('.indicator-container').replaceWith(mainElmnt)

        // Arrange json server task
        onArrange(note.id, nextSibling)

    }



    
    return (
        <div id={`note-${note.id}`}
             note={note.id}
             className="note-row"
             onMouseOver={onOver}
             onMouseOut={onOut}>

            <div className="note-cont">
                <div className="controls">
                    <div className="control">
                        <FaPlus className="add-icon" 
                                onClick={onAdd} />
                    </div>
                    <div className="control">
                        <img className="handles-icon" src={handles}
                             onMouseDown={mouseDown}
                             alt="handles"/>
                    </div>
                </div>

                <div className="note-content"
                    contentEditable="true"
                    suppressContentEditableWarning={true}
                    spellCheck="true"
                    placeholder="Type '/' for commands">{
                        (!note.content || note.content == '') ? "Type '/' for commands" : note.content
                    }</div>
            </div>

        </div>
    )
}

export default NoteRow
