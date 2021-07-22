import { createSelector } from "reselect"
import { NotesAndFolderItem, NotesAndFolderState } from "./Reducers/NotesAndFolders"
import { RootState } from "./store"

export const selectRawFoldersNotes = (state: RootState): NotesAndFolderState => state.NotesAndFolders
const selectRootFolderChildren = (state: RootState): NotesAndFolderItem => state.NotesAndFolders['root-folder']
export const selectRawTabs = (state: RootState): string[] => state.Tabs
export const selectRawActiveTab = (state: RootState): string => state.ActiveTab


export const selectTabs = createSelector(
    selectRawFoldersNotes,
    selectRawTabs,
    (FoldersAndNotes, TabsIds) => {
        console.log('folders and notes', FoldersAndNotes)
        if (Object.keys(FoldersAndNotes).length > 0) return TabsIds.map(tabId => {return {...FoldersAndNotes[tabId], saved: true}})   // loads the note data using the tab ids
        return []
    }
)


export const selectFolderTree = createSelector(
    selectRawFoldersNotes,
    selectRootFolderChildren,
    (FoldersAndNotes, RootFolderChildren) => {
        const childrenIds = RootFolderChildren?.children || []
        const childrenItems: NotesAndFolderItem[] = []
        if (childrenIds.length > 0) childrenIds.forEach(itemId => childrenItems.push(FoldersAndNotes[itemId]))
        return childrenItems.sort((item1, item2) => {
            if (item1.type === item2.type) return item1.name.localeCompare(item2.name)
            return item1.type === 'folder' ? -1 : 1 
        })
    }
)

export const selectFilesOf = createSelector(
    selectRawFoldersNotes,
    (_: any, folderId: string) => folderId,
    (FoldersAndNotes, folderId) => {
        const childrenIds = FoldersAndNotes[folderId].children || []
        const childrenItems: NotesAndFolderItem[] = []
        childrenIds.forEach(itemId => childrenItems.push(FoldersAndNotes[itemId]))
        return childrenItems
    }
)