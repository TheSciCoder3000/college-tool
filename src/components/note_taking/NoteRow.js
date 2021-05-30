import { FaPlus } from 'react-icons/fa'
import { draggableGhostClone, followCursor, displayIndicator, findParentBySelector } from '../../assets/js/draggable.js'
import { placeCaretAtEnd } from '../../assets/js/editable.js'
import handles from '../../assets/img/handles.svg'
import { useEffect } from 'react'

const NoteRow = ({ note, indx, siblings, onArrange, onAdd, onDelete }) => {
    console.log(note.insideNote)
    var NoteData = {}
    useEffect(() => {
        console.log('updating')
        NoteData = {
            prevNote: siblings.prev ? {
                el: document.getElementById(`note-${siblings.prev.id}`),
                id: siblings.prev.id
            } : null,
            note: {
                el: document.getElementById(`note-${note.id}`),
                id: note.id
            },
            nextNote: siblings.next ? {
                el: document.getElementById(`note-${siblings.next.id}`),
                id: siblings.next.id
            } : null
        }
    })
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

    const keyDown = (e) => {
        console.log(NoteData)
        let parentNote = findParentBySelector(e.target, '.note-row')

        
        // Enter key
        if (e.keyCode == 13) {
            e.preventDefault()              // prevent creating new line
            onAdd(note.id, indx)                        // Add new note row
            // setTimeout(() => {
            //     findParentBySelector(e.target, '.note-row').nextSibling.querySelector('.note-content').focus()
            // }, 0);
        }
        // Backspace key
        if (e.keyCode == 8 && e.target.innerHTML == '' && findParentBySelector(e.target, '.note-row').previousSibling) {
            e.preventDefault()                                                           // prevent removing the char in previous note row
            parentNote.previousSibling.querySelector('.note-content').focus()            // focus on previous note row
            placeCaretAtEnd(parentNote.previousSibling.querySelector('.note-content'))   // place the charet on the end of the text
            onDelete(note.id)                                                                  // remove the current note row
        }


        // Tab key
        if (e.keyCode == 9) {
            e.preventDefault()                      // prevent focusing on other inputs

            let childCont = document.createElement('DIV')
            childCont.classList.add('note-children')
            parentNote.previousSibling.append(childCont)
            parentNote.previousSibling.querySelector('.note-children').appendChild(parentNote)
            console.log(parentNote)
        }


        // Up arrow key
        if (e.keyCode == 38 && parentNote.previousSibling) parentNote.previousSibling.querySelector('.note-content').focus()
        // Down arrow key
        if (e.keyCode == 40 && parentNote.nextSibling) parentNote.nextSibling.querySelector('.note-content').focus() 
    }

    // Event handlers
    const mouseDown = (e) => {
        draggableGhostClone(e, NoteData.note.el, pos)
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
        console.log(afterElement)
        displayIndicator(afterElement.element ? afterElement.element.parentNode : null, afterElement)
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
        }, { offset: Number.NEGATIVE_INFINITY, element: null })
    }

    const mouseUp = (e) => {
        var elmnt = document.getElementById(`note-${note.id}-clone`)

        // Remove Event Handlers
        document.onmousemove = null
        document.onmouseup = null

        // Remove the ghost task component
        elmnt.parentNode.removeChild(elmnt)

        // Reset class list of the dragged component
        var mainElmnt = NoteData.note.el
        mainElmnt.classList.remove('dragging')

        // initialize the updated data of the next sibling note
        var nextSibling = siblings.next ? {...siblings.next, noteBefore: siblings.prev ? siblings.prev.id : null} : null

        // Insert the dragged element 
        if (document.querySelector('.indicator-container')) document.querySelector('.indicator-container').replaceWith(mainElmnt)

        // Arrange json server task
        onArrange(note.id, nextSibling, NoteData)
    }


    const renderNote = () => {
        
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
                                onClick={(e) => onAdd(note.id, indx)} />
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
                    onKeyDown={keyDown}
                    data-placeholder="type '/' for commands">{
                        note.content
                    }
                </div>

                {note.insideNote && (
                    <div className="child-note-cont">
                        {note.insideNote.map((note, indx) => (
                            <NoteRow key={note.id}
                                     indx={indx}
                                     note={note}
                                     siblings={{
                                         prev: note.insideNote ? note.insideNote[indx-1] : null,
                                         next: note.insideNote ? note.insideNote[indx+1] : null
                                     }} 
                                     onArrange={onArrange}
                                     onAdd={onAdd}
                                     onDelete={onDelete} />
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}

export default NoteRow
