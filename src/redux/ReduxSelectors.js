import { createSelector } from "reselect"

const selectRawFoldersNotes = state => state.NotesAndFolders
const selectRawTabs = state => state.Tabs
const selectRawActiveTab = state => state.ActiveTab


export const selectTabs = createSelector(
    selectRawFoldersNotes,
    selectRawTabs,
    (FoldersAndNotes, TabsIds) => {
        if (FoldersAndNotes.length !== 0) return TabsIds.map(tabId => {return {...FoldersAndNotes[tabId], saved: true}})               // loads the note data using the tab ids
        return []
    }
)