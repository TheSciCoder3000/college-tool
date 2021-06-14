import '../../assets/css/note_taking/Notes.css'
import { findParentBySelector } from '../../assets/js/draggable.js'
import { useState, useCallback } from 'react'

import NoteRow from './NoteRow'

const Notes = () => {
    const docNotes = [
        {
            id: 'a594726d',
            content: "test",
            noteBefore: null,
            insideNote: null
        },
        {
            id: 'd528a56b',
            content: "this is another note with sub text pls ",
            noteBefore: 'a594726d',
            insideNote: [
                {
                    id: 'gh4822g5',
                    content: "this is a sub text",
                    noteBefore: null,
                    insideNote: [
                        {
                            id: '813gh689',
                            content: "only one child note",
                            noteBefore: null,
                            insideNote: null
                        }
                    ]
                },
                {
                    id: '56472vh5',
                    content: "does this sub text update",
                    noteBefore: 'gh4822g5',
                    insideNote: [
                        {
                            id: '78vh79ab',
                            content: "sub text inside subtext",
                            noteBefore: null,
                            insideNote: [
                                {
                                    id: '725chb46',
                                    content: "this is some high level branching you got here",
                                    noteBefore: null,
                                    insideNote: null
                                },
                                {
                                    id: 'b46ag83a',
                                    content: "look what we have here",
                                    noteBefore: '725chb46',
                                    insideNote: null
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            id: '54g8v621',
            content: "Hope this works",
            noteBefore: 'd528a56b',
            insideNote: null
        }
    ]
    const [notes, setNotes] = useState(docNotes)


    const onArrange = useCallback((id, prevNextSibling, NoteData) => {
        console.log('arranging')

        // Update dragged note data
        let draggedData = {}             // fetch dragged note data from database
        let draggedNote = {...draggedData, noteBefore: NoteData.note.el.previosSibling ? NoteData.note.el.previosSibling.getAttribute('note') : null}

        // Update next sibling
        let nextSiblingData = {}        // fetch previous sibling note data from database
        let nextSiblingNote = {...nextSiblingData, noteBefore: NoteData.note.id}
    }, [])

    // Used for responding to requests made by root notes to insert a new root note
    const onAdd = useCallback((noteIndx, newNoteData) => {
        setNotes(noteCopy => {
            let copy = [...noteCopy]
            copy.splice(noteIndx+1, 0, newNoteData)
            return copy
        })                                 // update note rows html
    }, [])

    const onDelete = useCallback((id) => {
        // const noteElement = findParentBySelector(e.target, '.note-row')
        setNotes(notes.filter(note => note.id !== id))
    }, [])

    // Used for responding to requests made by the children notes when changes to the children notes are made
    const mainTaskUpdate = useCallback((childTaskIndx, editedChildNote) => {
        setNotes(noteCopy => {
            console.log(editedChildNote)
            console.log(noteCopy)    

            return noteCopy.map(noteData => {
                if (noteCopy[childTaskIndx] == noteData) return editedChildNote          // Replace the item of the childTaskIndx with the newly created ChildNote
                return noteData    
            })
        })
    }, [])

    const rootMoveBack = useCallback(() => {
        
    }, [])

    return (
        <div className="notes-body">
            <div className="doc-window">
                <div className="tabs">
                    <div className="tab active">
                        Untitled
                    </div>
                    <div className="tab">
                        The adventures of Juvi
                    </div>
                </div>
                <div className="doc-body">
                    <div className="doc-page">
                        {notes.map((note, indx) => (
                            <NoteRow key={note.id}
                                     indx={indx}
                                     note={note}
                                     siblings={{
                                         prev: notes[indx-1],
                                         next: notes[indx+1]
                                     }}
                                     onTaskUpdate={mainTaskUpdate} 
                                     onArrange={onArrange}
                                     onAdd={onAdd}
                                     onDelete={onDelete}
                                     onMoveBack={rootMoveBack} />
                        ))}
                    </div>
                </div>
            </div>
            <div className="folder-sidepanel">
                <div className="folder-header">
                    <h1>Notes</h1>
                </div>
                <div className="folder-tree">

                </div>
            </div>
        </div>
    )
}

export default Notes
