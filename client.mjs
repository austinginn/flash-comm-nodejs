//Socket.IO client for flash-comm
import io from "socket.io-client";
import { v4 as uuidv4 } from 'uuid';
import JSONFileHandler from "./json-file-handler.mjs";

//GPIO for raspberry pi
import gpio from "rpi-gpio";
import { promisify } from "util";

//globals for led flash
let ledState = false;
let flashing = null; //setInterval reference

//global connected state
let connected = false;

//Async gpio
const setupAsync = promisify(gpio.setup);
const writeAsync = promisify(gpio.write);
// const readAsync = promisify(gpio.read);

//init footswitch
await initFootSwitch();

//init led
await initLED();

//Init file handler and load config
const configFileHandler = new JSONFileHandler('./config.json');

//load config file
const config = await loadConfig();

//create socket
const socket = io(config.host);

//Untested
//Footswitch callback
gpio.on('change', async (channel, value) => {
    if (channel === config.switchChannel) {
        console.log("GPIO: Foot switch pressed");
        //send data to server if connected
        if (connected) {
            socket.emit("flash", config.space);
        }
    }
});

//connect to socket
socket.on("connect", () => {
    console.log("Socket.io: connected");
    connected = true;

    //check if device is registered
    if (!config.registered) {
        console.log("Socket.io: waiting for device to be registered.");
    }

    //register device
    socket.emit("device", config.id);

    //listen for data from server
    socket.on("data", (data) => {
        console.log("Socket.io: data received");
        console.log(data);

        //toggle flash
        flash(data.flash);
    });

    //listen for device to be registered
    socket.on(config.id, async (data) => {
        console.log("Socket.io: device registered");
        config.registered = true;
        config.space = data.space; //need to test this
        await configFileHandler.saveJSON(config);
        console.log(data);
        socket.emit("device", config.id);
    });

});

//socket disconnected
socket.on("disconnect", () => {
    console.log("Socket.io: disconnected");
    connected = false;
});


//Untested flash code
//flash led
async function flash(flash) {
    if (flash && !flashing) {
        //flash led if not already flashing interval running
        flashing = setInterval(async () => {
            try {
                //toggle led
                ledState = !ledState;
                await writeAsync(config.ledChannel, ledState);
            } catch (error) {
                console.log("Error writing to LED");
                console.log(error);
            }
        }, config.flashInterval);
    } else {
        //end the interval and set led state to off
        if (flashing) {
            clearInterval(flashing);
        }
        flashing = null;
        await writeAsync(config.ledChannel, false); //should wrap in try catch block
    }
}

//Untested
//initialize foot switch
async function initFootSwitch() {
    try {
        await setupAsync(config.switchChannel, gpio.DIR_IN, gpio.EDGE_BOTH);
        console.log("GPIO: Foot switch initialized");
    } catch (error) {
        console.log("Error initializing foot switch");
        console.log(error);
    }
}

//Untested
//initialize led
async function initLED() {
    try {
        await setupAsync(config.ledChannel, gpio.DIR_OUT);
        console.log("GPIO: LED initialized");
    } catch (error) {
        console.log("Error initializing LED");
        console.log(error);
    }
}

async function loadConfig() {
    try {
        const data = await configFileHandler.readJSON();
        console.log("Config loaded: ");
        console.log(data);
        return data;
    } catch (error) {
        console.log("Error loading config file. Creating default config.json file and generating id.");
        console.log("Default host is http://localhost:3000");
        console.log("Modify config.json to change host.");
        //generate a unique id
        const id = uuidv4();

        //default config
        const defaultConfig = {
            "id": id,
            "host": "http://localhost:3000",
            "registered": false,
            "ledChannel": 7,
            "switchChannel": 11,
            "flashInterval": 500,
            "space": ""
        };

        //save config file
        await configFileHandler.saveJSON(defaultConfig);
        return defaultConfig;
    }
}
