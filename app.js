require('colors');

const { 
  execSync,
  execFileSync
} = require("child_process");

const { 
  getAllInterfaces
} = require('./helpers/getInterfaces.js');

const { 
  guardarDB,
  leerDB
} = require('./helpers/guardarArchivo.js');

const { 
    selectInterface,
    pausa,
    readMacInput,
    selectFakeMac
} = require('./helpers/inquirer.js');

const {
  writeReg
} = require("./helpers/registryHandler.js");

const {
  reEnableInterface
} = require("./helpers/manageInterfaces.js");

const Mac = require("./models/mac.js");

const updateCurrentPath = () => {
  const fs = require("fs");
  const cp = require("child_process");
  const currentPath = cp.execSync("echo %cd%", {encoding: "utf-8"}).trim();
  fs.writeFileSync('.env', `CURRENTPATH=${currentPath}`)
  require('dotenv').config();
}

const main = async () => {
  updateCurrentPath();
  
  execFileSync(`${process.env.CURRENTPATH}\\vbs\\information.vbs`, {
    shell: true
  });

  let savedMacList = [];
  let macToSave;
  let intToChange;
  let interfaceData;
  let restart = 0;

  /* Al ejecutarse el programa por primera vez, toma todas las interfaces activas para
     hacer uso de la opción "Regresar a la MAC anterior" en el menú de interfaz, luego 
     cada vez que se ejecute el programa se lee data.json para mantener la MAC anterior en la base de datos
  */

    const readSavedMacs = leerDB();

    if (readSavedMacs){
      savedMacList = readSavedMacs;
    } else {
      savedMacList = getAllInterfaces()
    }
  
  do{
    //Imprimir y recibir opción
    intToChange = await selectInterface();
    

  // Opción intToChange[0] == 0: Edita la MAC de una interfaz en específico escribiendo una 
  // Dirección MAC válida

  // Opción intToChange[0] == 999: Guarda las MAC antes de salir del programa

  // Opción else: Elige desde un Array de MACs (editable) para cambiar, también está la opción "Volver a la MAC anterior"
  // La cual hace uso de oldMacData.json para leer la MAC anterior de cada interfaz

    if (intToChange[0] == 0) {
      const intToManuallyChange = await selectInterface(true);

      if (intToManuallyChange == 0){
        restart = 1;
        continue;
      }
      
      const macToChange = await readMacInput("Escribe la MAC que quieres para la interfaz seleccionada EJ: AA-BB-CC-DD-EE-FF [Solo valores 0-9 A-F]. Escribe 0 para cancelar");
      
      if (macToChange == 0) {
        restart = 1;
        continue;
      }

      console.log('\nIntentando escribir en el registro de Windows...'.white.bold);

      //search for cached device path

      let cachedPath;

      for (let int in savedMacList){
        if (savedMacList[int].transportId == intToManuallyChange[0]){
          if (savedMacList[int].path) {
            cachedPath = savedMacList[int].path;
          } else {
            cachedPath = null;
          }
          break;
        }
      }

      interfaceData = writeReg(intToManuallyChange[0], macToChange, intToManuallyChange[1], intToManuallyChange[2], cachedPath);

      console.log('\n Listo'.white.bold);

      if (!interfaceData[0]){
        reEnableInterface(interfaceData[1].deviceName, interfaceData[1].oldMac);
        macToSave = new Mac(interfaceData[1].deviceName, interfaceData[1].oldMac, interfaceData[1].valueNetCfgInstanceId, interfaceData[1].path);
        for (let i in savedMacList){
          if (savedMacList[i].transportId == macToSave.transportId) savedMacList[i] = macToSave;
          guardarDB(savedMacList);
        }
        await pausa(interfaceData[0], interfaceData[1]);
        execFileSync(`${process.env.CURRENTPATH}\\vbs\\restart.vbs`, {
          shell: true
        });
      } else {
        await pausa(interfaceData[0]);
      }
    } else if (intToChange[0] == 999){

      //Exit

      guardarDB(savedMacList)
      process.exit();

    } else if (intToChange[0] == 1){
      //Activar Interfaz

      console.log("\nCargando interfaces...".white.bold);
      const intToReEnable = await selectInterface(false, true);
      if (intToReEnable == 0) {
        restart = 1;
        continue;
      }
      reEnableInterface(intToReEnable, null, true);
      guardarDB(savedMacList);
      restart = 1;
    } else {
      const preMadeMac = await selectFakeMac();
      if (!preMadeMac) {
        restart = 1;
        continue;
      } else if (preMadeMac == 1) {

        //search for cached device path
        
        let cachedPath;

        for (let int in savedMacList){
          if (savedMacList[int].transportId == intToChange[0]){
            if (savedMacList[int].path) {
              cachedPath = savedMacList[int].path;
            } else {
              cachedPath = null;
            }
            break;
          }
        }

        console.log("\nIntentando escribir en el registro de Windows".white.bold)
        for (let i in savedMacList){
          if (savedMacList[i].transportId === intToChange[0]) {
            interfaceData = writeReg(intToChange[0], savedMacList[i].mac, intToChange[1], intToChange[2], cachedPath);
            if (!interfaceData[0]){
              console.log("\nListo.");
              reEnableInterface(interfaceData[1].deviceName, interfaceData[1].oldMac);
              macToSave = new Mac(interfaceData[1].deviceName, interfaceData[1].oldMac, interfaceData[1].valueNetCfgInstanceId, interfaceData[1].path);
              for (let i in savedMacList){
                if (savedMacList[i].transportId == macToSave.transportId) savedMacList[i] = macToSave;
                guardarDB(savedMacList);
              }
              await pausa(interfaceData[0], interfaceData[1]);
              execFileSync(`${process.env.CURRENTPATH}\\vbs\\restart.vbs`, {
                shell: true
              });
            } else {
              await pausa(interfaceData[0]);
            }
          }
        }
      } else {

        //search for cached device path

        let cachedPath;

        for (let int in savedMacList){
          if (savedMacList[int].transportId == intToChange[0]){
            if (savedMacList[int].path) {
              cachedPath = savedMacList[int].path;
            } else {
              cachedPath = null;
            }
            break;
          }
        }

        console.log("\nIntentando escribir en el registro de Windows".white.bold)
        interfaceData = writeReg(intToChange[0], preMadeMac, intToChange[1], intToChange[2], cachedPath);
        if (!interfaceData[0]) {
          console.log("\nListo".white.bold);
          reEnableInterface(interfaceData[1].deviceName, interfaceData[1].oldMac);
          await pausa(interfaceData[0], interfaceData[1]);
          macToSave = new Mac(interfaceData[1].deviceName, interfaceData[1].oldMac, interfaceData[1].valueNetCfgInstanceId, interfaceData[1].path);
          for (let i in savedMacList){
            if (savedMacList[i].transportId == macToSave.transportId) savedMacList[i] = macToSave;
            guardarDB(savedMacList);
          }
         execFileSync(`${process.env.CURRENTPATH}\\vbs\\restart.vbs`, {
            shell: true
          });
        } else {
          await pausa(interfaceData[0]);
        }
      }
    }

        
  } while (restart == 1);
}

main()