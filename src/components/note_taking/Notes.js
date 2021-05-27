import '../../assets/css/note_taking/Notes.css'
import { findParentBySelector } from '../../assets/js/draggable.js'
import { useState } from 'react'

import NoteRow from './NoteRow'

const Notes = () => {
    const docNotes = [
        {
            id: 1,
            content: "test",
            noteBefore: null
        },
        {
            id: 2,
            content: "this is another note",
            noteBefore: 1
        },
        {
            id: 3,
            content: "Hope this works",
            noteBefore: 2
        }
    ]
    const [notes, setNotes] = useState(docNotes)

    const onArrange = (id, prevNextSibling) => {
        console.log('arranging')
    }

    const onAdd = (e) => {
        const noteElement = findParentBySelector(e.target, '.note-row')
        const container = document.querySelector('.doc-page')
        const indexOfNote = Array.from(container.children).indexOf(noteElement)

        const noteCopy = [...notes]
        noteCopy.splice(indexOfNote+1, 0, {
            id: Array.from(container.children).length + 1,
            content: "",
            noteBefore: parseInt(noteElement.getAttribute('task'))
        })

        setNotes(noteCopy)
    }

    const onDelete = (e) => {
        const noteElement = findParentBySelector(e.target, '.note-row')
        setNotes(notes.filter(note => note.id !== parseInt(noteElement.getAttribute('note'))))
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
                        {notes.map((note) => (
                            <NoteRow key={note.id}
                                     note={note} 
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
