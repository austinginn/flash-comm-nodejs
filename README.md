# Flash-comm Nodejs Client
A flash-comm client implementation written for nodejs on a raspberry pi

### Installation
```sh
npm install
```

### Usage
```sh
npm start
```
A default config file will be generated on first run. Modify as needed.
```json
{
    "id": "a unique id",
    "host": "http://localhost:3000",
    "registered": false,
    "ledChannel": 7,
    "switchChannel": 11,
    "flashInterval": 500,
    "space": ""
}
```