import { FaPlus } from 'react-icons/fa'
import handles from '../../assets/img/handles.svg'
import { findParentBySelector, useDraggableHook } from '../../assets/js/draggable.js'
import { getCaretPosition, placeCaretAtEnd, setCaret } from '../../assets/js/editable.js'

import { useEffect, memo, useRef } from 'react'
import { NOTE_ACTION, useUpdateNote } from './NoteContext'

// import ContentEditable from 'react-contenteditable'
import NoteContentEditable from './ContentEditable' 

const NoteRow = memo(({ indx, noteData, parents, path }) => {
    // useWhyDidYouUpdate(`NoteRow ${noteData.id}`, { indx, noteData, parents, path })

    const note = noteData
    const childIndx = useRef(indx)
    const updateRootNote = useUpdateNote()

    useEffect(() => {
        childIndx.current = indx
    }, [indx])

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


    const keyDown = (e, noteIndx, currPath, noteContent) => {
        let NoteRow = findParentBySelector(e.target, '.note-row')
        let contentEditableEl = document.getElementById(`note-${noteData.id}`).querySelector('.note-content')

        switch (e.keyCode) {
            // Enter key
            case 13:
                e.preventDefault()
                let addNoteIndx = noteData.insideNote ? 0 : noteIndx + 1
                updateRootNote({ type: NOTE_ACTION.ADD_NOTE, data:{
                    indx: addNoteIndx,
                    path: noteData.insideNote ? [...currPath, 'insideNote'] : currPath.slice(0, -1)
                } })
                break;
            // Backspace
            case 8: {
                if (getCaretPosition(contentEditableEl) !== 0) return
                e.preventDefault();
                let isFirstChild = (document.getElementById(`note-${noteData.id}`).previousSibling ? false : true)
                let isLastChild = (document.getElementById(`note-${noteData.id}`).nextSibling ? false : true)

                if (isFirstChild && !parents) return

                let noteContentEl = isFirstChild
                    ? (document.getElementById(`note-${parents[parents.length-1]}`)).querySelector('.note-content')
                    : [].slice.call(document.getElementById(`note-${noteData.id}`).previousSibling.querySelectorAll('.note-content')).pop()
                
                let NoteTextLength = noteContentEl.textContent.length


                updateRootNote({ type: NOTE_ACTION.REMOVE_NOTE, data:{
                    indx: noteIndx,
                    path: currPath.slice(0, -1),
                    noteText: noteContent,
                    hasChildren: noteData.insideNote ? true : false,
                    isLastChild: isLastChild,
                    isFirstChild: isFirstChild
                } })
            
                setTimeout(() => {
                    if (isLastChild && parents) {
                        noteContentEl = document.getElementById(`note-${noteData.id}`).querySelector('.note-content')
                        NoteTextLength = 0
                    }
                    setCaret(noteContentEl, NoteTextLength)
                    noteContentEl.focus()
                }, 0);
                break;
            }
            // Tab Key
            case 9: {
                e.preventDefault();
                let isFirstChild = (document.getElementById(`note-${noteData.id}`).previousSibling ? false : true)
                if (getCaretPosition(contentEditableEl) !== 0 || isFirstChild) return
                updateRootNote({ type: NOTE_ACTION.MAKE_CHILD_NOTE, data:{
                    indx: noteIndx,
                    contPath: currPath.slice(0, -1)

                } })

                setTimeout(() => {
                    let NoteEl = document.getElementById(`note-${noteData.id}`).querySelector('.note-content')
                    setCaret(NoteEl, 0)
                    NoteEl.focus()
                }, 0);
                break;
            }
            // Up arrow
            case 38:
                e.preventDefault();
                if (NoteRow.previousSibling) {
                    let prevNote = NoteRow.previousSibling
                    while(prevNote.querySelector('.child-note-cont')) prevNote = prevNote.querySelector('.child-note-cont').lastChild
                    prevNote.querySelector('.note-content').focus()
                } else if (NoteRow.parentNode.classList.contains('child-note-cont')) {
                    let parentNote = findParentBySelector(NoteRow, '.note-row')
                    parentNote.querySelector('.note-content').focus()
                }
                break;
            // Down Arrow
            case 40:
                e.preventDefault();
                if (NoteRow.querySelector('.child-note-cont')) NoteRow.querySelector('.child-note-cont').firstChild.querySelector('.note-content').focus()
                else if (NoteRow.nextSibling) NoteRow.nextSibling.querySelector('.note-content').focus()
                else {
                    let grandParentNextSibling = NoteRow
                    let foundNextSibling = false
                    while (findParentBySelector(grandParentNextSibling, '.note-row') && !foundNextSibling) {
                        grandParentNextSibling = findParentBySelector(grandParentNextSibling, '.note-row')
                        if (grandParentNextSibling.nextSibling) {
                            foundNextSibling = true
                            grandParentNextSibling.nextSibling.querySelector('.note-content').focus()
                        }
                    } 
                }
                break;

            case 80:
                console.log(`${noteData.id} path`, currPath)
                break;
            default:
                
        }
    }
    // Handle Text changes inside the Note
    const onTextChange = (newNoteText, notePath) => {
        updateRootNote({ type: NOTE_ACTION.UPDATE_NOTE, data: {
            id: note.id,
            path: [...notePath], // parents ? [...parents, note.id] : [note.id],
            property: 'content',
            newValue: newNoteText 
        } })
    }

    const onArrangementChange = (parentCont, insertIndx) => {
        console.log(`insert on index ${insertIndx} of`)
        console.log(parentCont)

        updateRootNote({ type: NOTE_ACTION.ADD_NOTE, data:{
            indx: insertIndx,
            path: parents ? [...parents, note.id] : [note.id],
            insertNoteData: noteData 
        } })
    }
    
    const mouseDown = useDraggableHook(noteData.id, onArrangementChange)

    return (
        <div id={`note-${note.id}`}
             data-testid={`note-row-${note.id}`}
             note={note.id}
             className="note-row"
             onMouseOver={onOver}
             onMouseOut={onOut}>

            <div className="note-cont">
                <div className="controls">
                    <div className="control">
                        <FaPlus className="add-icon"
                                data-testid={`note-add-${note.id}`}
                                onClick={() => {console.log(`testing `)}} 
                                />
                    </div>
                    <div className="control">
                        <img className="handles-icon" src={handles}
                             onMouseDown={mouseDown}
                             alt="handles"/>
                    </div>
                </div>

                <NoteContentEditable 
                    text={note.content}
                    noteId={note.id}
                    onTextChange={onTextChange}
                    keyDown={keyDown}
                    path={path}
                    indx={indx} />

                {note.insideNote && (
                    <div className="child-note-cont" data-testid={`note-child-cont-${note.id}`}>
                        {note.insideNote.map((childNote, childNoteIndx) => (
                            <NoteRow key={childNote.id}
                                    indx={childNoteIndx}
                                    noteData={childNote}
                                    parents={parents ? [...parents, note.id] : [note.id]}
                                    path={[...path, 'insideNote', childNoteIndx]} />
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
})

function useWhyDidYouUpdate(name, props) {
    // Get a mutable ref object where we can store props ...
    // ... for comparison next time this hook runs.
    const previousProps = useRef();
  
    useEffect(() => {
        if (previousProps.current) {
            // Get all keys from previous and current props
            const allKeys = Object.keys({ ...previousProps.current, ...props });
            // Use this object to keep track of changed props
            const changesObj = {};
            // Iterate through keys
            allKeys.forEach((key) => {
                // If previous is different from current
                if (previousProps.current[key] !== props[key]) {
                    // Add to changesObj
                    changesObj[key] = {
                        from: previousProps.current[key],
                        to: props[key],
                    };
                }
            });
  
            // If changesObj not empty then output to console
            if (Object.keys(changesObj).length) {
                console.log(document.getElementById(`note-${props.noteData.id}`))
                console.log("[why-did-you-update]", name, changesObj)
            }
            
        } else {
            console.log(`Note ${props.noteData.id} initial render`)
        }
  
        // Finally update previousProps with current props for next hook call
        previousProps.current = props;
    });
}




export default NoteRow
