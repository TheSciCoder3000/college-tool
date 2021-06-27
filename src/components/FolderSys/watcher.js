const chokidar = window.require('chokidar')
var showInLogFlag = false;

export const WATCHER_EVENTS = {
    NOTE_ADD: 'note-add',
    FOLDER_ADD: 'folder-add',
    NOTE_CHANGED:'note-changed',
    NOTE_DELETED: 'note-deleted',
    FOLDER_DELETED: 'folder-deleted',
}

export default function StartWatcher(path, syncFiles){
    let watcher = chokidar.watch(path, {
        ignored: /[\/\\]\./,
        persistent: true
    });

    function onWatcherReady(){
        console.info('From here can you check for real changes, the initial scan has been completed.');
        showInLogFlag = true;
    }

    watcher
    .on('add', function(path) {
        // console.log('File', path, 'has been added');
        syncFiles(WATCHER_EVENTS.NOTE_ADD)
    })
    .on('addDir', function(path) {
        //  console.log('Directory', path, 'has been added');
         syncFiles(WATCHER_EVENTS.FOLDER_ADD)
     })
    .on('change', function(path) {
        console.log('File', path, 'has been changed');
        // syncFiles()
    })
    .on('unlink', function(path) {
        // console.log('File', path, 'has been removed');
        syncFiles(WATCHER_EVENTS.NOTE_DELETED)
    })
    .on('unlinkDir', function(path) {
        // console.log('Directory', path, 'has been removed');
        syncFiles(WATCHER_EVENTS.FOLDER_DELETED)
    })
    .on('ready', onWatcherReady)
    
    return watcher
}
