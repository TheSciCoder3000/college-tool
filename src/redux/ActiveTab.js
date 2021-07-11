import { createSlice } from "@reduxjs/toolkit";
import { getLastActiveTab, setLastActiveTab } from "../components/Notes/store/Utils";

export const ActiveTabSlice = createSlice({
    name: 'ActiveTab',
    initialState: getLastActiveTab(),
    reducers: {
        setActiveTab: (_, action) => {
            // setLastActiveTab(action.payload)
            return action.payload
        }
    }
})


export const { setActiveTab } = ActiveTabSlice.actions
export default ActiveTabSlice.reducer