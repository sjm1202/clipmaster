const path = require("path");
const {
    app,
    BrowserWindow,
    clipboard,
    globalShortcut,
    Menu,
    Tray,
    systemPreferences,
    nativeTheme
} = require("electron");
let clippings = [];
let tray = null;
let browserWindow = null;

const getIcon = () => {
    if(process.platform === "win32"){
        return "../assets/clip_light.npg";
    }
    // if(systemPreferences.isDarkMode()){
    if(nativeTheme.shouldUseDarkColors){
        return "../assets/clip_light.png";
    }else{
        return "../assets/clip_dark.png";
    }
}
app.on("ready", () => {
    if(app.dock){
        app.dock.hide();
    }
    tray = new Tray(path.join(__dirname, getIcon()));
    tray.setPressedImage(path.join(__dirname, '../assets/clip_light.png'));
    if(process.platform === "win32"){
        tray.on("click", tray.popUpContextMenu);
    }
    browserWindow = new BrowserWindow({
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    })
    browserWindow.loadFile(path.join(__dirname, 'index.html'));
    const activationShortcut = globalShortcut.register("CommandOrControl+Option+C", ()=>{
        tray.popUpContextMenu();
    })
    if(!activationShortcut){
        console.log("Clobal activation shortcut fail to regiester!")
    }

    const newClippingShortcut = globalShortcut.register("CommandOrControl+Shift+Option+C", () => {
        const clipping = addClipping();
        console.log("newClippingShortcut")
        if(clipping){
            browserWindow.webContents.send(
                "show-notification",
                "Clipping Added",
                clipping
            )
        }
    })
    if(!newClippingShortcut){
        console.log("Clobal newClipping shortcut fail to regiester!");
    }
    updateMenu();
    tray.setToolTip("Clipmaster");
})

const updateMenu = () => {
    const menu = Menu.buildFromTemplate([
        {
            label: "Create New Clipping",
            click: ()=>{
                addClipping();
            },
            accelerator: "CommandOrControl+Shift+C",
        },
        {
            type: "separator"
        },
        ...clippings.map(createClippingsMenuItem),
        {
            type: "separator"
        },
        {
            label: "Quit",
            click: () => {
                app.quit();
            },
            accelerator: "CommandOrControl+Q"
        }
    ])
    tray.setContextMenu(menu);
}
const addClipping = () => {
    const clipping = clipboard.readText();
    if(clippings.includes(clipping)) return;
    clippings.unshift(clipping);
    clippings = clippings.slice(0, 10);
    updateMenu();
    return clipping;
}
const createClippingsMenuItem = (clipping, index) => {
    return {
        label: clipping.length > 20 ? clipping.slice(0, 20) + "..." : clipping,
        click: () => {
            clipboard.writeText(clipping);
        },
        accelerator: `CommandOrControl+${index}`
    }
}
