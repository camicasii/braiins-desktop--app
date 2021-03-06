"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const url_1 = __importDefault(require("url"));
const path_1 = require("path");
const scanEvent_1 = __importDefault(require("./event/scanEvent"));
const discoverEvent_1 = __importDefault(require("./event/discoverEvent"));
const modal_1 = __importDefault(require("./utils/modal"));
const modalDeveloper_1 = __importDefault(require("./utils/modalDeveloper"));
//import addExtension from "./utils/addExtension";
//electron-prevent-multiple-instances
const gotTheLock = electron_1.app.requestSingleInstanceLock();
if (!gotTheLock) {
    electron_1.app.quit();
}
//electron-prevent-multiple-instances-end
let MainWindows;
function createWindows() {
    const mainWindows = new electron_1.BrowserWindow({
        icon: electron_1.nativeImage.createFromPath(path_1.join(__dirname, 'resource/icon.png')),
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload: path_1.join(__dirname, 'preload.js'),
            devTools: process.env.DEV == "DEV" ? true : false
        }
    });
    mainWindows.setMenuBarVisibility(false);
    const url_ = process.env.DEV == "DEV" ? 'http://localhost:3000/' : url_1.default.format({
        pathname: path_1.join(__dirname, 'views/build/index.html'),
        protocol: 'file',
        slashes: true,
    });
    console.log(url_);
    mainWindows.loadURL(url_);
    mainWindows.webContents.openDevTools();
    MainWindows = mainWindows;
}
electron_1.app.whenReady().then(() => __awaiter(void 0, void 0, void 0, function* () {
    scanEvent_1.default();
    discoverEvent_1.default();
    if (process.env.DEV == "DEV") {
        //await addExtension()
        createWindows();
    }
    else
        createWindows();
    event_ext();
    try {
        electron_1.app.on('activate', () => {
            if (electron_1.BrowserWindow.getAllWindows().length === 0)
                createWindows();
        });
        electron_1.app.on('window-all-closed', () => {
            if (process.platform !== 'darwin')
                electron_1.app.quit();
            electron_1.app.quit();
        });
        //electron-prevent-multiple-instances
        electron_1.app.on('second-instance', (event, commandLine, workingDirectory) => {
            if (MainWindows) {
                if (MainWindows.isMinimized())
                    MainWindows.restore();
                MainWindows.focus();
            }
        });
        //electron-prevent-multiple-instances-end
    }
    catch (error) {
        console.log('An error occurred: ', error);
    }
}));
function noty() {
    const opt = {
        title: "Error",
        body: "Something is wrong",
        timeoutType: "never",
        urgency: "critical",
        sound: path_1.join(__dirname, 'resource/ALERT_Error.wav'),
        icon: electron_1.nativeImage.createFromPath(path_1.join(__dirname, 'resource/icon.png'))
    };
    return new electron_1.Notification(opt);
}
function event_ext() {
    const notification = noty();
    electron_1.ipcMain.on('notification', (event, arg) => {
        notification.body = `Something is wrong, IP ${arg}`;
        notification.show();
    });
    electron_1.ipcMain.on('modal', (event, arg) => {
        modal_1.default(MainWindows, arg);
    });
    electron_1.ipcMain.on('modal-developer', (event, arg) => {
        modalDeveloper_1.default(MainWindows);
    });
}
