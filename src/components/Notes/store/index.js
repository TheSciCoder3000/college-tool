const Store = window.require('electron-store')

const store = new Store()

const fs = window.require('fs')
const pathModule = window.require('path')
const { dialog } = window.require('@electron/remote')

// retrieving userTabs from localStorage
export function getUserTabs() {
    let userTabs = store.get('userTabs')
    if (!userTabs) return []                                    // if empty return an empty list of tabs

    // return an array of tab details
    return userTabs.filter(function (tab) {
        if (fs.existsSync(tab)) return true
        return false
    }).map(tabPath => {
        let tab = fs.readFileSync(tabPath, {encoding: 'utf8'})  // read raw tab data
        let jsonTab
        try {                                                   // Try parsing raw tab data
            jsonTab = JSON.parse(tab)
        } catch (error) {                                       // catch syntax error and assign jsonTab to an [] with an empty noteRow
            console.log(`Error: could not parse ${pathModule.basename(tabPath)}`)
            jsonTab = [{
                id: Math.random().toString(16).slice(-8),
                content: '',
                insideNote: null
            }]
        }

        // return a dictionary containing the note details
        return {
            noteName: pathModule.basename(tabPath).split('.').slice(0, -1).join('.'),
            notePath: tabPath,
            notes: jsonTab
        }
    })

}

// Setting userTabs to localStorage
export function setUserTabs(userTabs) {
    let userTabsPath = userTabs.map(tab => tab.notePath)        // mapping to a list of tabPaths
    store.set('userTabs', userTabsPath)                         // Assigning userTabs to tabPaths
}


// Retrieving the last active tab from localStorage
export function getLastActiveTab() {
    let lastActiveTabPath = store.get('activeTab')
    if (!lastActiveTabPath) return {notes: []}

    if (!fs.existsSync(lastActiveTabPath)) return {notes: []}  // File does not exist return null
    let lastActiveTab = fs.readFileSync(lastActiveTabPath, {encoding: 'utf8'})

    let activeTabJson
    try {                                                      // Try parsing lastActiveTab raw data
        activeTabJson = JSON.parse(lastActiveTab)
    } catch(err) {                                             // catch syntax error and set activeTabJson to an [] witn an empty noteRow
        console.log('empty note file')
        activeTabJson = [{
            id: Math.random().toString(16).slice(-8),
            content: '',
            insideNote: null
        }]
    }

    // return dictionary containing the details of the active tab
    return {
        noteName: pathModule.basename(lastActiveTabPath).split('.').slice(0, -1).join('.'),
        notePath: lastActiveTabPath,
        notes: activeTabJson
    }
}

// Setting activeTab
export function setLastActiveTab(activeTab) {
    let activeTabPath = activeTab.notePath                  // Retrieving the path of activeTab
    if (!fs.existsSync(activeTabPath)) dialog.showErrorBox('This file no longer exist', `The file "${activeTab.noteName}" no longer exist in this directory "${activeTabPath}", Pls close this tab to stop this error`)
    store.set('activeTab', activeTabPath)                   // Setting it to activeTab localStorage
}


// checks the localStorage if folderPath is one of the openned folders
export function isFolderOpen(folderPath) {
    let folderPaths = store.get('openned-folders')
    if (!folderPaths) return false
    return folderPaths.includes(folderPath)
}

// add or remove a folderPath from the localStorage of openned folders
export function setFolderOpen(folderPath, openned, persistence=false) {
    let folderPaths = store.get('openned-folders') ? store.get('openned-folders') : []
    if (openned) {
        if (!folderPaths.includes(folderPath)) folderPaths.push(folderPath)
    } else folderPaths = folderPaths.filter(folder => folder !== folderPath)
    store.set('openned-folders', folderPaths)
}