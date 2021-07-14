import { subscribeToStore } from "./store";

import { fetchNotesAndFolders } from "./NotesAndFolders";
import { fetchOpenTabs } from "./Tabs";

export function InitializeReduxStoreStates(dispatch) {
    console.log('initializing redux store')
    dispatch(fetchNotesAndFolders())
    dispatch(fetchOpenTabs())

    subscribeToStore()
}