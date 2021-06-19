import React, { useReducer, useContext } from "react";
import produce from "immer";
import { getDocNotes } from "./NoteData";


// CONTEXTS
export const NoteContext = React.createContext()
const UpdateNoteContext = React.createContext()

// HOOKS
export function useNote() {
    return useContext(NoteContext)
}

export function useUpdateNote() {
    return useContext(UpdateNoteContext)
}

// REDUCER FUNCTION
export const NOTE_ACTION = {
    ADD_NOTE:'add-note',
    REMOVE_NOTE: 'remove-note',
    UPDATE_NOTE: 'update-note'
}
function reducer(note, action) {
    switch (action.type) {
        case NOTE_ACTION.ADD_NOTE:
            const noteCopy = produce(note, draft => {
                // Initialize variables
                let path = action.data.path
                let draftRef = draft

                // loop through the parents until reaching the desired note container
                for (let i = 0; i < action.data.path.length; i+=2) draftRef = draftRef[path[i]][path[i+1]]

                // insert note in the desired indx
                draftRef.splice(action.data.indx, 0, {
                    id: Math.random().toString(16).slice(-8),
                    content: '',
                    insideNote: null
                })
            })
            return noteCopy     // return the edited copy
        case NOTE_ACTION.REMOVE_NOTE:
            return produce(note, draft => {
                // Initialize variables
                let path = action.data.path
                let draftRef = draft
                let noteIndx = action.data.indx

                if (!action.data.isLastChild) {
                    // loop through the parents until reaching the desired note container
                    for (let i = 0; i < path.length; i+=2) {
                        if (i === path.length-2) draftRef[path[i]].content += action.data.noteText
                        draftRef = draftRef[path[i]][path[i+1]]
                        
                    }

                    // Insert the child notes if note has childNotes
                    if (action.data.hasChildren) draftRef.splice(noteIndx+1, 0, ...draftRef[noteIndx].insideNote)

                    // delete the note
                    draftRef.splice(noteIndx, 1)
                } else {
                    // Initialize variables
                    let insertPath = path.slice(0, -2)
                    let notePath = path.slice(-2)

                    // loop through parents of insert path until reaching the desired note container
                    for (let i = 0; i < insertPath.length; i+=2) draftRef = draftRef[insertPath[i]][insertPath[i+1]]

                    // Initialize variable referencing to the note
                    let noteRef = draftRef[notePath[0]].insideNote

                    // Insert the note to the container
                    draftRef.splice(path.slice(-2)[0]+1, 0, {...noteRef[noteIndx]})

                    // delete the note
                    noteRef.splice(noteIndx, 1)
                }

            })
        case NOTE_ACTION.UPDATE_NOTE:
            return produce(note, draft => {
                // Initialize variables
                let path = action.data.path
                let draftRef = draft

                // loop through the parents until reaching the desired note container
                for (let i = 0; i < action.data.path.length; i+=2) 
                        draftRef = path[i+1]
                        ? draftRef[path[i]][path[i+1]]
                        : draftRef[path[i]]

                // Update content
                draftRef.content = action.data.newValue
            })
        default:
            console.log('ERROR: something went wrong in the reducer function')
            return note
    }
}

// Note Provider Component
export function NoteProvider({ children }) {
    const [note, setNote] = useReducer(reducer, getDocNotes())

    return (
        <NoteContext.Provider value={note}>
            <UpdateNoteContext.Provider value={setNote}>
                {children}
            </UpdateNoteContext.Provider>
        </NoteContext.Provider>
    )
}