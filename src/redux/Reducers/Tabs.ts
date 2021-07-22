import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getOpenTabs } from '../../components/Notes/store/Utils'


export const fetchOpenTabs = createAsyncThunk(
    'Tabs/fetchOpenTabsStatus',
    async () => {
        return await getOpenTabs()
    }
)

export const addOpenTabs = createAsyncThunk(
    'Tabs/addOpenTabsStatus',
    async (tabId: string): Promise<string> => {
        return tabId
    }
)

const initialState: Array<string> = []
export const TabSlice = createSlice({
    name: 'Tabs',
    initialState,
    reducers: {
        RemoveTab: (state, action) => {
            console.log('remove state', state)
            return state.filter(tabId => tabId !== action.payload)           // return a filtered state
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchOpenTabs.fulfilled, (_, action) => action.payload)
            .addCase(addOpenTabs.fulfilled, (state, action)  => {
                if (state.includes(action.payload)) return state
                state.push(action.payload)
                return state
            })
    }
})


export const { RemoveTab } = TabSlice.actions
export default TabSlice.reducer