//GPIO for raspberry pi
import gpio from "rpi-gpio";
import { promisify } from "util";


//get gpio pin from arg
const PIN = process.env.npm_config_pin;
console.log(PIN);

//Async gpio
const setupAsync = promisify(gpio.setup);
const writeAsync = promisify(gpio.write);
const readAsync = promisify(gpio.read);

gpio.setMode(gpio.MODE_BCM);


//init footswitch
await initFootSwitch();

//Untested
//Footswitch callback
gpio.on('change', async (channel, value) => {
    console.log("GPIO: Foot switch pressed");
    console.log(`GPIO: ${channel}, ${value}`);
    //send data to server if connected
});


//Untested
//initialize foot switch
async function initFootSwitch() {
    try {
        await setupAsync(PIN, gpio.DIR_IN);
        console.log("GPIO: Foot switch initialized");
    } catch (error) {
        console.log("Error initializing foot switch");
        console.log(error);
    }
}