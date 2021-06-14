import React, { useReducer, useContext } from "react";
import { setNestedDict, getNestedDict } from "../../assets/js/editable";

const docNotes = [
    {
        id: 'a594726d',
        content: "test",
        insideNote: null
    },
    {
        id: 'd528a56b',
        content: "this is another note with sub text pls ",
        insideNote: [
            {
                id: 'gh4822g5',
                content: "this is a sub text",
                insideNote: [
                    {
                        id: '813gh689',
                        content: "only one child note",
                        insideNote: null
                    }
                ]
            },
            {
                id: '56472vh5',
                content: "does this sub text update",
                insideNote: [
                    {
                        id: '78vh79ab',
                        content: "sub text inside subtext",
                        insideNote: [
                            {
                                id: '725chb46',
                                content: "this is some high level branching you got here",
                                insideNote: null
                            },
                            {
                                id: 'b46ag83a',
                                content: "look what we have here",
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
        insideNote: null
    }
]

// CONTEXTS
const NoteContext = React.createContext()
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
            console.log('adding note')
            let editedNote = getNestedDict(note, action.data.path, 'insideNote')
            editedNote.splice(action.data.indx, 0, {
                id: Math.random().toString(16).slice(-8),
                content: '',
                insideNote: null
            })
            let newNoteCopy = setNestedDict(note, action.data.path, 'insideNote', editedNote)
            return newNoteCopy
        case NOTE_ACTION.REMOVE_NOTE:
            break;
        case NOTE_ACTION.UPDATE_NOTE:
            return setNestedDict(note, action.data.path, action.data.property, action.data.newValue)
        default:
            return note
    }
    return note
}

// Note Provider Component
export function NoteProvider({ children }) {
    const [note, setNote] = useReducer(reducer, docNotes)

    return (
        <NoteContext.Provider value={note}>
            <UpdateNoteContext.Provider value={setNote}>
                {children}
            </UpdateNoteContext.Provider>
        </NoteContext.Provider>
    )
}