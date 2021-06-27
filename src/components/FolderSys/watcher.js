const chokidar = window.require('chokidar')
var showInLogFlag = false;

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
        syncFiles()
    })
    .on('addDir', function(path) {
        //  console.log('Directory', path, 'has been added');
         syncFiles()
     })
    .on('change', function(path) {
        console.log('File', path, 'has been changed');
        // syncFiles()
    })
    .on('unlink', function(path) {
        // console.log('File', path, 'has been removed');
        syncFiles()
    })
    .on('unlinkDir', function(path) {
        // console.log('Directory', path, 'has been removed');
        syncFiles()
    })
    .on('ready', onWatcherReady)
    
    return watcher
}
