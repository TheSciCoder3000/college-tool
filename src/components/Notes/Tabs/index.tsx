import React from 'react'
import closeTabIcon from '../../../assets/img/close-tab.svg'
import { useTabLogic } from './TabLogic'

interface TabsProps {
    tabs: any[]
    activeTab: string | null
    setActiveTab: any
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, setActiveTab }) => {
    const { closeTab } = useTabLogic(tabs, activeTab)

    return (
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
    )
}

export default Tabs
