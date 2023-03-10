# Scouting App PWA
Just run a webserver in the root and it should work.

This app is using the [Mithril.js](https://mithril.js.org) framework as it looked like a good simple one.

## ToDo:
- [ ] Seperate Pit & Match scout data
- [ ] Store data in IndexedDB
- [ ] Load data from IndexedDB
- [ ] Load data from Backend into IndexedDB
	- How can we transfer data without Bluetooth/Data/WiFi?
	- Load only diffs?
- [ ] More descriptive input labels
- [ ] Input positions
- [ ] Auto track cycle/pickup time
- [ ] Driver Meeting view
	- Avg. scoring time
	- Preferred pickup style
	- Fastest pickup style

## Pipeline
### Encode
`Object -> Byte String -> LZW Compression -> String -> QR Code`
### Decode
`QR Code -> String -> LZW Decompression -> Byte String -> Dictionary`
### Data Transfer
`Laptop -> QR Code -> PWA (IndexedDB)`
`PWA -> QR Code -> Laptop (Django DB)`
