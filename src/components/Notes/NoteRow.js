import { FaPlus } from 'react-icons/fa'
import handles from '../../assets/img/handles.svg'
import { findParentBySelector, useDraggableHook } from '../../assets/js/draggable.js'

import { useEffect, useState, memo, useRef } from 'react'
import { NOTE_ACTION, useUpdateNote } from './NoteContext'

// import ContentEditable from 'react-contenteditable'
import NoteContentEditable from './ContentEditable' 

const NoteRow = (({ indx, noteData, parents, }) => {
    console.log(`rendering note ${noteData.id}`)
    //useWhyDidYouUpdate(`NoteRow ${noteData.id}`, { indx, noteData, parents })

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


    const keyDown = (e) => {
        console.log(`current indx is ${childIndx.current}`)
        let parentNote = findParentBySelector(e.target, '.note-row')

        switch (e.keyCode) {
            // Enter key
            case 13:
                console.log('enter key pressed')
                e.preventDefault()
                let addNoteIndx = noteData.insideNote ? 0 : childIndx.current + 1
                let addNotePath = noteData.insideNote 
                                  ? (parents ? [...parents, note.id] : [note.id]) 
                                  : (parents ? [...parents] : [])
                updateRootNote({ type: NOTE_ACTION.ADD_NOTE, data:{
                    indx: addNoteIndx,
                    path: addNotePath
                } })
                break;
            // Backspace
            case 8:
                e.preventDefault();
                break;
            // Tab Key
            case 9:
                e.preventDefault();
                break;
            // Up arrow
            case 38:
                e.preventDefault();
                if (parentNote.previousSibling) parentNote.previousSibling.querySelector('.note-content').focus()
                break;
            // Down Arrow
            case 40:
                e.preventDefault();
                if (parentNote.nextSibling) parentNote.nextSibling.querySelector('.note-content').focus()
                break;
            default:
                
        }
    }
    // Handle Text changes inside the Note
    const onTextChange = (newNoteText) => {
        console.log('updating text')
        updateRootNote({ type: NOTE_ACTION.UPDATE_NOTE, data: {
            id: note.id,
            path: parents ? [...parents, note.id] : [note.id],
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
             note={note.id}
             className="note-row"
             onMouseOver={onOver}
             onMouseOut={onOut}>

            <div className="note-cont">
                <div className="controls">
                    <div className="control">
                        <FaPlus className="add-icon"
                                // onClick={(e) => onAdd(note.id, indx)} 
                                />
                    </div>
                    <div className="control">
                        <img className="handles-icon" src={handles}
                             onMouseDown={mouseDown}
                             alt="handles"/>
                    </div>
                </div>

                {/* <ContentEditable
                    className="note-content"
                    data-placeholder="type '/' for commands"
                    html={note.content} 
                    onChange={e => onTextChange(e.target.value)}
                    onKeyDown={(e) => keyDown(e, indx)}
                    theIndx={childIndx.current} /> */}
                <NoteContentEditable 
                    text={note.content}
                    onTextChange={onTextChange}
                    keyDown={keyDown} />

                {note.insideNote && (
                    <div className="child-note-cont">
                        {note.insideNote.map((childNote, childNoteIndx) => (
                            <NoteRow key={childNote.id}
                                    indx={childNoteIndx}
                                    noteData={childNote}
                                    parents={parents ? [...parents, note.id] : [note.id]} />
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
            if (Object.keys(changesObj).length) console.log("[why-did-you-update]", name, changesObj);
            
        }
  
        // Finally update previousProps with current props for next hook call
        previousProps.current = props;
    });
}




export default NoteRow
