const Pouchdb = window.require('pouchdb-browser')
const PouchdbFind = window.require('pouchdb-find')
Pouchdb.plugin(PouchdbFind)

const path = window.require('path')
const { app, dialog } = window.require('@electron/remote')

var UserSettingsdb = new Pouchdb(path.join(app.getPath('userData'), 'userSettings'))
var Notedb = new Pouchdb(path.join(app.getPath('userData'), 'noteDb'))
Notedb.allDocs({ include_docs: true }).then(console.log)

// ============================= DATABASE TYPES =============================
type ItemTypes = 'folder' | 'note'

// ============================= DATABASE FUNCTIONS =============================
export async function addItem(id: string, type: ItemTypes, itemId: string, itemName: string) {
    // return Notedb.put(_)
    // .then(() => {
    //     return Notedb.get
    // })
}