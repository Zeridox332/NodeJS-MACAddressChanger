const { exec, execSync } = require("child_process");

const getAllInterfaces = () => {

    const getInterfaces = require("os").networkInterfaces();

    const interfaces = [];

    let getMacOutput = execSync("getmac", {encoding: "utf-8"}).split("\n");

    for (let i in getMacOutput){
        for (let int in getInterfaces){
            if (getMacOutput[i].includes(getInterfaces[int][0].mac.replace(/:/g, "-").toUpperCase())){
                let intTransport = /{.+}/.exec(getMacOutput[i])[0];
                interfaces.push({
                    name: int,
                    mac: getInterfaces[int][0].mac.replace(/:/g, "").toUpperCase(),
                    transportId: intTransport,
                    path: null
                });
            }
        }
    }
    
    return interfaces
}

const getInterfaces = (manual = false, scanAll = false) => {
    const getInterfaces = require("os").networkInterfaces();

    let getMacOutput = execSync("getmac", {encoding: "utf-8"}).split("\n");

    const interfaces = [];

    getMacOutput.forEach(intMacTransport => {
        for (let int in getInterfaces){
            let intMac = getInterfaces[int][0].mac.toUpperCase().replace(/:/g, "-");
            if (intMacTransport.includes(intMac)) {
                let intTransport = /{.+}/.exec(intMacTransport)[0];
                let intName = int;
                interfaces.push({
                    value: [intTransport, intMac.replace(/-/g, ""), intName],
                    name: int
                });
            }
        }
    });

    if (!manual){
        interfaces.push({
            value: [0, null, null],
            name: "Crear MAC personalizada para una interfaz"
        });
    
        interfaces.push({
            value:[1, null, null],
            name: "Reactivar interfaz de red"
        });

        interfaces.push({
            value: [999, null, null],
            name: "Salir"
        });

    }

    if (scanAll){
        const interfaces = [];

        const intDescriptions = execSync(`wmic nic get description`, {encoding: "utf-8"}).split("\n");
        intDescriptions.shift();
        const transportIdRegex = /{.+}/

        for (let i in intDescriptions){
            const intDescription = intDescriptions[i].trim();
            const intTransportId = execSync(`wmic nic where description="${intDescription}" get guid`, {encoding: "utf-8"}).split("\n");
            intTransportId.shift();
            const intHasTransportId = transportIdRegex.test(intTransportId[0].trim());
            if (intHasTransportId) {
                const intName = execSync(`wmic nic where description="${intDescription}" get netconnectionid`, {encoding: "utf-8"}).split("\n");
                intName.shift()
                interfaces.push({
                    value: intName[0].trim(),
                    name: `${intDescription} (${intName[0].trim()})`
                });
            }
        }

        interfaces.push({
            value: 0,
            name: "Cancelar"
        })

        return interfaces

    }

    if (manual){
        interfaces.push({
            value: 0,
            name: "Cancelar"
        })
    }
    return interfaces;
}

const getFakeMacs = () => {
    const macList = [
        {
            value: "0ABFD7E53510",
            name: "0A-BF-D7-E5-35-10"
        }, 
        {
            value: "9A76302D85F0",
            name: "9A-76-30-2D-85-F0"
        },
        { 
            value: "0A86102E24F0",
            name: "0A-86-10-2E-24-F0"
        },
        {
            value: "3A36F02CA5F5",
            name: "3A-36-F0-2C-A5-F5"
        },
        {
            value: 1,
            name: "Regresar a la MAC anterior"
        },
        {
            value: 0,
            name: "Cancelar"
        }
    ];

    return macList;
}


module.exports = {
    getInterfaces,
    getFakeMacs,
    getAllInterfaces
}