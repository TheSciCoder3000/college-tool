import { ItemTypes, NotesAndFolderState } from "../../../redux/Reducers/NotesAndFolders"
import { TabType } from "../../../redux/Reducers/Tabs"
import { RootState } from "../../../redux/store"

const Pouchdb = window.require('pouchdb-browser')
const PouchdbFind = window.require('pouchdb-find')
Pouchdb.plugin(PouchdbFind)

const path = window.require('path')
const { app, dialog } = window.require('@electron/remote')

const Store = window.require('electron-store')


export interface UniDocType {
    name: string
    open?: boolean
    notes?: Array<any>
    parentFolder: string
    type: ItemTypes
    _id: string
    _rev?: string
}

interface deleteResType {
    id: string
    ok: true
    rev: string
}


type $FixMe = any


// ================================================ VARIABLE INITIALIZATIONS ================================================
const store = new Store()
export var UserSettingsdb = new Pouchdb(path.join(app.getPath('userData'), 'userSettings'))
export var Notedb = new Pouchdb(path.join(app.getPath('userData'), 'noteDb'))
Notedb.allDocs({ include_docs: true }).then(console.log)



// ================================================ FOLDER FUNCTIONS FUNCTIONS ================================================
/**
 * Initializes the Root folder
 * * Runs when initializing the FolderAndNotes store
 */
async function initializeRootFiles() {
    // add to database
    Notedb.bulkDocs([
        {
            _id: 'root-folder',
            name: 'root-folder',
            type: 'folder',
            open: true
        }
    ]).then((confirmation: any) => {
        console.log('bulk put completed', confirmation)
    }).catch((error: any) => {
        console.log('unexpected error occured', error)
    })
}

/**
 * Accepts a folder id and returns a list of children file ids
 * * Make sure to only pass folder ids
 * @param folderId 
 * @returns an array of file ids
 */
export async function findFilesOf(folderId: string) {
    let FolderData: UniDocType[] = await Notedb.createIndex({
        index: { fields: ['parentFolder'] },
        ddoc: 'parentFolder-indexes'
    }).then(() => Notedb.find({
        selector: {
            'parentFolder': folderId
        }
    }))
    .then((selectorResult: {docs: UniDocType[]}) => {
        console.log('findFilesOf ', selectorResult)
        return selectorResult.docs
    })
    .catch((err: any) => console.error(`ERROR: cannot find files of ${folderId}`, err))

    // sort the folderData
    if (FolderData.length > 0) return FolderData.sort((doc1, doc2) => {
        if (doc1.type === doc2.type) return doc1.name.localeCompare(doc2.name)
        return doc1.type === 'folder' ? -1 : 1
    }).map(doc => doc._id)

    return []
}

// add a folder/note to the db
export async function addItem(id: string, type: ItemTypes, itemId: string, itemName: string) {
    let newItemId = itemId // `${new Date().toISOString()}-${Math.random().toString(16).slice(-4)}`
    // pre initialize item Obj
    let itemObj: UniDocType = {
        _id: newItemId,
        name: itemName,
        parentFolder: id,
        type: type,
        ... type === 'folder'
            ? {open: false}
            : {notes: [{
                id: Math.random().toString(16).slice(-8),
                content:"",
                insideNote: null
            }]}
    }

    // adding item to db
    return Notedb.put(itemObj).then(() => {
        return Notedb.get(newItemId).then((result: any) => {
            console.log('add result', result)
            return result
        })
    }).catch((err: any) => console.error('ERROR: adding item error', err))
}

/**
 * Connects to the electron dialog api and returns the response of the user
 * @param deleteMsg Delete message that will be displayed in the dialog
 * @returns {boolean} boolean response of user
 */
export function dialogConfirmation(deleteMsg: string) {
    return dialog.showMessageBoxSync({
        message: deleteMsg,
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultId: 1,
        cancelId: 1
    }) === 0
}


