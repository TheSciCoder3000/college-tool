import { FaPlus } from 'react-icons/fa'
import handles from '../../assets/img/handles.svg'
import { findParentBySelector, useDraggableHook } from '../../assets/js/draggable.js'
import { extractHTMLContentFromCaretToEnd, extractHTMLContentFromStartToCaret, getCurrentCursorPosition, setCurrentCursorPosition } from '../../assets/js/editable.js'

import { useEffect, memo, useRef, createContext, useContext, useState } from 'react'
import { NOTE_ACTION, useUpdateNote } from './NoteContext'

// import ContentEditable from 'react-contenteditable'
import NoteContentEditable from './ContentEditable' 

export const noteDataContext = createContext()

const NoteRow = memo(({ indx, noteData, parents, docContext, path }) => {
    // useWhyDidYouUpdate(`NoteRow ${noteData.id}`, { indx, noteData, parents, docContext, path })

    const note = noteData
    const childIndx = useRef(indx)
    const updateRootNote = useUpdateNote()

    const [rowTextContent, setRowTextContent] = useState(noteData.content)
    useEffect(() => setRowTextContent(noteData.content), [noteData.content])

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


    const keyDown = (e, noteIndx, currPath, noteContent, keyNoteData) => {
        let NoteRow = findParentBySelector(e.target, '.note-row')
        let contentEditableEl = document.getElementById(`note-${keyNoteData.id}`).querySelector('.note-content')

        switch (e.keyCode) {
            // Enter key
            case 13:
                e.preventDefault()
                let currentCaretPos = getCurrentCursorPosition(`note-content-${keyNoteData.id}`)

                let extractDiv
                let reviseContent

                try {
                    extractDiv = extractHTMLContentFromCaretToEnd(contentEditableEl, currentCaretPos)
                    console.log('extract div', extractDiv)
                    reviseContent = extractHTMLContentFromStartToCaret(contentEditableEl, currentCaretPos)
                } catch(err) {
                    console.error(err)
                    extractDiv = ''
                    reviseContent = ''
                }

                console.log(reviseContent)
                console.log(extractDiv)
                onTextChange(reviseContent, currPath)
                let addNoteIndx = keyNoteData.insideNote ? 0 : noteIndx + 1
                updateRootNote({ type: NOTE_ACTION.ADD_NOTE, data:{
                    indx: addNoteIndx,
                    path: keyNoteData.insideNote ? [...currPath, 'insideNote'] : currPath.slice(0, -1),
                    newNoteContent: extractDiv
                } })
                setTimeout(() => {
                    let focusElement = document.getElementById(`note-${keyNoteData.id}`).nextSibling
                    if (keyNoteData.insideNote) focusElement = document.getElementById(`note-${keyNoteData.id}`).querySelector('.child-note-cont').firstChild
                    focusElement = focusElement.querySelector('.note-content')
                    focusElement.focus()                    
                }, 10);
                break;
            // Backspace
            case 8: {
                if (getCurrentCursorPosition(`note-${keyNoteData.id}`) !== 0) return
                e.preventDefault();
                let isFirstChild = (document.getElementById(`note-${keyNoteData.id}`).previousSibling ? false : true)
                let isLastChild = (document.getElementById(`note-${keyNoteData.id}`).nextSibling ? false : true)

                if (isFirstChild && !parents) return

                let noteContentEl = isFirstChild
                    ? (document.getElementById(`note-${parents[parents.length-1]}`)).querySelector('.note-content')
                    : [].slice.call(document.getElementById(`note-${keyNoteData.id}`).previousSibling.querySelectorAll('.note-content')).pop()
                
                let NoteTextLength = noteContentEl.textContent.length


                updateRootNote({ type: NOTE_ACTION.REMOVE_NOTE, data:{
                    indx: noteIndx,
                    path: currPath.slice(0, -1),
                    noteText: noteContent,
                    hasChildren: keyNoteData.insideNote ? true : false,
                    isLastChild: isLastChild,
                    isFirstChild: isFirstChild
                } })
            
                setTimeout(() => {
                    if (isLastChild && parents) {
                        noteContentEl = document.getElementById(`note-${keyNoteData.id}`).querySelector('.note-content')
                        NoteTextLength = 0
                    }
                    setCurrentCursorPosition(noteContentEl, NoteTextLength)
                    noteContentEl.focus()
                }, 0);
                break;
            }
            // Tab Key
            case 9: {
                e.preventDefault();
                let isFirstChild = (document.getElementById(`note-${keyNoteData.id}`).previousSibling ? false : true)
                if (getCurrentCursorPosition(`note-${keyNoteData.id}`) !== 0 || isFirstChild) return
                updateRootNote({ type: NOTE_ACTION.MAKE_CHILD_NOTE, data:{
                    indx: noteIndx,
                    contPath: currPath.slice(0, -1)

                } })

                setTimeout(() => {
                    let NoteEl = document.getElementById(`note-${keyNoteData.id}`).querySelector('.note-content')
                    setCurrentCursorPosition(NoteEl, 0)
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
                console.log(`${keyNoteData.id} path`, currPath)
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
        let contPath = parentCont.dataset.contPath
        contPath = contPath === 'parent' ? [] : contPath.split(',')
        updateRootNote({ type: NOTE_ACTION.ARRANGE_NOTE, data: {
            notePath: path,
            contPath: contPath, 
            insertIndx: insertIndx,
            noteData: note
        } })
    }
    
    const mouseDown = useDraggableHook(noteData.id, onArrangementChange, docContext)

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
                    text={rowTextContent}
                    noteId={note.id}
                    onTextChange={onTextChange}
                    noteData={noteData}
                    keyDown={keyDown}
                    path={path}
                    indx={indx} />

                {note.insideNote && (
                    <div className="child-note-cont" data-testid={`note-child-cont-${note.id}`} data-cont-path={[...path, 'insideNote']} >
                        {note.insideNote.map((childNote, childNoteIndx) => (
                            <NoteRow key={childNote.id}
                                    indx={childNoteIndx}
                                    noteData={childNote}
                                    docContext={docContext}
                                    parents={parents ? [...parents, note.id] : [note.id]}
                                    path={[...path, 'insideNote', childNoteIndx]} />
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}, (prevProps, nextProps) => {
    const propkeys = Object.keys(prevProps)
    for (let i = 0; i < propkeys.length; i++) {
        const propKey = propkeys[i]

        if (prevProps[propKey] !== nextProps[propKey] && propKey !== 'path') return false
        if (propKey === 'path')
            if (!comparePathProps(propKey, prevProps[propKey], nextProps[propKey])) return false
    }
    return true
})


const comparePathProps = (property, prevPath, nextPath) => {
    if (property !== 'path') return true
    let pathProp = {
        prev: prevPath,
        next: nextPath
    }
    if (pathProp.prev.length !== pathProp.next.length) return false
    for (let indx = 0; indx < pathProp.prev.length; indx++) {
        const pathItem = pathProp.prev[indx];
        if (pathItem !== pathProp.next[indx]) return false
    }
    return true
}


export default NoteRow
