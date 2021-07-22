import '../../assets/css/note_taking/Notes.css'
import FileFolder from '../FolderSys/FolderSystem'
import MenuComponent from './MenuComponent'
import { NoteProvider as UnmemoizedNoteProvider } from './NoteContext'
import React, { useState, createContext, useContext, useEffect, useCallback, useRef } from 'react'

import closeTabIcon from '../../assets/img/close-tab.svg'
import { useWhyDidYouUpdate } from '../compUtils'
import ReactDOM from 'react-dom'

import { motion } from 'framer-motion'
import { NotesVariants } from '../../AnimationVariants'


import { setActiveTab as reduxSetActiveTab } from '../../redux/Reducers/ActiveTab'

import { useDispatch, useSelector } from 'react-redux'
import { selectTabs, selectRawActiveTab } from '../../redux/ReduxSelectors'
import { AddTab, OpenTab, UpdateFolderNoteItem, RemoveTab } from '../../redux/ReduxActions'

const NoteProvider = React.memo(UnmemoizedNoteProvider)

interface ActiveTabChangeType {
    _id: string | null | undefined
    saved: boolean | null | undefined
}


// Context Initialization
const OpenNote = createContext((noteId: string, filename: string) => {})
export function useOpenNote() {
    return useContext(OpenNote)
}

const RevNotes = () => {
    // ============================================= State Initialization =============================================
    const dispatch = useDispatch()
    const initialRender = useRef(true)

    const tabs = useSelector(selectTabs)
    console.log('tabs', tabs)
    const setTabs = useCallback(() => {
    },[])
    
    const activeTab = useSelector(selectRawActiveTab)
    const setActiveTab = (noteId: string|null) => { dispatch(reduxSetActiveTab(noteId)) }
    // useEffect(() => setLastActiveTab(activeTab), [activeTab])                                   // update db when active tab changes


    // useWhyDidYouUpdate('RevNotes', { dispatch, initialRender, tabs, activeTab })

    // dispathc custom event when active tab or tabs change
    useEffect(() => {
        const activeTabData = tabs.find(tab => tab._id === activeTab)
        const initalRenderState = initialRender.current
        if (activeTabData || initalRenderState) {
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

    // Render top menu bar component
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
    
    
    // ============================================= SHARED FUNCTIONS =============================================
    /**
     * * Handles Note openning requests from File component
     * @param {string} noteId 
     * @param {string} filename 
     */
    const openNoteHandler = useCallback((noteId: string, filename: string) => {
        if (tabs.find(tab => tab._id === noteId))  OpenTab(dispatch, noteId)
        else AddTab(dispatch, noteId)
    }, [tabs])

    /**
     * Updates the states and db of notes
     * * Handler Save events
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

    // ============================================= COMPONENT BASED FUNCTIONS =============================================
    // Handles Note closing when the tab is closed
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
                                 onClick={!activeTab || activeTab !== tab._id ? () => setActiveTab(tab._id) : undefined} >
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
