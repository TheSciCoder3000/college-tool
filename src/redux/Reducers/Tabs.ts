import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { addOpenTabDB, getOpenTabs, updateNotesDb } from '../../components/Notes/store/Utils'


export interface TabType {
    _id: string
    name: string
    saved: boolean
    notes: any
}

/**
 * Used when initializing the tabs state
 * * Used only during initialization
 */
export const fetchOpenTabs = createAsyncThunk(
    'Tabs/fetchOpenTabsStatus',
    async () => {
        const fetchTabs = await getOpenTabs()
        console.log('fetch tabs', fetchTabs)
        return fetchTabs
    }
)

/**
 * Used when opening a tab
 * @param {string} tabId
 */
export const addOpenTabs = createAsyncThunk(
    'Tabs/addOpenTabsStatus',
    async (tabId: string) => {
        return addOpenTabDB(tabId)
    }
)

export const updateNotesData = createAsyncThunk(
    'Tabs/updateNotesDataStatus',
    async (args: {noteId: string, notesData: any[]}) => {
        return updateNotesDb(args.noteId, args.notesData)
    }
)

// ====================================== Tabs Reducer ======================================
const initialState: Array<any> = []
export const TabSlice = createSlice({
    name: 'Tabs',
    initialState,
    reducers: {
        RemoveTab: (state, action) => {
            console.log('remove state', state)
            return state.filter(tabData => tabData._id !== action.payload)           // return a filtered state
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchOpenTabs.fulfilled, (_, action) => action.payload)
            .addCase(addOpenTabs.fulfilled, (state, action)  => {
                console.log('adding tab', action.payload)
                if (state.find(tabData => tabData._id === action.payload._id)) return state
                state.push(action.payload)
                return state
            })
            .addCase(updateNotesData.fulfilled, (state, action) => {
                return state.map(tabData => {
                    if (tabData._id === action.payload._id) return {...tabData, notes: action.payload.notes}
                    return tabData
                })
            })
    }
})


export const { RemoveTab } = TabSlice.actions
export default TabSlice.reducer