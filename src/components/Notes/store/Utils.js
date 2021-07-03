const Pouchdb = window.require('pouchdb-browser')
const PouchdbFind = window.require('pouchdb-find')
Pouchdb.plugin(window.require('relational-pouch'))
Pouchdb.plugin(PouchdbFind)

const path = window.require('path')
const { app, dialog } = window.require('@electron/remote')

const Store = window.require('electron-store')


// ================================================ VARIABLE INITIALIZATIONS ================================================
const store = new Store()
export var UserSettingsdb = new Pouchdb(path.join(app.getPath('userData'), 'userSettings'))
export var Notedb = new Pouchdb(path.join(app.getPath('userData'), 'noteDb'))
Notedb.setSchema([
    {
        singular: 'folder',
        plural: 'folders',
        relations: {
            parentFolder: {belongsTo: 'folder'},
            subFolders: {hasMany: 'folder'},
            notes: {hasMany: 'note'}
        }
    },
    {
        singular: 'note',
        plural: 'notes',
        relations: {
            parentFolder: {belongsTo: 'folder'}
        }
    }
])


// ================================================ FOLDER FUNCTIONS FUNCTIONS ================================================
// Initializing root folders if the db is empty
async function initializeRootFiles(setSync) {
    // Initialize item ids
    let baseId = new Date().toISOString()
    let initialNoteId = baseId+10
    let initialFolderId = baseId

    // add to database
    Notedb.put({
        _id: 'root-folder',
        name: 'root-folder',
    }).then(() => {
        return Notedb.put({
            _id: initialFolderId,
            name: 'parent folder 1',
            type: 'folder',
            open: false,
            parentFolder: 'root-folder'
        }).then(() => {
            return Notedb.put({
                _id: initialFolderId+3,
                name: 'sub folder 1',
                type: 'folder',
                open: false,
                parentFolder: initialFolderId
            })
        }).then(() => {
            return Notedb.put({
                _id: initialNoteId+2,
                name: 'sub note 1',
                type: 'note',
                parentFolder: initialFolderId,
                notes: []
            })
        })
    }).then(() => {
        return Notedb.put({
            _id: initialFolderId+2,
            name: 'parent folder 2',
            type: 'folder',
            open: false,
            parentFolder: 'root-folder'
        }).then(() => {
            return Notedb.put({
                _id: initialNoteId,
                name: 'parent note 1',
                type: 'note',
                parentFolder: initialFolderId+2,
                notes: []
            })
        })
    }).then(() => {
        return Notedb.put({
            _id: initialNoteId+3,
            name: 'parent note 1',
            type: 'note',
            parentFolder: 'root-folder',
            notes: []
        })
    }).then(result => {
        console.log('bulk put completed', result)
        setSync()                                       // get root files if success
    }).catch(error => {
        console.log('unexpected error occured', error)
    })
}

// find the files of the folder id
export async function findFolderFiles(id, setFiles) {
    // create and index and find the children of folder id
    let FolderData = await Notedb.createIndex({
        index: {fields: ['parentFolder']},
        ddoc: 'parentFolder-indexes'
    }).then(() => {
        return Notedb.find({
            selector: {
                'parentFolder': id
            }
        })
    })
    FolderData = FolderData.docs

    // sort the folder data if items are > 1
    if (FolderData.length > 1) FolderData = FolderData.sort((doc1, doc2) => {
        if (doc1.type === doc2.type) return doc1.name.localeCompare(doc2.name)
        return doc1.type === 'folder' ? -1 : 1
    }).map(doc => {
        if (doc.type === 'note') {
            delete doc.notes
            return doc
        } else return doc
    })
    
    // restructure the folder data in a way react can understand
    if (id === 'root-folder' && FolderData.length < 1) initializeRootFiles(() => findFolderFiles(id, setFiles))

    // fail safe to prevent loops
    if (!id) FolderData = []

    // update the react folder component
    if (setFiles) setFiles(FolderData)
    else return await FolderData
}

// add a folder/note to the db
export async function addItem(id, type, itemName, setFiles) {
    // pre initialize item Obj
    let itemObj = {
        _id: `${new Date().toISOString()}-${Math.random().toString(16).slice(-4)}`,
        name: itemName,
        parentFolder: id,
        open: false,
        type: type
    }

    // if item is note then add additional
    if (type === 'note') {
        itemObj.notes = []
        delete itemObj.open
    }

    console.log('generating item', itemObj)

    Notedb.put(itemObj).then(() => {
        console.log('item saved to db successfully')
        findFolderFiles(id, setFiles)
    })
}

