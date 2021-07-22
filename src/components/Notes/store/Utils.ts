import { RootState } from "../../../redux/store"

const Pouchdb = window.require('pouchdb-browser')
const PouchdbFind = window.require('pouchdb-find')
Pouchdb.plugin(PouchdbFind)

const path = window.require('path')
const { app, dialog } = window.require('@electron/remote')

const Store = window.require('electron-store')


export interface NoteDoc {
    _id: string
    _rev?: string
    name: string
    type: string
    parentFolder: string
    notes: Array<any>
}
export interface FolderDoc {
    _id: string
    _rev?: string
    name: string
    type: string
    parentFolder: string
    open: boolean
}

type DocType = NoteDoc|FolderDoc
type $FixMe = any


// ================================================ VARIABLE INITIALIZATIONS ================================================
const store = new Store()
export var UserSettingsdb = new Pouchdb(path.join(app.getPath('userData'), 'userSettings'))
export var Notedb = new Pouchdb(path.join(app.getPath('userData'), 'noteDb'))
Notedb.allDocs({ include_docs: true }).then(console.log)


// ================================================ FOLDER FUNCTIONS FUNCTIONS ================================================
// Initializing root folders if the db is empty
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

export async function findFilesOf(folderId: string) {
    let FolderData = await Notedb.createIndex({
        index: { fields: ['parentFolder'] },
        ddoc: 'parentFolder-indexes'
    }).then(() => Notedb.find({
        selector: {
            'parentFolder': folderId
        }
    }))
    .then((selectorResult: {docs: any}) => selectorResult.docs)
    .catch((err: any) => console.error(`ERROR: cannot find files of ${folderId}`, err))

    // sort the folderData
    if (FolderData.length > 0) FolderData = FolderData.sort((doc1: DocType, doc2: DocType) => {
        if (doc1.type === doc2.type) return doc1.name.localeCompare(doc2.name)
        return doc1.type === 'folder' ? -1 : 1
    }).map((doc: DocType) => doc._id)
    // FolderData = FolderData.map(doc => {return { _id: doc._id, type: doc.type, name: doc.name }})
    // else if empty db and is root folder then initialize starting files
    // else if (folderId === 'root-folder' && FolderData.length < 1) return initializeRootFiles()
    return await FolderData
}

// find the files of the folder id
export async function findFolderFiles(id: string) {
    // create and index and find the children of folder id
    let RawFolderData: {docs: DocType[]} = id ? await Notedb.createIndex({
        index: {fields: ['parentFolder']},
        ddoc: 'parentFolder-indexes'
    }).then(() => {
        return Notedb.find({
            selector: {
                'parentFolder': id
            }
        }).catch((err: any) => console.error(`ERROR: cannot find files of ${id}`, err))
    }) : []         // set to empty array if there is no id
    let FolderData = RawFolderData.docs

    // sort the folder data if items are > 1
    if (FolderData.length > 1) FolderData = FolderData.sort((doc1, doc2) => {           // sort the files, folders first alphabetically
            if (doc1.type === doc2.type) return doc1.name.localeCompare(doc2.name)
            return doc1.type === 'folder' ? -1 : 1
        }).map((doc: $FixMe) => {                                                                 // remove the notes data for optimization
            if (doc.type === 'note') {
                delete doc.notes
                return doc
            } else return doc
        })

    // update the react folder component
    else return await FolderData
}


// add a folder/note to the db
export async function addItem(id: string, type: string, itemId: string, itemName: string) {
    let newItemId = itemId // `${new Date().toISOString()}-${Math.random().toString(16).slice(-4)}`
    // pre initialize item Obj
    let itemObj: $FixMe = {
        _id: newItemId,
        name: itemName,
        parentFolder: id,
        open: false,
        type: type
    }

    // if item is note then add additional
    if (type === 'note') {
        itemObj.notes = [{
            id: Math.random().toString(16).slice(-8),
            content:"",
            insideNote: null
        }]
        delete itemObj.open
    }

    console.log('generating item', itemObj)

    // adding item to db
    return Notedb.put(itemObj).then(() => {
        return Notedb.get(newItemId)
    }).catch((err: any) => console.error('ERROR: adding item error', err))
}

