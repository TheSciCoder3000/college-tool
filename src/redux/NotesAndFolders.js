import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getFoldersAndNotes, updateItem } from "../components/Notes/store/Utils";


export const fetchNotesAndFolders = createAsyncThunk(
    'NotesAndFolders/fetchData',
    async () => {
        return await getFoldersAndNotes()
    }
)

export const UpdateStateItem = createAsyncThunk(
    'NotesAndFolders/UpdateItem',
    async (updateData) => {
        let { id, property, newValue } = updateData
        return await updateItem({_id: id}, property, newValue)
    }
)

export const NotesAndFolderSlice = createSlice({
    name: 'NotesAndFolders',
    initialState: [],
    reducers: {
        removeItem: (state, action) => {
            return state.filter(item => item._id !== action.payload)
        }
    },
    extraReducers: builder => {
        builder
            .addCase(fetchNotesAndFolders.fulfilled, (_, action) => action.payload)
            .addCase(UpdateStateItem.fulfilled, (state, action) => {
                let newDoc = action.payload
                state[newDoc._id] = newDoc
                return state
            })
    }
})

export default NotesAndFolderSlice.reducer