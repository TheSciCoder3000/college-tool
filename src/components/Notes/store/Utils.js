const Pouchdb = window.require('pouchdb-browser')
const PouchdbFind = window.require('pouchdb-find')
Pouchdb.plugin(PouchdbFind)

const path = window.require('path')
const { app, dialog } = window.require('@electron/remote')

const Store = window.require('electron-store')


// ================================================ VARIABLE INITIALIZATIONS ================================================
const store = new Store()
export var UserSettingsdb = new Pouchdb(path.join(app.getPath('userData'), 'userSettings'))
export var Notedb = new Pouchdb(path.join(app.getPath('userData'), 'noteDb'))


// ================================================ FOLDER FUNCTIONS FUNCTIONS ================================================
// Initializing root folders if the db is empty
async function initializeRootFiles(setSync) {
    // add to database
    Notedb.bulkDocs([
        {
            _id: 'root-folder',
            name: 'root-folder'
        }
    ]).then(result => {
        console.log('bulk put completed', result)
        setSync()                                       // get root files if success
    }).catch(error => {
        console.log('unexpected error occured', error)
    })
}

// find the files of the folder id
export async function findFolderFiles(id, setFiles) {
    // create and index and find the children of folder id
    let FolderData = id ? await Notedb.createIndex({
        index: {fields: ['parentFolder']},
        ddoc: 'parentFolder-indexes'
    }).then(() => {
        return Notedb.find({
            selector: {
                'parentFolder': id
            }
        }).catch(err => console.error(`ERROR: cannot find files of ${id}`, err))
    }) : []         // set to empty array if there is no id
    FolderData = FolderData.docs

    // sort the folder data if items are > 1
    if (FolderData.length > 1) FolderData = FolderData.sort((doc1, doc2) => {           // sort the files, folders first alphabetically
            if (doc1.type === doc2.type) return doc1.name.localeCompare(doc2.name)
            return doc1.type === 'folder' ? -1 : 1
        }).map(doc => {                                                                 // remove the notes data for optimization
            if (doc.type === 'note') {
                delete doc.notes
                return doc
            } else return doc
        })
    // else if empty db, the initialize starting files of db
    else if (id === 'root-folder' && FolderData.length < 1) initializeRootFiles(() => findFolderFiles(id, setFiles))

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
        findFolderFiles(id, setFiles)
        return itemObj
    }).catch(err => console.error('ERROR: adding item error', err))
}

// remove a folder or note
export async function removeItem(id, type, parentFolderID, setFiles) {
    if (type === 'note') {                                                                      // if the item is a note type
        return Notedb.get(id).then(doc => {
            // Initialize the dialog for confirmation
            let deleteMsg = `Are you sure you want to delete the Note ${doc.name}`
            let deleteRes = dialog.showMessageBoxSync({
                message: deleteMsg,
                type: 'question',
                buttons: ['Yes', 'No'],
                defaultId: 1,
                cancelId: 1,
            })

            // if user agrees, delete the item
            if (deleteRes === 0) return Notedb.remove(doc).then(() => {
                findFolderFiles(parentFolderID, setFiles)
                return [id]
            }).catch(err => console.error('ERROR: deleting note error', err))
        })
    } else {                                                                                   // else, its a folder type
        return Notedb.get(id).then(doc => {
            // collect all children files
            return removeFilesOfFolder(id).then(result => {
                // add the item to be deleted with the children files
                let batchDelete = [...result, doc]

                // Initialize the dialog for confirmation
                let batchNames = batchDelete.map(doc => doc.name)
                let deleteMsg = `Are you sure you want to delete these files and folders \n${batchNames.join('\n')}`
                let deleteBatch = dialog.showMessageBoxSync({
                    message: deleteMsg,
                    type: 'question',
                    buttons: ['Yes', 'No'],
                    defaultId: 1,
                    cancelId: 1,
                })
                
                // if user agrees, batch delete
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
    return Notedb.get(itemData._id).catch(err => console.log('Update item: Get err', err)).then(result => {
        // if the prev value is the same with the new value
        if (property !== 'notes' && result[property] === newValue) {
            // then cancel update
            return
        }

        // update the doc
        let doc = result
        doc[property] = newValue

        // send the updated doc to the db
        return Notedb.put(doc).catch(err => console.log('update item err', err)).then(() => doc)
    }).then(newDoc => {
        // after finshing the procedures, update the files of the parent cont
        if (setFiles) findFolderFiles(itemData.parentFolder, setFiles)
        else return newDoc
    }).catch(err => console.log(err))
}

// returns an object of openned folders as keys with values set to false
export async function getOpenFolders(callback) {
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
    }).then(result => {
        let parsedResult = {}
        result.docs.forEach(doc => {
            parsedResult[doc._id] = false
        });
        if (callback) callback(parsedResult)
        else return parsedResult
    }).catch(err => console.error(`ERROR: failed in getting openned folders`, err))
}

// ================================================ TAB AND NOTE FUNCTIONS ================================================
export async function getOpenTabs() {
    let openTabs = store.get('openTabs') || []
    return openTabs
    if (openTabs.length === 0) return openTabs

    return Notedb.allDocs({
        include_docs: true,
        keys: openTabs
    }).catch(err => console.error('ERROR: get open tabs error', err)).then(result => result.rows.map(row => { return {...row.doc, saved:true} }))
}


// Used when adding another tab
export async function addOpenTab(id, prevTabArray, redux=false) {
    // fetch the data from the db
    return Notedb.get(id).catch(err => console.error('ERROR: Add open tab - get error', err)).then(result => {
        // add to the ids to localStorage
        // store.set('openTabs', [...store.get('openTabs'), result._id])

        // if used for redux then return the result only
        if (redux) return { ...result, saved: true }

        // add the doc to the array with an extra "saved" field
        return [...prevTabArray, { ...result, saved: true }]
    })
}

export async function removeOpenTab(id) { 
    // add the id to open tabs
    store.set('openTabs', store.get('openTabs').filter(tab => tab !== id))
    return 'success'
}

// runs on initial render to get the last active note/tab
export function getLastActiveTab() {
    return store.get('activeTab')
}

// Used to set the active tab in the localStorage and returns the object of the id arg
export function setLastActiveTab(id) {
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

// Used for listenning db changes
export function getNotedbListenner() {
    return Notedb.changes({
        since: 'now',
        live: true,
        include_docs: true,
        filter: function (doc) {
            return doc.type === 'note' || doc._deleted === true
        }
    })
}




// ================================================ REDUX SYNC FUNCTIONS ================================================
export function syncStateToDb(state) {
    console.log('syncing db')
    for (const [stateItem, stateValue] of Object.entries(state)) {
        switch (stateItem) {
            case 'Tabs':
                store.set('openTabs', stateValue)
                break;
            case 'ActiveTab':
                store.set('activeTab', stateValue)
                break;
        }
    }
}


export async function getFoldersAndNotes() {
    return Notedb.createIndex({
        index: {fields: ['type']},
        ddoc: 'db-types'
    }).then(() => {
        return Notedb.find({
            selector: {
                'type': { $exists: true }
            }
        }).catch(err => console.error(`ERROR: cannot find folders and files`, err))
    }).then(result => {
        let opennedTabs = store.get('openTabs')
        let FolderNotesObj = {}
        result.docs.forEach(doc => {
            FolderNotesObj[doc._id] = doc.type === 'note'
                ? { ...doc, open: opennedTabs.includes(doc._id) }
                : doc
        })
        return FolderNotesObj
    })
}



