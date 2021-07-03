import '../../assets/css/note_taking/Notes.css'
import NoteDoc from './NoteDoc'
import FileFolder from '../FolderSys/FolderSystem'
import { NoteProvider } from './NoteContext'
import { useState, createContext, useContext, useEffect, useCallback } from 'react'
import produce from 'immer'

import closeTabIcon from '../../assets/img/close-tab.svg'
import { addOpenTab, getLastActiveTab, getOpenTabs, removeOpenTab, setLastActiveTab, updateItem } from './store/Utils'
import { useWhyDidYouUpdate } from '../compUtils'
import ReactDOM from 'react-dom'

// electron isolated imports
const fs = window.require('fs')
const { dialog } = window.require('@electron/remote')

// Context Initialization
const OpenNote = createContext()
const updateRemovedFiles = createContext()
const updateRenamedFile = createContext()
export function useOpenNote() {
    return useContext(OpenNote)
}
export function useRemovedFiles() {
    return useContext(updateRemovedFiles)
}
export function useRenamedFile() {
    return useContext(updateRenamedFile)
}

const RevNotes = () => {
    // State initialization
    const [unsync, setUnsync] = useState({ state: false, data: null })
    const [tabs, setTabs] = useState(getOpenTabs())

    const [activeTab, setActiveTab] = useState()
    useEffect(() => ReactDOM.render(<MenuComponent activetab={activeTab} unsync={unsync} updateNoteFile={updateNoteFile} />, document.getElementById('menu-bar-cont')), [activeTab, unsync])
    useEffect(() => {
        if (!activeTab) getLastActiveTab().then(setActiveTab)
    }, [])
    
    //useWhyDidYouUpdate('revnotes', { tabs, activeTab })

    // Handles Note openning requests from File component
    const openNoteHandler = (noteId, filename) => {
        if (tabs.find(tab => tab.id === noteId)) return console.log('note already is in the viewer')
        addOpenTab(noteId, filename).then(note => {
            setTabs(getOpenTabs())
            setLastActiveTab(note._id).then(setActiveTab)
        })
    }

    // Handles Note closing when the tab is closed
    const closeTab = (id, tabIndx) => {
        // update the tabs state
        if (tabs.length > 1) {
            let newTabIndx = tabIndx === 0 ? 1 : tabIndx-1
            setLastActiveTab(tabs[newTabIndx].id).then(setActiveTab)
        } else setLastActiveTab(null).then(() => setActiveTab(null))
        setTabs(removeOpenTab(id))                              // remove tabs in the database and set the tabs state
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


    // ============================================= FUNCTIONS TO SYNC CHANGES FROM FOLDERS COMPONENT TO TABS =============================================
    // removing tabs whose files are removed
    const checkTabsForRemovedFiles = (files) => {
        if (files) files.forEach(noteFile => {
            if (tabs.find(noteTab => noteTab.id === noteFile)) setTabs(removeOpenTab(noteFile))
            if (noteFile === activeTab._id) {
                setLastActiveTab(null).then(() => setActiveTab(null))
            }
        })
    }

    // renaming tabs whose files are renamed
    const checkTabsForRenamedFile = (file) => {
        if (file && tabs.find(tab => tab.id === file.id)) setTabs(tabState => tabState.map(tab => {
            console.log('replacing', tab.id, file.id, file.name)
            if (tab.id === file.id) return { ...tab, noteName: file.name }
            return tab
        })) 
    }


    return (
        <div className="notes-body">
            <div className="doc-window">
                <div className="tabs">
                    {tabs.length > 0 && (
                        tabs.map((tab, tabIndx) => 
                            <div className={`tab ${activeTab && activeTab.name === tab.noteName ? 'active' : ''}`} 
                                 key={`tab-${tab.id}`}
                                 onClick={!activeTab || activeTab.name !== tab.noteName ? () => setLastActiveTab(tab.id).then(setActiveTab) : null} >
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
                <updateRemovedFiles.Provider value={checkTabsForRemovedFiles}>
                    <updateRenamedFile.Provider value={checkTabsForRenamedFile}>
                        <FileFolder />
                    </updateRenamedFile.Provider>
                </updateRemovedFiles.Provider>
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
