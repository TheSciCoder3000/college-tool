import '../../assets/css/note_taking/Notes.css'
import NoteDoc from './NoteDoc'
import FileFolder from '../FolderSys/FolderSystem'
import { NoteProvider } from './NoteContext'
import { useState, createContext, useContext, useEffect, useCallback } from 'react'

import closeTabIcon from '../../assets/img/close-tab.svg'
import { addOpenTab, getLastActiveTab, getOpenTabs, removeOpenTab, setLastActiveTab, updateItem } from './store/Utils'
import { useNotedbListener, useWhyDidYouUpdate } from '../compUtils'
import ReactDOM from 'react-dom'

// electron isolated imports
const fs = window.require('fs')
const { dialog } = window.require('@electron/remote')

// Context Initialization
const OpenNote = createContext()
export function useOpenNote() {
    return useContext(OpenNote)
}

const RevNotes = () => {
    // ============================================= State Initialization =============================================
    const [tabs, setTabs] = useState(getOpenTabs())
    
    const [activeTab, setActiveTab] = useState()
    useEffect(() => { if (!activeTab) getLastActiveTab().then(setActiveTab) }, [])      // fetch data from database

    const [unsync, setUnsync] = useState({ state: false, data: null })
    // Render top menu bar component
    useEffect(() => ReactDOM.render(
        <MenuComponent activetab={activeTab} unsync={unsync} updateNoteFile={updateNoteFile} />, 
        document.getElementById('menu-bar-cont')
    ), [activeTab, unsync])
    
    // useWhyDidYouUpdate('revnotes', { tabs, activeTab })

    
    // ============================================= SHARED FUNCTIONS =============================================
    // Handles Note openning requests from File component
    const openNoteHandler = (noteId, filename) => {
        
        if (tabs.find(tab => tab.id === noteId)) {                  // check if note is already openned
            // set as active tab
            setLastActiveTab(noteId).then(setActiveTab)
        } else {                                                    // else
            // add to open tabs
            addOpenTab(noteId, filename).then(note => {
                setTabs(getOpenTabs())                              // set tabs state
                setLastActiveTab(note._id).then(setActiveTab)       // set as active tab
            })
        }
    }

    // Handler Save events
    const updateNoteFile = (id, updatedNote) => {
        // cancell save file if content are unchanged
        if (JSON.stringify(updatedNote) === JSON.stringify(activeTab.notes)) {
            setUnsync({ state: false, data: updatedNote })
            return
        }

        updateItem({ _id: id }, 'notes', updatedNote).then(() => {
            setUnsync({ state: false, data: updatedNote })
            setActiveTab(tabState => { return { ...tabState, notes: updatedNote } })
        })

    }

    // ============================================= COMPONENT BASED FUNCTIONS =============================================
    // Handles Note closing when the tab is closed
    const closeTab = (id, tabIndx) => {
        // remove from session storage
        sessionStorage.removeItem(`tab-${id}`)

        // update the tabs state
        if (tabs.length > 1) {
            let newTabIndx = tabIndx === 0 ? 1 : tabIndx-1
            setLastActiveTab(tabs[newTabIndx].id).then(setActiveTab)
        } else setLastActiveTab(null).then(() => setActiveTab(null))
        setTabs(removeOpenTab(id))                              // remove tabs in the database and set the tabs state
    }
    


    // ============================================= FUNCTIONS TO SYNC CHANGES FROM FOLDERS COMPONENT TO TABS =============================================
    // removing tabs whose files are removed
    const checkTabsForRemovedFiles = useCallback((files) => {
        console.log('removing file', files)
        if (files) files.forEach(noteFile => {
            if (tabs.find(noteTab => noteTab.id === noteFile)) setTabs(removeOpenTab(noteFile))
            if (noteFile === activeTab._id) {
                setLastActiveTab(null).then(() => setActiveTab(null))
            }
        })
    }, [tabs, activeTab])

    // renaming tabs whose files are renamed
    const checkTabsForRenamedFile = useCallback((file) => {
        console.log('checking renamed file', file)
        if (file && tabs.find(tab => tab.id === file.id)) {
            setTabs(tabState => tabState.map(tab => {
                if (tab.id === file.id) return { ...tab, noteName: file.name }
                return tab
            }))

            let sessionTab = sessionStorage.getItem(`tab-${file.id}`)
            console.log(sessionTab)
            if (sessionTab) sessionStorage.setItem(`tab-${file.id}`, JSON.stringify({ ...JSON.parse(sessionTab), name: file.name }))
        }
    }, [tabs])

    useNotedbListener(checkTabsForRenamedFile, checkTabsForRemovedFiles)


    return (
        <div className="notes-body">
            <div className="doc-window">
                <div className="tabs">
                    {tabs.length > 0 && (
                        tabs.map((tab, tabIndx) => 
                            <div className={`tab ${activeTab && activeTab._id === tab.id ? 'active' : ''}`} 
                                 key={`tab-${tab.id}`}
                                 onClick={!activeTab || activeTab._id !== tab.id ? () => setLastActiveTab(tab.id).then(setActiveTab) : null} >
                                <div className="tab-name">{tab.noteName}</div>
                                <div className="tab-exit"
                                     onClick={() => closeTab(tab.id, tabIndx)} >
                                    <img src={closeTabIcon} alt="" />
                                </div>
                            </div>
                    ))}
                </div>
                <div className="doc-body">
                    {activeTab && (
                        <NoteProvider noteID={activeTab._id} notes={activeTab.notes} setUnsync={setUnsync} updateNoteFile={updateNoteFile}>
                            <NoteDoc />
                        </NoteProvider>
                    )}
                </div>
            </div>
            <OpenNote.Provider value={openNoteHandler}>
                <FileFolder />
            </OpenNote.Provider>
        </div>
    )
}



const MenuComponent = ({ activetab, unsync, updateNoteFile }) => {
    let { state: unsyncState, data: newNoteData } = unsync
    return (
        <div className="note-menu-bar">
            <button className={unsyncState ? "save-btn" : "save-btn hide"} onClick={() => updateNoteFile(activetab._id, newNoteData)} >
                Save
            </button>
        </div>
    )
}



export default RevNotes
