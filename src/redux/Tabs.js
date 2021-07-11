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
        return await addOpenTab(tabId, thunkAPI.getState(), true)
    }
)

export const TabSlice = createSlice({
    name: 'Tabs',
    initialState: [],
    reducers: {
        RemoveTab: (state, action) => {
            console.log('remove state', state)
            return state.filter(tabId => tabId._id !== action.payload)           // return a filtered state
        },
    },
    extraReducers: builder => {
        builder
            .addCase(fetchOpenTabs.fulfilled, (_, action) => action.payload)
            .addCase(addOpenTabs.fulfilled, (state, action)  => { state.push(action.payload) })
    }
})


export const { RemoveTab } = TabSlice.actions
export default TabSlice.reducer