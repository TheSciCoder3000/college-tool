import { createSlice } from "@reduxjs/toolkit";
import { getLastActiveTab } from "../../components/Notes/store/Utils";
import { ItemTypes } from "./NotesAndFolders";

export const ActiveTabSlice = createSlice({
    name: 'ActiveTab',
    initialState: getLastActiveTab(),
    reducers: {
        setActiveTab: (_, action: {payload: string | null, type: string}) => {
            return action.payload
        }
    }
})


export const { setActiveTab } = ActiveTabSlice.actions
export default ActiveTabSlice.reducer