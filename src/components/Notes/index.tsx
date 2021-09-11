import '../../assets/css/note_taking/Notes.css'
import FileFolder from './FolderTree/FolderSystem'
import MenuComponent from './MenuComponent'
import { createContext, useContext, useEffect, useCallback } from 'react'



import { useWhyDidYouUpdate } from '../compUtils'
import ReactDOM from 'react-dom'

import { motion } from 'framer-motion'
import { NotesVariants } from '../../AnimationVariants'

import { AddTab, OpenTab, UpdateFolderNoteItem, RemoveTab } from '../../redux/ReduxActions'
import NoteViewer from './NoteViewer'
import Tabs from './Tabs'
import { useNoteHooks } from './Logic/NoteHooks'
import { useNoteOp } from './Logic/NoteOp'
import { useTabLogic } from './Tabs/TabLogic'


interface ActiveTabChangeType {
    _id: string | null | undefined
    saved: boolean | null | undefined
}


// Context Initialization
const OpenNote = createContext((noteId: string, filename: string) => {})
export function useOpenNote() {
    return useContext(OpenNote)
}

/**
 * It is a component that is rendered when redirected to the notes section
 * @returns the note viewer and the folder tree component
 */
const RevNotes = () => {
    // ============================================= State Initialization =============================================
    const { initialRender, dispatch, tabs, activeTab } = useNoteHooks()
    
    const setActiveTab = (noteId: string|null) => OpenTab(dispatch, noteId)         // sets the active tab / opens a note
    
    // DEBUG USES
    // useWhyDidYouUpdate('RevNotes', { initialRender, dispatch, tabs, activeTab })
    
    // ============================================= COMPONENT LOGIC =============================================
    const { openNoteHandler, updateNoteFile } = useNoteOp(tabs)

    // Render top menu bar component on initial render
    useEffect(() => {
        setTimeout(() => {
            ReactDOM.render(
                <MenuComponent activeTab={activeTab} updateNoteFile={updateNoteFile} />, 
                document.getElementById('menu-bar-cont')
            )
        }, 500);
        return () => {
            const menuEl = document.getElementById('menu-bar-cont')
            if (menuEl) ReactDOM.unmountComponentAtNode(menuEl)
        }
    }, [])

    // dispatch custom event when active tab or tabs change
    useEffect(() => {
        // checks to see if the activeTab is within the tabs list
        const activeTabData = tabs.find(tab => tab._id === activeTab)
        const initalRenderState = initialRender.current

        // if activeTabData exists or initial render
        if (activeTabData) {
            // then send out a tabChange event
            // * runs on initial render to inform the topbar of the current note opened

            const tabChangeEvent = new CustomEvent<ActiveTabChangeType>('ActiveTabChanged', {
                detail: {
                    _id: initalRenderState ? activeTab : activeTabData ? activeTabData._id : null,
                    saved: initalRenderState ? true : activeTabData ? activeTabData.saved : null,
                }
            }) 
            document.dispatchEvent(tabChangeEvent)
        }

        if (initalRenderState) initialRender.current = false
    }, [activeTab])

    
    
    
    

    return (
        <div className="notes-body">
            <motion.div className="doc-window"
                variants={NotesVariants.Window}
                initial='hidden'
                animate='visible'
                exit='exit'
            >
                {/* Tabs Section */}
                <Tabs 
                    tabs={tabs}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab} />

                {/* Note Viewer */}
                <NoteViewer 
                    tabs={tabs}
                    activeTab={activeTab}
                    updateNoteFile={updateNoteFile} />
            </motion.div>

            {/* Folder Tree Component */}
            <OpenNote.Provider value={openNoteHandler}>
                <FileFolder />
            </OpenNote.Provider>
        </div>
    )
}







export default RevNotes
