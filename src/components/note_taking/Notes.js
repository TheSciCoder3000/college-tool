import '../../assets/css/note_taking/Notes.css'
import { findParentBySelector } from '../../assets/js/draggable.js'

import NoteRow from './NoteRow'

const Notes = () => {
    const notes = [
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

    const onArrange = (id, prevNextSibling) => {
        console.log('arranging')
    }

    const onAdd = (e) => {
        const noteElement = findParentBySelector(e.target, '.note-row')
        console.log(noteElement)
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
                                     onAdd={onAdd} />
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
