import { FaPlus } from 'react-icons/fa'
import { draggableGhostClone, followCursor, 
         displayIndicator, findParentBySelector, 
         getChildContCount, noteChildAnalysis } from '../../assets/js/draggable.js'
import { placeCaretAtEnd, getLastOfLastNoteChild, getCaretPosition } from '../../assets/js/editable.js'
import handles from '../../assets/img/handles.svg'
import { useEffect, useState, useMemo, memo } from 'react'

const NoteRow = ({ note, indx, siblings, parents, onTaskUpdate, onArrange, onAdd, onDelete, onMoveBack }) => {
    const NoteData = useMemo(() => {
        return {
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
    }, [siblings])
    useEffect(() => {
        console.log(`rendering ${note.id}`)
        
    }, [NoteData])
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
        let parentNote = findParentBySelector(e.target, '.note-row')


        // Enter key
        if (e.keyCode == 13) {
            e.preventDefault()              // prevent creating new line
            //onAdd(note.id, indx)                        // Add new note row

            // Initialize new note data
            let newNoteData = {
                id: Math.random().toString(16).slice(-8),
                content: '',
                noteBefore: null,
                insideNote: null
            }
            if (note.insideNote) {                                                  // if note contains child notes
                let newInsideNote = [...note.insideNote]                                 // Create copy of insideNote data 
                newInsideNote.splice(0, 0, newNoteData)                                  // Insert new note as first child
                newInsideNote[1].noteBefore = newNoteData.id                             // Change noteBefore property of previous first child
                onTaskUpdate(indx, {...note, insideNote: newInsideNote})                 // Upsend the edited note data to the root container
            } else {                                                                // else
                newNoteData.noteBefore = note.id                                        // Re-assign newNoteData.noteBefore to note.id
                onAdd(indx, newNoteData)                                                // Send signal to notecontainer to insert new note
            }


            // focus on newly created note
            setTimeout(() => {
                document.getElementById(`note-${newNoteData.id}`).querySelector('.note-content').focus()
            }, 0);
        }
        // Backspace key
        if (e.keyCode == 8) {
            if (getCaretPosition(NoteData.note.el.querySelector('.note-content')) !== 0) return 
            e.preventDefault()                                                           // prevent removing the char in previous note row
            // parentNote.previousSibling.querySelector('.note-content').focus()            // focus on previous note row
            // placeCaretAtEnd(parentNote.previousSibling.querySelector('.note-content'))   // place the charet on the end of the text
            // onDelete(note.id)                                                            // remove the current note row
            
            if (parents && !NoteData.nextNote) {
                console.log('move child back')
                onMoveBack(note)
                // Moves child note once to the left
            } else {
                let noteText = note.content        // copy text
                if (note.insideNote) {
                    console.log('move child back')
                    console.log(NoteData.note.el.querySelectorAll('.note-row'))
                }
                

                // Removes note row
            }
        }


        // Tab key
        if (e.keyCode == 9) {
            e.preventDefault()                      // prevent focusing on other inputs

            let childCont = document.createElement('DIV')
            childCont.classList.add('child-note-cont')
            parentNote.previousSibling.append(childCont)
            parentNote.previousSibling.querySelector('.child-note-cont').appendChild(parentNote)
        }


        // Up arrow key
        if (e.keyCode == 38 && parentNote.previousSibling) parentNote.previousSibling.querySelector('.note-content').focus()
        // Down arrow key
        if (e.keyCode == 40 && parentNote.nextSibling) parentNote.nextSibling.querySelector('.note-content').focus()
    }

    // Drag Event handlers
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

        // Cancel arrangement tracking if cursor inside task component
        let bbx = NoteData.note.el.getBoundingClientRect()
        if(e.clientY > bbx.top && e.clientY < bbx.bottom) {
            if (document.querySelector('.indicator-container')) document.querySelector('.indicator-container').remove()
            return
        }

        // Detect which component it's closest to
        const taskContainer = document.querySelector('.doc-page')
        var [afterElement, indicatorStyle] = getDragAfterElement(taskContainer, e.clientX, e.clientY)
        // console.log(afterElement)

        // Display insert indicator
        if (document.querySelector('.indicator-container') 
            && afterElement.element == document.querySelector('.indicator-container').nextSibling 
            && document.querySelectorAll('.extra-child-indicator').length == indicatorStyle.childPos) return
        displayIndicator(afterElement.element ? afterElement.element.parentNode : null, afterElement, indicatorStyle)
    }

    const getDragAfterElement = (container, x, y) => {
        // select all task components inside the container except the component that is currently being dragged
        var draggebleElements = [...container.querySelectorAll('.note-row:not(.dragging)')]

        // Filter child notes of dragg
        draggebleElements = draggebleElements.filter((el) => {
            let parent = findParentBySelector(el, '.note-row')
            return parent ? !(parent.classList.contains('dragging')) : true
        })
        console.log('start')

        // Compute closest component based on offset
        let AfterElementData = draggebleElements.reduce((closest, child) => {
            var box = child.getBoundingClientRect()
            const offset = y - box.top
            const x_offset = ((box.left*(1.05)) - x)
            // console.log({element: child, offset: x_offset})

            // skip child if not within x range
            if (x_offset < 0) {
                let indiType = 'horizontal'
                // console.log({child: child, offset: offset, closest: closest.offset})
                if (Math.abs(offset) < closest.offset && y < box.bottom) {
                    return { offset: offset, element: child, type: indiType }
                } else {
                    return {...closest, type: indiType}
                }    
            } else {
                let indiType = 'vertical'
                box = child.getBoundingClientRect()
                if(y > box.top && y < box.bottom && !findParentBySelector(child, '.note-row')) return {offset: x_offset, element: child, type: indiType}
                return {...closest, type: indiType}
            }

        }, { offset: Number.POSITIVE_INFINITY, element: null, type: 'horizontal' })

        let indicatorStyle = {childPos: 0}
        if (AfterElementData.element) {
            if (!AfterElementData.element.previousSibling) return [AfterElementData, {childPos: 0}]

            let prevAfterElement = AfterElementData.element.previousSibling.classList.contains('indicator-container') 
                                ? AfterElementData.element.previousSibling.previousSibling
                                : AfterElementData.element.previousSibling
            indicatorStyle = noteChildAnalysis(prevAfterElement, x)
        } else {
            console.log('last child')
            let lastNoteElement = container.lastChild
            if (lastNoteElement == document.querySelector('.indicator-container')) {
                lastNoteElement = lastNoteElement.previousSibling
            } else if (lastNoteElement == NoteData.note.el) {
                lastNoteElement = lastNoteElement.previousSibling.previousSibling
            }
            indicatorStyle = noteChildAnalysis(lastNoteElement, x)
            console.log(lastNoteElement)
        }
        
        return [AfterElementData, indicatorStyle]
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

        if (document.querySelectorAll('.extra-child-indicator').length > 0) {           // if extra indicator > 0
            let parentIndicator = findParentBySelector(document.querySelector('.extra-child-indicator'), '.indicator-container')
            let childPos = document.querySelectorAll('.extra-child-indicator').length - 1
            let NoteContainer = parentIndicator.previousSibling.querySelector('.child-note-cont')

            // select child-note-cont of last child [childPos] number of times
            for (let i = 0; i < childPos; i++) NoteContainer = NoteContainer.lastChild.querySelector('.child-note-cont')
            
            // Append the note the current child-note-cont
            NoteContainer.appendChild(mainElmnt)
            document.querySelector('.indicator-container').remove()                     // Remove the indicator
        } else if (document.querySelector('.indicator-container')) document.querySelector('.indicator-container').replaceWith(mainElmnt)

        
        // Update server
        // If main note
        // else
    }

    // Note Event Handlers
    const insideNoteAdd = (noteIndx, newNoteData) => {
        let newInsideNote = [...note.insideNote]
        newInsideNote.splice(noteIndx+1, 0, newNoteData)
        if (newInsideNote[noteIndx+2]) newInsideNote[noteIndx+2].noteBefore = newNoteData.id
        onTaskUpdate(indx, {...note, insideNote: newInsideNote})
    }

    const taskUpdate = (childTaskIndx, taskDict) => {
        let newInsideNote = [...note.insideNote]
        newInsideNote[childTaskIndx] = taskDict
        onTaskUpdate(indx, {...note, insideNote: newInsideNote})
    }

    const moveBackNote = (noteData) => {
        let newInsideNote = [...note.insideNote]
        newInsideNote.pop()
        onAdd(indx, noteData) // request note container to push noteData
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
                        {note.insideNote.map((childNote, indx) => (
                            <NoteRow key={childNote.id}
                                     indx={indx}
                                     note={childNote}
                                     siblings={{
                                         prev: childNote.insideNote ? childNote.insideNote[indx-1] : null,
                                         next: childNote.insideNote ? childNote.insideNote[indx+1] : null
                                     }}
                                     parents={parents ? [...parents, note.id] : [note.id]}
                                     onTaskUpdate={taskUpdate}
                                     onArrange={onArrange}
                                     onAdd={insideNoteAdd}
                                     onDelete={onDelete}
                                     onMoveBack={moveBackNote} />
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}

NoteRow.defaultProps = {
    parents: null
}

export default memo(NoteRow)
