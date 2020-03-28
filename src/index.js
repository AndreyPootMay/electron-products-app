const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const url = require('url');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
    });
}

let mainWindow;
let newProductWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        }        
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/index.html'),
        protocol: 'file',
        slashes: true
    }));

    const mainMenu = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on('closed', _ => {
        app.quit();
    });
});

let createNewProductWindow = _ => {
    newProductWindow = new BrowserWindow({
        width: 400,
        height: 300,
        title: 'Add new product',
        webPreferences: {
            nodeIntegration: true
        }        
    });

    newProductWindow.setMenu(null);
    
    newProductWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views/new-product.html'),
        protocol: 'file',
        slashes: true
    }));

    const mainMenu = Menu.buildFromTemplate(templateMenu);
    Menu.setApplicationMenu(mainMenu);

    newProductWindow.on('closed', _ => {
        newProductWindow = null;
    })
}

ipcMain.on('new:product', (e, newProduct) => {
    mainWindow.webContents.send('new:product', newProduct)
    newProductWindow.close();
});

const templateMenu = [
    {
        label: 'File',
        submenu: [
            {
                label: 'New Product',
                accelerator: 'Ctrl+N',
                click() {
                    createNewProductWindow();
                }
            },
            {
                label: 'Remove all products',
                click () {
                    mainWindow.webContents.send('products:remove-all')
                }
            },
            {
                label: 'Exit',
                accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
                click() {
                    app.quit();
                }
            }
        ]
    },
];

if (process.platform === 'darwin') {
    templateMenu.unshift({
        label: app.getName()
    });
}

if (process.env.NODE_DEV !== 'production') {
    templateMenu.push({
        label: 'Devtools',
        submenu: [
            {
                label: 'Show/hide dev tools',
                accelerator: 'Ctrl+D',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
            },
            {
                role: 'reload'
            }
        ]
    })
}