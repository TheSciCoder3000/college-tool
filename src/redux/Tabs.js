import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { addOpenTab, getOpenTabs } from '../components/Notes/store/Utils'


export const fetchOpenTabs = createAsyncThunk(
    'Tabs/fetchOpenTabsStatus',
    async () => {
        return await getOpenTabs()
    }
)

export const addOpenTabs = createAsyncThunk(
    'Tabs/addOpenTabsStatus',
    async (tabId, thunkAPI) => {
        // addOpenTab(tabId, thunkAPI.getState(), true)
        return tabId
    }
)

export const TabSlice = createSlice({
    name: 'Tabs',
    initialState: [],
    reducers: {
        RemoveTab: (state, action) => {
            console.log('remove state', state)
            return state.filter(tabId => tabId !== action.payload)           // return a filtered state
        },
        UpdateTab: (state, action) => {
            let updatedId = action.payload._id
            let updatedName = action.payload.name
            let updatedNotes = action.payload.notes
            console.log(`updating tab ${updatedName}`)
            return state.map(tab => {
                if (tab._id === updatedId) return {...tab, notes: updatedNotes}
                return tab
            })
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchOpenTabs.fulfilled, (_, action) => action.payload)
            .addCase(addOpenTabs.fulfilled, (state, action)  => { state.push(action.payload) })
    }
})


export const { RemoveTab, UpdateTab } = TabSlice.actions
export default TabSlice.reducer