import { Gpio } from "onoff";
import { promisify } from "util";

//pin from arg
const args = process.argv.slice(2);
let PIN = 17;


// Check if there are arguments
if (args.length === 0) {
    console.log('No arguments provided.');
} else {
    // Output the provided arguments
    console.log('Arguments:', args);
    PIN = args[0];
}

console.log(PIN);

const button = new Gpio(PIN, 'in', 'both');

console.log(button);

button.watch((err, value) => {
    if (err) {
        throw err;
    }
    console.log(value);
});

process.on('SIGINT', _ => {
    button.unexport();
});