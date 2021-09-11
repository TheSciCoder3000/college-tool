import { AppDispatch, subscribeToStore } from "./store";

import { fetchNotesAndFolders } from "./Reducers/NotesAndFolders";
import { fetchOpenTabs } from "./Reducers/Tabs";

export function InitializeReduxStoreStates(dispatch: AppDispatch) {
    console.log('initializing redux store')
    dispatch(fetchNotesAndFolders())
    dispatch(fetchOpenTabs())

    subscribeToStore()
}