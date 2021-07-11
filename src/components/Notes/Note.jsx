import '../../assets/css/note_taking/Notes.css'
import FileFolder from '../FolderSys/FolderSystem'
import MenuComponent from './MenuComponent'
import { NoteProvider } from './NoteContext'
import { useState, createContext, useContext, useEffect, useCallback, useRef } from 'react'

import closeTabIcon from '../../assets/img/close-tab.svg'
import { addOpenTab, getLastActiveTab, getOpenTabs, removeOpenTab, setLastActiveTab, updateItem } from './store/Utils'
import { useNotedbListener, useWhyDidYouUpdate } from '../compUtils'
import ReactDOM from 'react-dom'

import { motion } from 'framer-motion'
import { NotesVariants } from '../../AnimationVariants'

import { useDispatch, useSelector } from 'react-redux'
import { addOpenTabs, RemoveTab } from '../../redux/Tabs'
import { setActiveTab as reduxSetActiveTab } from '../../redux/ActiveTab'


// Context Initialization
const OpenNote = createContext()
export function useOpenNote() {
    return useContext(OpenNote)
}

const RevNotes = () => {
    const dispatch = useDispatch()
    // ============================================= State Initialization =============================================
    const initialRender = useRef(true)

    const tabs = useSelector(state => state.Tabs)
    console.log('tabs', tabs)
    function setTabs () {
        console.log('setting tabs')
    }
    useEffect(() => { if (!tabs || tabs.length === 0) getOpenTabs().then(setTabs) }, [])        // fetch open tabs on initial render
    
    const activeTab = useSelector(state => state.ActiveTab)
    const setActiveTab = noteId => { dispatch(reduxSetActiveTab(noteId)) }
    // useEffect(() => setLastActiveTab(activeTab), [activeTab])                                   // update db when active tab changes

    // dispathc custom event when active tab or tabs change
    useEffect(() => {
        const activeTabData = tabs.find(tab => tab._id === activeTab)
        const initalRenderState = initialRender.current
        console.log('actiee tab', activeTab)
        if (activeTabData || initalRenderState) {
            const tabChangeEvent = new CustomEvent('ActiveTabChanged', {
                detail: {
                    _id: initalRenderState ? activeTab : activeTabData._id,
                    saved: initalRenderState ? true : activeTabData.saved,
                }
            }) 
            document.dispatchEvent(tabChangeEvent)
        }

        if (initalRenderState) initialRender.current = false
    }, [activeTab])

    // Render top menu bar component
    useEffect(() => {
        setTimeout(() => {
            ReactDOM.render(
                <MenuComponent activeTab={activeTab} updateNoteFile={updateNoteFile} />, 
                document.getElementById('menu-bar-cont')
            )
        }, 500);
        return () => ReactDOM.unmountComponentAtNode(document.getElementById('menu-bar-cont'))
    }, [])
    
    // useWhyDidYouUpdate('revnotes', { tabs, activeTab })

    
    // ============================================= SHARED FUNCTIONS =============================================
    /**
     * * Handles Note openning requests from File component
     * @param {string} noteId 
     * @param {string} filename 
     */
    const openNoteHandler = (noteId, filename) => {
        
        if (tabs.find(tab => tab._id === noteId)) {                                 // check if note is already openned
            // set as active tab
            setActiveTab(noteId)
        } else {                                                                    // else
            console.log('running dispatch')
            dispatch(addOpenTabs(noteId))
            setActiveTab(noteId)
        }
    }

    /**
     * Updates the states and db of notes
     * * Handler Save events
     * @param {string} id
     * @param {list} updatedNote 
     */
    const updateNoteFile = useCallback((id, updatedNote) => {
        updateItem({ _id: id }, 'notes', updatedNote).then(() => {                  // update the database, then
            setTabs(tabState => tabState.map(tab => {                                   // update the notes property of the tab
                if (tab._id === id) {
                    console.log('NoteProvider updating note', { ...tab, notes: updatedNote, saved: true })
                    return { ...tab, notes: updatedNote, saved: true }
                }
                return tab
            }))
            const NotesUpdatedEvent = new CustomEvent('NotesUpdated', {detail: {
                _id: id
            }})
            document.dispatchEvent(NotesUpdatedEvent)
        })
    }, [])

    // ============================================= COMPONENT BASED FUNCTIONS =============================================
    // Handles Note closing when the tab is closed
    const closeTab = (id, tabIndx) => {
        // update the activetab state
        if (tabs.length > 1 && tabIndx) {
            if (activeTab !== id) return
            let newTabIndx = tabIndx === 0 ? 1 : tabIndx-1
            setActiveTab(tabs[newTabIndx]._id)
        } else setActiveTab(null)

        // remove tabs in the database and set the tabs state
        dispatch(RemoveTab(id))
    }
    


    // ============================================= FUNCTIONS TO SYNC CHANGES FROM FOLDERS COMPONENT TO TABS =============================================
    // removing tabs whose files are removed
    const checkTabsForRemovedFiles = useCallback((files) => {
        console.log('removing file', files)
        if (files) files.forEach(noteFile => {
            if (tabs.find(noteTab => noteTab.id === noteFile)) 
                removeOpenTab(noteFile).then(() => setTabs(tabsState => tabsState.filter(tab => tab._id !== noteFile)))
            if (noteFile === activeTab) {
                setActiveTab(null)
            }
        })
    }, [tabs, activeTab])

    // renaming tabs whose files are renamed
    const checkTabsForRenamedFile = useCallback((file) => {
        console.log('checking renamed file', file)
        if (file && tabs.find(tab => tab._id === file.id)) {
            setTabs(tabState => tabState.map(tab => {
                if (tab._id === file.id) return { ...tab, name: file.name }
                return tab
            }))
        }
    }, [tabs])

    useNotedbListener(checkTabsForRenamedFile, checkTabsForRemovedFiles)


    return (
        <div className="notes-body">
            <motion.div className="doc-window"
                variants={NotesVariants.Window}
                initial='hidden'
                animate='visible'
                exit='exit'
            >
                <div className="tabs">
                    {tabs.length > 0 && (
                        tabs.map((tab, tabIndx) => 
                            <div className={`tab ${activeTab && activeTab === tab._id ? 'active' : ''} ${!tab.saved ? 'tab-unsaved' : ''}`} 
                                 key={`tab-${tab._id}`}
                                 onClick={!activeTab || activeTab !== tab._id ? () => setActiveTab(tab._id) : null} >
                                <div className="tab-name">{tab.name}</div>
                                <div className="tab-exit"
                                     onClick={() => closeTab(tab._id, tabIndx)} >
                                    <img src={closeTabIcon} alt="" />
                                </div>
                            </div>
                    ))}
                </div>

                <div className="doc-body">
                    {tabs.length > 0 && (
                        tabs.map(tab =>
                            <NoteProvider key={tab._id} 
                                          noteID={tab._id} 
                                          notes={tab.notes}
                                          setTabs={setTabs} 
                                          hidden={tab._id === activeTab ? false : true}
                                          updateNoteFile={updateNoteFile} />
                    ))}
                </div>
            </motion.div>

            <OpenNote.Provider value={openNoteHandler}>
                <FileFolder />
            </OpenNote.Provider>
        </div>
    )
}







export default RevNotes
