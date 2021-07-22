import { addChildren, AddDataArg, AddStateItem, removeChildren, RemoveDataArg, RemoveStateItem, UpdateDataArg, UpdateStateItem } from "./Reducers/NotesAndFolders";
import { RemoveTab as ReduxRemoveTab, addOpenTabs } from './Reducers/Tabs'
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

export function OpenTab(dispatch: AppDispatch, id: string) {
    dispatch(setActiveTab(id))
}



// Update a Note Item
export function UpdateFolderNoteItem(dispatch: AppDispatch, NoteData: UpdateDataArg) {
    dispatch(UpdateStateItem(NoteData))
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