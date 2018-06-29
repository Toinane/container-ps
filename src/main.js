const path = require('path');
const {spawn} = require('child_process');
const {app, Menu, Tray, nativeImage, clipboard} = require('electron');
const fixPath = require('fix-path');

const imageInfo = {
    up: nativeImage.createFromPath(path.join(__dirname, 'assets/upTemplate.png')),
    restarting: nativeImage.createFromPath(path.join(__dirname, 'assets/restartingTemplate.png')),
    down: nativeImage.createFromPath(path.join(__dirname, 'assets/downTemplate.png'))
};

let labelsDefault = [
    {label: 'Container PS', enabled: false},
    {type: 'separator'},
    {label: 'Reload List', accelerator: 'CmdOrCtrl+R', click: () => updateList()},
    {label: 'Quit', role: 'quit', accelerator: 'CmdOrCtrl+Q'},
    {type: 'separator'}
];

let tray = null;
let containers = [];
let labels = [];
labels = labels.concat(labelsDefault);

// Fix GUI apps on macOS doesn't inherit the $PATH defined in your dotfiles
fixPath();

class Container {
    constructor(dockerLine) {
        const container = this.decodeLineInfo(dockerLine);
        this.id = container[0] || 0;
        this.name = container[1] || 'no name found';
        this.entrypoint = container[2] || 'no entry point found';
        this.mountedAt = container[3] || 'no mounted date found';
        this.mountedInfo = container[4] || 'no mounted info found';
        if (this.isUp()) {
            this.ports = container[5] || 'no ports found';
            this.image = container[6] || 'no image found';
            this.size = container[7] || 'no size found';
        } else {
            this.ports = 'no port used';
            this.image = container[5] || 'no image found';
            this.size = container[6] || 'no size found';
        }
    }

    decodeLineInfo(line) {
        return line.split(/(\s{2,})/).filter(function (e) {
            return e.trim().length > 0;
        });
    }

    getLivingInfo() {
        if (this.mountedInfo.includes('Up')) return 'up';
        else if (this.mountedInfo.includes('Restarting')) return 'restarting';
        else return 'down';
    }

    isUp() {
        return this.mountedInfo.includes('Up');
    }
}

function getContainers() {
    return new Promise((resolve, reject) => {
        runCommand('docker', ['ps', '-a', '-s'])
            .then(list => {
                const lines = list.toString().split('\n');
                lines.shift();
                lines.pop();
                lines.forEach(line => containers.push(new Container(line)));

                containers.sort((current, next) => {
                    if (current.isUp() && next.isUp()) return 0;
                    else if (current.isUp() && !next.isUp()) return -1;
                    else return 1;
                });

                containers.forEach(container => {
                    labels.push({
                        label: container.name,
                        icon: imageInfo[container.getLivingInfo()],
                        type: 'submenu',
                        submenu: [
                            {label: 'Id: ' + container.id, enabled: false},
                            {label: 'Name: ' + container.name, enabled: false},
                            {label: 'Entry Point: ' + container.entrypoint, enabled: false},
                            {label: 'Created: ' + container.mountedAt, enabled: false},
                            {label: 'Info: ' + container.mountedInfo, enabled: false},
                            {label: 'Ports: ' + container.ports, enabled: false},
                            {label: 'Image: ' + container.image, enabled: false},
                            {label: 'Size: ' + container.size, enabled: false},
                            {type: 'separator'},
                            {
                                label: (container.isUp() ? 'Stop Container' : 'Start Container'),
                                id: container.id,
                                click: (e) => {
                                    runCommand('docker', [container.isUp() ? 'stop' : 'start', e.id])
                                        .then(() => updateList());
                                }
                            },
                            {
                                label: 'Restart Container',
                                id: container.id,
                                click: (e) => {
                                    runCommand('docker', ['restart', e.id])
                                        .then(() => updateList());
                                }
                            },
                            {type: 'separator'},
                            {
                                label: 'Copy ID Container',
                                id: container.id,
                                click: e => clipboard.writeText(e.id)
                            },
                            {type: 'separator'},
                            {
                                label: 'Delete Container',
                                id: container.id,
                                click: e => {
                                    runCommand('docker', ['stop', e.id])
                                        .then(() => {
                                            runCommand('docker', ['rm', e.id]).then(() => updateList());
                                        });
                                }
                            }
                        ]
                    })
                });
                resolve();
            })
            .catch(err => {
                labels.push({
                    label: 'We can\'t get the container list back. Is Docker on?'
                });
                let array = err.toString().match(/.{1,35}/g);
                array.forEach(el => labels.push({label: el, enabled: false}));

                resolve();
            });
    });

}

function runCommand(cmd, options = []) {
    const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'assets/loadingTemplate.png'));
    tray.setImage(trayIcon);

    return new Promise((resolve, reject) => {
        const command = spawn(cmd, options);

        let result;
        command.stdout.on('data', (data) => {
            if (result) {
                result += data.toString();
            } else {
                result = data.toString();
            }
        });
        command.stderr.on('data', (data) => reject(data));
        command.on('close', () => resolve(result));
    });
}

function updateList() {
    containers = [];
    labels = [];
    labels = labels.concat(labelsDefault);

    if (!tray) {
        const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'assets/trayTemplate.png'));
        tray = new Tray(trayIcon);
        tray.setToolTip('Docker PS');
    }

    getContainers()
        .then(() => {
            const trayIcon = nativeImage.createFromPath(path.join(__dirname, 'assets/trayTemplate.png'));
            tray.setImage(trayIcon);

            const contextMenu = Menu.buildFromTemplate(labels);
            tray.setContextMenu(contextMenu);
        })
        .catch(() => { /* */});
}

app.on('will-finish-launching', () => {
    app.disableHardwareAcceleration();
    app.dock.hide();
});

app.on('ready', () => {
    updateList();
});