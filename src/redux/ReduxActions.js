import { UpdateStateItem } from "./NotesAndFolders";

// Removes a tab from the note viewer
export function RemoveTab(id) {

}

// Adds a tab into the note viewer
export function AddTab(id) {
    
}

// Update a Note Item
export function UpdateNoteItem(dispatch, NoteData) {
    dispatch(UpdateStateItem(NoteData))
}