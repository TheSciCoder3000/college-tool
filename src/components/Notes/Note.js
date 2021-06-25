import '../../assets/css/note_taking/Notes.css'
import NoteDoc from './NoteDoc'
import FileFolder from '../FolderSys/FolderSystem'
import { NoteProvider } from './NoteContext'
import { useState } from 'react'

const RevNotes = () => {
    const [tabs, setTabs] = useState([])
    const [activeTab, setActiveTab] = useState(tabs.length > 0 ? tabs[0] : null)


    return (
        <div className="notes-body">
            <div className="doc-window">
                <div className="tabs">
                    <div className="tab active">
                        Untitled
                    </div>
                    <div className="tab">
                        The adventures of Juvi
                    </div>
                </div>
                <div className="doc-body">
                    <NoteProvider>
                        <NoteDoc />
                    </NoteProvider>
                </div>
            </div>
                
                <FileFolder />
            
        </div>
    )
}

export default RevNotes