/**
 * Removes the item from the database
 * @param id id of the item to be removed
 * @param type type of item, either 'note' or 'folder'
 * @returns the an array of object containing the removed item data or null if the user cancels deletion
 */
export async function removeItem(id: string, type: ItemTypes): Promise<deleteResType[]|null> {
    if (type === 'note') {                                                                      // if the item is a note type
        return Notedb.get(id).then((doc: $FixMe) => {
            // Initialize the dialog for confirmation
            let deleteMsg = `Are you sure you want to delete the Note ${doc.name}`
            let deleteRes = dialogConfirmation(deleteMsg)

            // if user agrees, delete the item
            if (deleteRes) return Notedb.remove(doc).then((result: deleteResType) => [result])
            .catch((err: any) => console.error('ERROR: deleting note error', err))
            else return null
        })
    } else {                                                                                   // else, its a folder type
        return Notedb.get(id).then((doc: $FixMe) => {
            // collect all children files
            return removeFilesOfFolder(id).then(result => {
                // add the item to be deleted with the children files
                let batchDelete = [...result, doc]

                // Initialize the dialog for confirmation
                let batchNames = batchDelete.map(doc => doc.name)
                let deleteMsg = `Are you sure you want to delete these files and folders \n${batchNames.join('\n')}`
                let deleteRes = dialogConfirmation(deleteMsg)
                
                // if user agrees, batch delete
                if (deleteRes) {
                    batchDelete = batchDelete.map(doc => { return {...doc, _deleted: true} })
                    return Notedb.bulkDocs(batchDelete)
                    .then((result: deleteResType) => {
                        Notedb.allDocs({include_docs: true}).then(console.log)
                        console.log('doc result', result)
                        return result
                    })
                }
                else return null
            })
        })
    }
}

/**
 * Used to get the files of the folder id
 * @param id folder id
 * @returns a list of files and its data
 */
async function removeFilesOfFolder(id: string): Promise<UniDocType[]> {
    return Notedb.find({
        selector: {
            parentFolder: id
        },
        use_index: 'parentFolder-indexes'
    }).then(async (result: {docs: UniDocType[]}) => {
        let PromiseDocs = result.docs.map(async doc => {
            if (doc.type === 'folder') {
                let foldersRemove = await removeFilesOfFolder(doc._id)
                if (foldersRemove.length > 0) return [...foldersRemove, doc]
            }
            return [doc]
        })
        let docs = await Promise.all(PromiseDocs)
        return docs.flat()
    })
}


/**
 * Used to update the properties of an item
 * @param itemId id of the item
 * @param property name of the property to be edited
 * @param newValue new value of the property
 * @returns return the updated data of the item
 */
export async function updateItem(itemId: string, property: string, newValue: any): Promise<UniDocType|null> {
    type UpdateDocType = {[key: string]: any}
    return Notedb.get(itemId).catch((err: any) => console.log('Update item: Get err', err)).then((result: UpdateDocType) => {
        // if the prev value is the same with the new value
        if (property !== 'notes' && result[property] === newValue) {
            // then cancel update
            return console.log('cancel update')
        }

        // update the doc
        let doc = result
        doc[property] = newValue

        // send the updated doc to the db
        return Notedb.put(doc).catch((err: any) => console.log('update item err', err)).then(() => doc)
    }).catch((err: any) => console.log(err))
}

// returns an object of openned folders as keys with values set to false
export async function getOpenFolders(callback: $FixMe) {
    return Notedb.createIndex({
        index: {
            fields: ['type', 'open']
        },
        ddoc: 'openned-folders-indexes'
    }).then(() => {
        return Notedb.find({
            selector: {
                type: 'folder',
                open: true
            }
        })
    }).then((result: $FixMe) => {
        let parsedResult: {[key: string]: any} = {}
        result.docs.forEach((doc: $FixMe) => {
            parsedResult[doc._id] = false
        });
        if (callback) callback(parsedResult)
        else return parsedResult
    }).catch((err: $FixMe) => console.error(`ERROR: failed in getting openned folders`, err))
}


