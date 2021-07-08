import React, { useState, useEffect } from 'react'

const MenuComponent = ({ activeTab, updateNoteFile }) => {
    // ============================================= State Initialization =============================================
    const [activeTabData, setActiveData] = useState({ _id: activeTab, saved:true, notes: null })
    useEffect(() => {
        console.log('handlers have been initiated')
        const ActiveTabChangeEventHandler = e => {
            console.log('tab change event fired', e.detail)
            let eventData = e.detail
            setActiveData(ActiveData => { return {
                ...ActiveData,
                _id: eventData._id,
                saved: eventData.saved
            } })
        }
        const NotesChangeEventHandler = e => {
            let eventDetail = e.detail
            setActiveData(activeTabState => {
                console.log('notes change event fired', { activeTabId: activeTabState._id, eventId: eventDetail._id, notes: eventDetail.notes })
                if (activeTabState._id === eventDetail._id) {
                    console.log('updating notes of menucomp', { ...activeTabState, notes: eventDetail.notes })
                    return { ...activeTabState, notes: eventDetail.notes }
                }
                return activeTabState
            })
        }
        document.addEventListener('NotesChangeEvent', NotesChangeEventHandler)
        document.addEventListener('ActiveTabChanged', ActiveTabChangeEventHandler)
        return () => {
            document.removeEventListener('ActiveTabChanged', ActiveTabChangeEventHandler)
            document.removeEventListener('NotesChangeEvent', NotesChangeEventHandler)
        }
    }, [])


    return (
        <div className="note-menu-bar">
            <button className={!activeTabData.saved ? "save-btn" : "save-btn hide"} onClick={() => updateNoteFile(activeTabData._id, activeTabData.notes)} >
                Save
            </button>
        </div>
    )
}

export default MenuComponent
