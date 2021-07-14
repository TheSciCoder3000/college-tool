import React, { useState, useEffect } from 'react'

const MenuComponent = ({ activeTab, updateNoteFile }) => {
    // ============================================= State Initialization =============================================
    const [activeTabData, setActiveData] = useState({ _id: activeTab, saved:true, notes: null })
    useEffect(() => {
        const ActiveTabChangeEventHandler = e => {
            console.log('active tab changed = fired from menu component', e.detail)
            let eventData = e.detail
            setActiveData(ActiveData => { return {
                ...ActiveData,
                _id: eventData._id,
                saved: eventData.saved
            } })
        }
        const NotesChangeEventHandler = e => {
            console.log('notes have changed - fired from menu component')
            let eventDetail = e.detail
            setActiveData(activeTabState => {
                if (activeTabState._id === eventDetail._id) {
                    return { ...activeTabState, notes: eventDetail.notes, saved: false }
                }
                return activeTabState
            })
        }
        const NotesUpdatedEventHandler = e => {
            let eventDetail = e.detail
            setActiveData(activeTabState => {
                if (activeTabState._id === eventDetail._id) {
                    return { ...activeTabState, saved: true}
                }
                return activeTabState
            })
        }
        document.addEventListener('ActiveTabChanged', ActiveTabChangeEventHandler)
        document.addEventListener('NotesChangeEvent', NotesChangeEventHandler)
        document.addEventListener('NotesUpdated', NotesUpdatedEventHandler)
        return () => {
            document.removeEventListener('ActiveTabChanged', ActiveTabChangeEventHandler)
            document.removeEventListener('NotesChangeEvent', NotesChangeEventHandler)
            document.removeEventListener('NotesUpdated', NotesUpdatedEventHandler)
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