// remove a folder or note
export async function removeItem(id, type, parentFolderID, setFiles) {
    if (type === 'note') {
        console.log('deleting note')
        return Notedb.get(id).then(doc => {
            let deleteMsg = `Are you sure you want to delete the Note ${doc.name}`
            let deleteRes = dialog.showMessageBoxSync({
                message: deleteMsg,
                type: 'question',
                buttons: ['Yes', 'No'],
                defaultId: 1,
                cancelId: 1,
            })
            if (deleteRes === 0) return Notedb.remove(doc).then(() => {
                findFolderFiles(parentFolderID, setFiles)
                return [id]
            })
        })
    } else {
        return Notedb.get(id).then(doc => {
            return removeFilesOfFolder(id).then(result => {
                let batchDelete = [...result, doc]

                let batchNames = batchDelete.map(doc => doc.name)
                let deleteMsg = `Are you sure you want to delete these files and folders \n${batchNames.join('\n')}`
                let deleteBatch = dialog.showMessageBoxSync({
                    message: deleteMsg,
                    type: 'question',
                    buttons: ['Yes', 'No'],
                    defaultId: 1,
                    cancelId: 1,
                })
                
                if (deleteBatch === 0) {
                    batchDelete = batchDelete.map(doc => { return {...doc, _deleted: true} })
                    return Notedb.bulkDocs(batchDelete).then(() => {
                        findFolderFiles(parentFolderID, setFiles)
                        return batchDelete.filter(doc => doc.type !== 'folder').map(doc => doc._id)
                    })
                }
            })
        }).then(result => {
            Notedb.allDocs({include_docs: true}).then(console.log)
            return result
        })
    }
}

// used in conjuction with removeItem() to remove sub folders
async function removeFilesOfFolder(id) {
    return Notedb.find({
        selector: {
            parentFolder: id
        },
        use_index: 'parentFolder-indexes'
    }).then(async result => {
        let docs = await result.docs.map(async doc => {
            if (doc.type === 'folder') {
                let PromiseDocs = await findFolderFiles(doc._id)
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
export async function updateItem(itemData, property, newValue, setFiles) {
    return Notedb.get(itemData._id).catch(err => console.log('get err', err)).then(result => {
        let doc = result
        doc[property] = newValue

        return Notedb.put(doc).catch(err => console.log('put err', err))
    }).then(() => {
        if (setFiles) findFolderFiles(itemData.parentFolder, setFiles)
        else return 
    }).catch(err => console.log(err))
}

export async function getOpenFolders(callback) {
    Notedb.createIndex({
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
    }).then(result => {
        let parsedResult = {}
        result.docs.forEach(doc => {
            parsedResult[doc._id] = false
        });
        callback(parsedResult)
    }).catch(console.log)
}

// ================================================ TAB AND NOTE FUNCTIONS ================================================
export function getOpenTabs() {
    return store.get('openTabs') || []
}

export async function addOpenTab(id, noteName) {
    store.set('openTabs', [...getOpenTabs(), {id: id, noteName: noteName}])
    return Notedb.get(id)
}

export function removeOpenTab(id) { 
    let newTabArray = getOpenTabs().filter(tab => tab.id !== id)
    store.set('openTabs', newTabArray)
    return newTabArray
}

export async function getLastActiveTab() {
    let lastActiveTabId = store.get('activeTab')

    if (!lastActiveTabId) return null
    return Notedb.get(lastActiveTabId).then(result => {
        if (result.notes.length === 0) return {
            ...result,
            notes: [{
                id: Math.random().toString(16).slice(-8),
                content:"",
                insideNote: null
            }]
        }
        return result
    })
}

export async function setLastActiveTab(id) {
    console.log('setting last active', id)
    store.set('activeTab', id)
    if (id) return Notedb.get(id).then(result => {
        if (result.notes.length === 0) return {
            ...result,
            notes: [{
                id: Math.random().toString(16).slice(-8),
                content:"",
                insideNote: null
            }]
        }

        return result
    })
}

// ================================================ DEVELOPER HELPER FUNCTIONS ================================================
// viewing the db docs
export function viewDB() {
    Notedb.allDocs({include_docs: true}).then(console.log).then(() => {
        return Notedb.getIndexes().then(console.log)
    })
}