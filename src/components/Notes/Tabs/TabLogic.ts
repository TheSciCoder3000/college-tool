import { useDispatch } from "react-redux"
import { OpenTab, RemoveTab } from "../../../redux/ReduxActions"

export const useTabLogic = (tabs: any[], activeTab: string | null) => {
    const dispatch = useDispatch()
    const setActiveTab = (noteId: string|null) => OpenTab(dispatch, noteId)

    /**
     * Accepts the note id and the tab indx that is to be closed
     * * Used only by the tabs
     * @param id 
     * @param tabIndx
     */
    const closeTab = (id: string, tabIndx: number) => {
        // update the activetab state
        if (tabs.length > 1 && tabIndx) {
            if (activeTab !== id) return
            let newTabIndx = tabIndx === 0 ? 1 : tabIndx-1
            setActiveTab(tabs[newTabIndx]._id)
        } else setActiveTab(null)

        // remove tabs in the database and set the tabs state
        RemoveTab(dispatch, id)
    }

    return { closeTab }
}