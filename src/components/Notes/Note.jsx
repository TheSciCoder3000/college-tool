import '../../assets/css/note_taking/Notes.css'
import NoteDoc from './NoteDoc'
import FileFolder from '../FolderSys/FolderSystem'
import { NoteProvider } from './NoteContext'
import { useState, createContext, useContext } from 'react'
import produce from 'immer'
import { getLastActiveTab, getUserTabs, setLastActiveTab, setUserTabs } from './store'

import closeTabIcon from '../../assets/img/close-tab.svg'

// electron isolated imports
const fs = window.require('fs')
const { dialog } = window.require('@electron/remote')

// Context Initialization
const OpenNote = createContext()
export function useOpenNote() {
    return useContext(OpenNote)
}

const RevNotes = () => {
    // State initialization
    const [tabs, setTabs] = useState(getUserTabs())
    useEffect(() => setUserTabs(tabs), [tabs])

    const [activeTab, setActiveTab] = useState(getLastActiveTab())
    const firstRender = useRef(true)
    useEffect(() => {
        if (!firstRender.current) setLastActiveTab(activeTab)                                          // if not initial render, update localStorage
        else firstRender.current = false                                                               // else set initial render to false
    }, [activeTab])
    

    // Handles Note openning requests from File component
    const openNoteHandler = (path, filename) => {
        // check if note has already been loaded
        if (tabs.find(tab => tab.notePath === path)) return console.log('note is already loaded')

        let rawData = fs.readFileSync(path, {encoding: 'utf8'})                     // read raw data from file path
        if (!fs.existsSync(path)) return dialog.showErrorBox('File does not exist', `This file does not exist in the directory ${path}`)

        // Initialize JsonNote
        let jsonNote
        try {                                                                       // Try parsing rawData to json 
            jsonNote = JSON.parse(rawData)
        } catch (error) {                                                           // Catch Syntax error
            console.log(`Error: cannot parse ${filename}`)
            jsonNote = [{
                id: Math.random().toString(16).slice(-8),
                content: "",
                insideNote: null
            }]
        }

        // Initialize the tab data
        let tab = {
            noteName: filename.split('.').slice(0, -1).join('.'),
            notePath: path,
            notes: jsonNote
        }

        // push the newly openned tab to the tabs state
        setTabs(tabState => {
            return [...tabState, tab]
        })

        // Set the tab to active tab
        setActiveTab(tab)
    }

    // Handles Note closing when the tab is closed
    const closeTab = (indx) => {
        // update the tabs state
        setTabs(tabState => {
            // Create immutable variable
            let newTabState = produce(tabState, draft => {
                draft.splice(indx, 1)                                   // remove the tab at indx
                return draft
            })

            // set the active tab
            setActiveTab(function() {
                if (newTabState.length > 0) return newTabState[indx+1] ? newTabState[indx+1] : newTabState[indx-1]
                return {notes: []}
            }())
            
            setUserTabs(newTabState)                                   // Update the localStorage
            return newTabState
        })

    }

    // Handles setting the active tab
    const setActiveTabHandler = (tab) => {
        setActiveTab(tab)
        setLastActiveTab(tab)
    }

    // adding on key down event listeners for shortcuts
    document.onkeydown = (e) => {
       if (e.ctrlKey) {
           switch(e.keyCode) {
               case 83:
                    e.preventDefault()
                    console.log('saving...')
                    break;
           }
       }
    }
    

    return (
        <div className="notes-body">
            <div className="doc-window">
                <div className="tabs">
                    {tabs.length > 0 && (
                        tabs.map((tab, tabIndx) => 
                            <div className={`tab ${activeTab.noteName === tab.noteName ? 'active' : ''}`} 
                                 key={tabIndx}
                                 onClick={activeTab.noteName !== tab.noteName ? () => setActiveTabHandler(tabs[tabIndx]) : null } >
                                <div className="tab-name">{tab.noteName}</div>
                                <div className="tab-exit"
                                     onClick={() => closeTab(tabIndx)} >
                                    <img src={closeTabIcon} alt="" />
                                </div>
                            </div>
                    ))}
                </div>
                <div className="doc-body">
                    {activeTab && (
                        <NoteProvider notes={activeTab.notes}>
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

export default RevNotes
