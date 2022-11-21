const windows = require("windows");

const controllerPath = "HKEY_LOCAL_MACHINE\\SYSTEM\\ControlSet001\\Control\\Class";


const readAndWriteReg = (intTransport, newMac, oldMac, deviceName) => {
    let data = windows.registry(controllerPath, {search: 'NetCfgInstanceId', recursive: true});
    try {
        for (let i in data){
            if (data[i]["NetCfgInstanceId"].value == intTransport) {
                intData = {
                    path: `${controllerPath}\\${i}`,
                    valueNetCfgInstanceId: data[i]["NetCfgInstanceId"].value,
                    oldMac,
                    deviceName,
                    newMac
                }
                try {
                    windows.registry(intData.path).add("NetworkAddress", newMac);
                    return [false, intData];
                } catch (e) {
                    return console.log({error: true, errorString: `${e}`});
                }
            }
        }
    } catch(e){
        
    }
}

const writeReg = (intTransport, newMac, oldMac, deviceName, cachedPath) => {
    newMac = newMac.toUpperCase();
    if (newMac.includes("-")) newMac = newMac.replace(/-/g, "");
    if (cachedPath) {
        let intData;
        let cachedTransportId = windows.registry(cachedPath, {search: 'NetCfgInstanceId'})["NetCfgInstanceId"];
        if (cachedTransportId) {
            cachedTransportId = cachedTransportId.value;
            if (cachedTransportId == intTransport) {
                intData = {
                    path: cachedPath,
                    valueNetCfgInstanceId: cachedTransportId,
                    oldMac,
                    deviceName,
                    newMac
                }
                try {
                    windows.registry(cachedPath).add("NetworkAddress", newMac);
                    return [false, intData];
                } catch (e) {
                    return console.log({error: true, errorString: `${e}`});
                }
            } else {
                return readAndWriteReg(intTransport, newMac, oldMac, deviceName);
            }
        }
        return readAndWriteReg(intTransport, newMac, oldMac, deviceName);
    } else {
        return readAndWriteReg(intTransport, newMac, oldMac, deviceName);
    }
}

module.exports = {
    writeReg
}

