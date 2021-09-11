import { createAsyncThunk, createSlice, CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { addItem, getFoldersAndNotes, updateItem, removeItem } from "../../components/Notes/store/Utils";
import { original } from "immer";
import { RemoveTab } from "./Tabs";
import { RootState } from "../store";


// Notes and Folder Type
export interface NotesAndFolderItem {
    _id: string
    name: string
    type: ItemTypes
    parentFolder: string
    children: Array<string>
    open?: boolean
}

export type NotesAndFolderState =  {
    [key: string]: NotesAndFolderItem
}
export type ItemTypes = 'note' | 'folder' | null | undefined


/**
 * Used when first initializing the NotesAndFolders State
 * * Used only upon initialization
 */
export const fetchNotesAndFolders = createAsyncThunk(
    'NotesAndFolders/fetchData',
    async () => {
        console.log('fetching notes and folder')
        return await getFoldersAndNotes()
    }
)

// Argument types when updating the NotesAndFolder state
export interface UpdateDataArg {
    id: string,
    property: string,
    newValue: any
}
/**
 * Used when updating the state of either a note or folder
 * @param {string} id
 * @param {string} property
 * @param {any} newValue
 */
export const  UpdateStateItem = createAsyncThunk(
    'NotesAndFolders/UpdateItem',
    async (updateData: UpdateDataArg) => {
        let { id, property, newValue } = updateData
        console.log('update state', updateData)
        return await updateItem(id, property, newValue)
    }
)

// Argument types when adding either a note or folder state
export interface AddDataArg {
    itemId: string
    itemName: string
    parentId: string,
    type: ItemTypes,
}
/**
 * Used when adding another note or folder in the state
 * @param {string} itemId
 * @param {string} itemName
 * @param {string} parentId
 * @param {string} type
 */
export const AddStateItem = createAsyncThunk(
    'NotesAndFolders/AddItem',
    async (AddData: AddDataArg) => {
        let { itemId, itemName, parentId, type } = AddData
        return await addItem(parentId, type, itemId, itemName)
    }
)

// Argument types used when removing a note or folder state
export interface RemoveDataArg {
    itemId: string
    type: ItemTypes
    parentId: string
}
/**
 * Used when removing another note or folder in the state
 * @param {string} itemId
 * @param {string} type
 * @param {string} parentId
 */
export const RemoveStateItem = createAsyncThunk(
    'NotesAndFolders/RemoveItem',
    async (RemoveData: RemoveDataArg, thunkApi) => {
        const { itemId, type, parentId } = RemoveData
        return removeItem(itemId, type).then(result => {
            if (!result) return null
            
            thunkApi.dispatch(removeChildren({ parentId, itemId }))
            if (type === 'note') thunkApi.dispatch(RemoveTab(itemId))
            const currState = thunkApi.getState() as RootState
            result.forEach(doc => {
                if (currState.Tabs.includes(doc.id)) thunkApi.dispatch(RemoveTab(doc.id))
            });
            return result
        })
    }
)

// ======================================= Notes and Folders Reducer Initialization =======================================
const initialState: NotesAndFolderState = {}
export const NotesAndFolderSlice = createSlice({
    name: 'NotesAndFolders',
    initialState,
    reducers: {
        addChildren: (state, action: { type: string, payload: { parentId: string, itemId: string } }) => {
            const { parentId, itemId } = action.payload
            if (!state[parentId].children) state[parentId].children = []
            state[parentId].children.push(itemId)
            return state
        },
        removeChildren: (state, action: { type: string, payload: { parentId: string, itemId: string } }) => {
            const { parentId, itemId } = action.payload
            const childIndx = state[parentId].children.indexOf(itemId)
            state[parentId].children.splice(childIndx, 1)
            return state
        }
    },
    extraReducers: builder => {
        builder
            // fetching db data
            .addCase(fetchNotesAndFolders.fulfilled, (_, action) => action.payload)

            // update item
            .addCase(UpdateStateItem.fulfilled, (state, action) => {
                let newDoc = action.payload
                if (!newDoc) return state
                state[newDoc._id] = { ...state[newDoc._id], ...newDoc }
                return state
            })

            // add item 
            .addCase(AddStateItem.pending, (state, action) => {
                const arg = action.meta.arg
                state[arg.itemId] = {
                    _id: arg.itemId,
                    name: arg.itemName,
                    type: arg.type,
                    parentFolder: arg.parentId,
                    children: []
                }
            })
            .addCase(AddStateItem.fulfilled, (state, action) => {
                let newDoc = action.payload
                state[newDoc._id] = newDoc
                return state
            })
            .addCase(AddStateItem.rejected, (state, action) => {
                const arg = action.meta.arg
                delete state[arg.itemId]
            })

            // remove item
            .addCase(RemoveStateItem.fulfilled, (state, action) => {
                const deletedFile = action.payload
                if (!deletedFile) return state
                console.log('deleted file', deletedFile)
                deletedFile.forEach((file: {id: string}) => {
                    console.log('file id', file.id)
                    delete state[file.id]
                })
            })
    }
})

export const { addChildren, removeChildren } = NotesAndFolderSlice.actions
export default NotesAndFolderSlice.reducer