// ================================================ TAB AND NOTE FUNCTIONS ================================================
/**
 * Used to fetch previously openned notes from the electron store
 * @returns returns an array of note ids that are previously openned
 */
export async function getOpenTabs() {
    let openTabs: Array<string> = store.get('openTabs') || []
    console.log('fetch tabs db', openTabs)
    let PromiseTabs = openTabs.map((tabId: string) => {
        return Notedb.get(tabId).then((doc: $FixMe) => {
            return {
                _id: doc._id,
                name: doc.name,
                notes: doc.notes,
                saved: true
            }
        })
    })
    return Promise.all(PromiseTabs)
}

/**
 * Used to fetch the previously openned note from the electron store
 * @returns retunrs the previous active tab
 */
export function getLastActiveTab(): string | null {
    return store.get('activeTab') || null
}

export async function addOpenTabDB(noteId: string): Promise<TabType> {
    return Notedb.get(noteId)
    .then((doc: any) => {
        if (doc.type ==- 'folder') return console.error(`ERROR: doc ${doc._id} is not a note`)
        return {
            _id: doc._id,
            saved: true,
            name: doc.name,
            notes: doc.notes
        }
    })
}


export async function updateNotesDb(noteId: string, newNotes: any[]): Promise<TabType> {
    return Notedb.get(noteId)
    .then((doc: any) => {
        let newDoc = doc
        newDoc.notes = newNotes

        return {
            _id: newDoc._id,
            name: newDoc.name,
            notes: newDoc.notes,
            saved: true
        }
    })
}


// ================================================ DEVELOPER HELPER FUNCTIONS ================================================
// viewing the db docs
export function viewDB() {
    Notedb.allDocs({include_docs: true}).then(console.log).then(() => {
        return Notedb.getIndexes().then(console.log)
    })
}


// ================================================ REDUX SYNC FUNCTIONS ================================================
/**
 * A Function that syncs the redux state with pouchdb
 * @param state 
 */
export function syncStateToDb(state: RootState) {
    console.log('syncing db')
    for (const [stateItem, stateValue] of Object.entries(state)) {
        switch (stateItem) {
            case 'Tabs':
                // @ts-ignore
                store.set('openTabs', stateValue!.map(tabData => tabData._id))
                break;
            case 'ActiveTab':
                if (stateValue) store.set('activeTab', stateValue)
                else store.delete('activeTab')
                break;
        }
    }
}

/**
 * Used to fetch the folders and notes from the database and parse in into an object/dictionary
 * @returns returns an object containing the folders and notes
 */
export async function getFoldersAndNotes(): Promise<NotesAndFolderState> {
    let rootFolderData = await Notedb.get('root-folder').catch((result: $FixMe) => result)
    // if root folder does not exist the initialize root folder
    if (rootFolderData.error && rootFolderData.reason === 'missing') await initializeRootFiles()

    return Notedb
    // create index
    .createIndex({
        index: {fields: ['type']},
        ddoc: 'db-types'
    })
    // get all folders and files
    .then(() => {
        return Notedb.find({
            selector: {
                'type': { $exists: true }
            }
        }).catch((err: any) => console.error(`ERROR: cannot find folders and files`, err))
    })
    .then(async (result: $FixMe) => {
        let opennedTabs = store.get('openTabs')
        let FolderNotesObj: {[key: string]: any} = {}
        for (let i = 0; i < result.docs.length; i++) {
            const doc = result.docs[i];
            let FolderChildren = await findFilesOf(doc._id)
            FolderNotesObj[doc._id] = doc.type === 'note'
                ? { ...doc, open: opennedTabs.includes(doc._id) }
                : { ...doc, children: FolderChildren }
            // if (FolderNotesObj[doc._id].notes) delete FolderNotesObj[doc._id].notes
        }
        console.log('folders and notes initialized', FolderNotesObj)
        return FolderNotesObj
    })
}



