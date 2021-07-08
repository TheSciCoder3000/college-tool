import React from 'react'
import NoteRow from './NoteRow'

import { useNote } from './NoteContext'

const NoteDoc = ({ id, hidden }) => {
    let theNotes = useNote()
    return (
        <div id={`doc-page-${id}`}
             style={{ display: hidden ? 'none' : 'block' }}
             className="doc-page" 
             data-testid="note-doc"
             data-cont-path="parent" >
            {theNotes && (
                theNotes.map((note, indx) => (
                    <NoteRow key={note.id}
                            indx={indx}
                            noteData={note}
                            path={[indx]} />
                ))
            )}
        </div>
    )
}

export default NoteDoc
