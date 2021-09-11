import { useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import { selectRawActiveTab, selectRawTabs } from "../../../redux/ReduxSelectors"



export const useNoteHooks = () => {
    const initialRender = useRef(true)

    const dispatch = useDispatch()
    const tabs = useSelector(selectRawTabs)
    const activeTab = useSelector(selectRawActiveTab)

    return { initialRender, dispatch, tabs, activeTab }
}