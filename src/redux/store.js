import { configureStore } from '@reduxjs/toolkit'
import TabReducer from './Tabs'
import ActiveTabReducer from './ActiveTab'
import NotesAndFoldersReducer from './NotesAndFolders'
import { syncStateToDb } from '../components/Notes/store/Utils'

export const store = configureStore({
    reducer: {
        NotesAndFolders: NotesAndFoldersReducer,
        Tabs: TabReducer,
        ActiveTab: ActiveTabReducer
    }
})


export const subscribeToStore = () => {
    store.subscribe(() => {
        let currState = store.getState()
        console.log('state is updated', currState)
    
        syncStateToDb(currState)
    })
}