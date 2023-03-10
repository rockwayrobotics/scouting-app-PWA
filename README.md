# Scouting App PWA
Just run a webserver in the root and it should work.

This app is using the [Mithril.js](https://mithril.js.org) framework as it looked like a good simple one.

## ToDo:
- [x] Seperate Pit & Match scout data
- [x] Store data in IndexedDB
- [x] Load data from IndexedDB
- [ ] Input positions
- [ ] More descriptive input labels
- [ ] Auto track cycle/pickup time
- [ ] Load data from Backend into IndexedDB
	- How can we transfer data without Bluetooth/Data/WiFi?
	- Load only diffs?
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
