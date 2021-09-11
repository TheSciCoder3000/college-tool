import { configureStore } from '@reduxjs/toolkit'
import TabReducer from './Reducers/Tabs'
import ActiveTabReducer from './Reducers/ActiveTab'
import NotesAndFoldersReducer from './Reducers/NotesAndFolders'
import { syncStateToDb } from '../components/Notes/store/Utils'

export const store = configureStore({
    reducer: {
        NotesAndFolders: NotesAndFoldersReducer,
        Tabs: TabReducer,
        ActiveTab: ActiveTabReducer
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch


export const subscribeToStore = () => {
    store.subscribe(() => {
        let currState = store.getState()
        console.log('state is updated', currState)
    
        syncStateToDb(currState)
    })
}