export function dialogConfirmation(deleteMsg: string) {
    return dialog.showMessageBoxSync({
        message: deleteMsg,
        type: 'question',
        buttons: ['Yes', 'No'],
        defaultId: 1,
        cancelId: 1
    })
}

// remove a folder or note
export async function removeItem(id: string, type: string) {
    if (type === 'note') {                                                                      // if the item is a note type
        return Notedb.get(id).then((doc: $FixMe) => {
            // Initialize the dialog for confirmation
            let deleteMsg = `Are you sure you want to delete the Note ${doc.name}`
            let deleteRes = dialogConfirmation(deleteMsg)

            // if user agrees, delete the item
            if (deleteRes === 0) return Notedb.remove(doc).then((result: $FixMe) => [result])
            .catch((err: any) => console.error('ERROR: deleting note error', err))
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
                if (deleteRes === 0) {
                    batchDelete = batchDelete.map(doc => { return {...doc, _deleted: true} })
                    return Notedb.bulkDocs(batchDelete)
                }
            })
        }).then((result: $FixMe) => {
            Notedb.allDocs({include_docs: true}).then(console.log)
            return result
        })
    }
}

// used in conjuction with removeItem() to remove sub folders
async function removeFilesOfFolder(id: string) {
    return Notedb.find({
        selector: {
            parentFolder: id
        },
        use_index: 'parentFolder-indexes'
    }).then(async (result: $FixMe) => {
        let docs = await result.docs.map(async (doc: $FixMe) => {
            if (doc.type === 'folder') {
                let PromiseDocs = await findFolderFiles(doc._id) || []
                if (PromiseDocs.length > 0) return removeFilesOfFolder(doc._id).then(files => { return [...files, doc] })
                return [doc]
            }
            return [doc]
        })
        docs = await Promise.all(docs)
        docs = [].concat.apply([], docs)
        return docs
    })
}


// updates a property of the doc in the database
export async function updateItem(itemData: $FixMe, property: string, newValue: $FixMe) {
    return Notedb.get(itemData._id).catch((err: any) => console.log('Update item: Get err', err)).then((result: $FixMe) => {
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
// Used for fetching
export async function getOpenTabs() {
    let openTabs = store.get('openTabs') || []
    return openTabs
}


// runs on initial render to get the last active note/tab
export function getLastActiveTab() {
    return store.get('activeTab') || null
}

// Used to set the active tab in the localStorage and returns the object of the id arg
export function setLastActiveTab(id: string) {
    if (id) store.set('activeTab', id)
    else store.delete('activeTab')
}

// ================================================ DEVELOPER HELPER FUNCTIONS ================================================
// viewing the db docs
export function viewDB() {
    Notedb.allDocs({include_docs: true}).then(console.log).then(() => {
        return Notedb.getIndexes().then(console.log)
    })
}


// ================================================ REDUX SYNC FUNCTIONS ================================================
export function syncStateToDb(state: RootState) {
    console.log('syncing db')
    for (const [stateItem, stateValue] of Object.entries(state)) {
        switch (stateItem) {
            case 'Tabs':
                store.set('openTabs', stateValue)
                break;
            case 'ActiveTab':
                setLastActiveTab(stateValue)
                break;
        }
    }
}


export async function getFoldersAndNotes() {
    let rootFolderData = await Notedb.get('root-folder').catch((result: $FixMe) => result)
    if (rootFolderData.error && rootFolderData.reason === 'missing') await initializeRootFiles()
    return Notedb.createIndex({
        index: {fields: ['type']},
        ddoc: 'db-types'
    }).then(() => {
        return Notedb.find({
            selector: {
                'type': { $exists: true }
            }
        }).catch((err: any) => console.error(`ERROR: cannot find folders and files`, err))
    }).then(async (result: $FixMe) => {
        let opennedTabs = store.get('openTabs')
        let FolderNotesObj: {[key: string]: any} = {}
        for (let i = 0; i < result.docs.length; i++) {
            const doc = result.docs[i];
            let FolderChildren = await findFilesOf(doc._id)
            FolderNotesObj[doc._id] = doc.type === 'note'
                ? { ...doc, open: opennedTabs.includes(doc._id) }
                : { ...doc, children: FolderChildren }
            if (FolderNotesObj[doc._id].notes) delete FolderNotesObj[doc._id].notes
        }
        return FolderNotesObj
    })
}



