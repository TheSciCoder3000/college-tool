import { addChildren, AddDataArg, AddStateItem, removeChildren, RemoveDataArg, RemoveStateItem, UpdateDataArg, UpdateStateItem } from "./Reducers/NotesAndFolders";
import { RemoveTab as ReduxRemoveTab, addOpenTabs, updateNotesData } from './Reducers/Tabs'
import { setActiveTab } from "./Reducers/ActiveTab";

import { AppDispatch } from "./store";

// Removes a tab from the note viewer
export function RemoveTab(dispatch: AppDispatch, id: string) {
    dispatch(ReduxRemoveTab(id))
}

// Adds a tab into the note viewer
export function AddTab(dispatch: AppDispatch, id: string) {
    dispatch(addOpenTabs(id))
    OpenTab(dispatch, id)
}
export type AddTabType = typeof AddTab

// sets the tab as active
export function OpenTab(dispatch: AppDispatch, id: string | null) {
    dispatch(setActiveTab(id))
}
export type OpenTabType = typeof OpenTab

// Update a Note Item
export function UpdateFolderNoteItem(dispatch: AppDispatch, NoteData: UpdateDataArg) {
    if (NoteData.property === 'notes') dispatch(updateNotesData({noteId: NoteData.id, notesData: NoteData.newValue}))
    else dispatch(UpdateStateItem(NoteData))
}

// Update Tab Item
export function UpdateTabItem(dispatch: AppDispatch, noteId: string, notesData: any[]) {
    dispatch(updateNotesData({noteId, notesData}))
}

// add item
export function AddItem(dispatch: AppDispatch, NoteData: AddDataArg) {
    dispatch(AddStateItem(NoteData))
    dispatch(addChildren({ parentId: NoteData.parentId, itemId: NoteData.itemId }))
    if (NoteData.type === 'note') AddTab(dispatch, NoteData.itemId)
}

// remove item
export function RemoveItem(dispatch: AppDispatch, NoteData: RemoveDataArg) {
    dispatch(RemoveStateItem({ itemId: NoteData.itemId, type: NoteData.type, parentId: NoteData.parentId }))
}