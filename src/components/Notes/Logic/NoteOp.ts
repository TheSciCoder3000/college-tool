import { useCallback } from "react"
import { useDispatch } from "react-redux"
import { AddTab, OpenTab, UpdateFolderNoteItem } from "../../../redux/ReduxActions"

export const useNoteOp = (tabs: any[]) => {
    const dispatch = useDispatch()

    /**
     * Handles Note openning requests from File component
     * * Used by the folder tree for opening notes
     * @param {string} noteId 
     * @param {string} filename 
     */
    const openNoteHandler = useCallback((noteId: string, filename: string) => {
        if (tabs.find(tab => tab._id === noteId)) OpenTab(dispatch, noteId)
        else AddTab(dispatch, noteId)
    }, [tabs])

    /**
     * Updates the states and db of notes
     * * Handler Save events
     * * Used by the Upper toolbar for manual btn saving
     * * Used for reference by the note viewer for hotkey saving
     * ! needs to connect to redux actions and tab state
     * @param {string} id
     * @param {Array} updatedNote 
     */
    const updateNoteFile = useCallback((id, updatedNote) => {
        UpdateFolderNoteItem(dispatch, {
            id: id,
            property: 'notes',
            newValue: updatedNote
        })
        
        const NotesUpdatedEvent = new CustomEvent('NotesUpdated', {detail: {
            _id: id
        }})
        document.dispatchEvent(NotesUpdatedEvent)
    }, [])

    return { openNoteHandler, updateNoteFile }
}