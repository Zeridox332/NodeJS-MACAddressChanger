const cp = require("child_process");

const regexpReturnValue = /\s\d/;

const reEnableInterface = async (intName, intMac, justReEnable = false) => {

    if (justReEnable){
        let intStatus = cp.execSync(`wmic path win32_networkadapter where netconnectionid="${intName}" get netconnectionstatus`, {encoding: "utf-8"}).split("\n");
        intStatus = parseInt(intStatus[1]) || 0;
        switch (intStatus){
            case 0:
            case 4:
                const returnValue = cp.execSync(`wmic path win32_networkadapter where netconnectionid="${intName}" call enable`, {encoding: "utf-8"});
                if (parseInt(regexpReturnValue.exec(returnValue)[0]) == 0){
                    console.log('Interfaz reactivada con éxito.');
                } else {
                    console.log('Ocurrió un error al reactivar la interfaz');
                }
            break;

            case 2:
                console.log("La interfaz está activada y conectada a una red");
            break;

            case 7: 
                console.log("La interfaz está activada, conéctate a una red");
            break;

            default:
                console.log("Ocurrió un error, vuelve a ejecutar el programa");
            break;
        }

        const limit = new Date().getTime() + 1500;

        while (new Date().getTime() < limit){

        }

        return

    }

    //Añadir ":" a la MAC para comparar
    
    let intMacArr = intMac.split("");
    for (let i in intMacArr){
        if ( `${(parseInt(i)+1)/3}`.length == 1 ) {
            intMacArr.splice(i, 0, ":");
        }
    }
    intMacArr.splice(intMacArr.length-2, 0, ":");
    intMac = intMacArr.join("");


    const intData = cp.execSync(`wmic nic where netconnectionid="${intName}" get macaddress`, {encoding: 'utf-8'}).split("\n");
    let macRegex = /([AaBbCcDdEeFf0-9]{2}[:]){5}([AaBbCcDdEeFf0-9]{2})/;
    for (let i in intData){
        if (macRegex.test(intData[i]) && macRegex.exec(intData[i])[0] == intMac){
            console.log("Desactivando Interfaz.".yellow.bold);
            const returnValue = cp.execSync(`wmic path win32_networkadapter where netconnectionid="${intName}" call disable`, {encoding: "utf-8"});
            if (parseInt(regexpReturnValue.exec(returnValue)[0]) == 0) {
                console.log(`Interfaz desactivada`);
                // Cambiar HostName y reiniciar

                let systemName = cp.execSync(`wmic path win32_networkadapter where netconnectionid="${intName}" get systemname`, {encoding: "utf-8"}).split("\n");
                systemName = systemName[1].trim();
                let randomName = "DESKTOP-".split("");
                let randomChar = "ABCDEFGHIJKLMNOPQR12356";
                for (let i = 0; i < 7; i++){
                    randomName.push(randomChar[Math.round(Math.random()*(randomChar.length-1))]);
                }
                randomName = randomName.join("");
                cp.execSync(`wmic computerSystem where name="${systemName}" call rename "${randomName}"`);
                
            } else {
                console.log("Ocurrió un error al desactivar la interfaz, vuelve a ejecutar el programa y selecciona otra MAC");
            }
            break;
        }
    }
}

module.exports = {
    reEnableInterface
}