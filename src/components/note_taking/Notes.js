import '../../assets/css/note_taking/Notes.css'
import { findParentBySelector } from '../../assets/js/draggable.js'
import { useState } from 'react'

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
                    insideNote: null
                },
                {
                    id: '56472vh5',
                    content: "does this sub text update",
                    noteBefore: 'gh4822g5',
                    insideNote: null
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


    const onArrange = (id, prevNextSibling, NoteData) => {
        console.log('arranging')

        // Update dragged note data
        let draggedData = {}             // fetch dragged note data from database
        let draggedNote = {...draggedData, noteBefore: NoteData.note.el.previosSibling ? NoteData.note.el.previosSibling.getAttribute('note') : null}

        // Update next sibling
        let nextSiblingData = {}        // fetch previous sibling note data from database
        let nextSiblingNote = {...nextSiblingData, noteBefore: NoteData.note.id}
    }

    const onAdd = (id, indx) => {
        console.log('adding')
        const container = document.querySelector('.doc-page')

        const noteCopy = [...notes]                             // copy notes data on separate variable
        noteCopy.splice(indx+1, 0, {           // insert another note row after the note row
            id: Math.random().toString(16).slice(-8),
            content: "",
            noteBefore: id
        })

        setNotes(noteCopy)                                      // update note rows html
    }

    const onDelete = (id) => {
        // const noteElement = findParentBySelector(e.target, '.note-row')
        setNotes(notes.filter(note => note.id !== id))
    }

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
                                     onArrange={onArrange}
                                     onAdd={onAdd}
                                     onDelete={onDelete} />
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
