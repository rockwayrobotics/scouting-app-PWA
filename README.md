# Scouting App PWA
Just run a webserver in the root and it should work.

This app is using the [Mithril.js](https://mithril.js.org) framework as it looked like a good simple one.

## To-Do:
- [x] Separate Pit & Match scout data
- [x] Store data in IndexedDB
- [x] Load data from IndexedDB
- [x] More descriptive input labels
- [ ] Input positions
- [ ] Auto track cycle/pickup time
- [ ] Load data from Backend into IndexedDB
	- How can we transfer data without Bluetooth/Data/Wi-Fi?
	- Load only diffs?
- [ ] Driver Meeting view
	- Avg. scoring time
	- Preferred pickup style
	- Fastest pickup style
### Issues:
- [x] Match list only loads on save
- [x] Inputed values aren't cleared on load
- [ ] Load buttons must be pressed twice to reset placeholders
- [ ] Lists aren't loaded on page load

## Pipeline
### Encode
`Object -> Byte String -> LZW Compression -> String -> QR Code`
### Decode
`QR Code -> String -> LZW Decompression -> Byte String -> Dictionary`
### Data Transfer
`Laptop -> QR Code -> PWA (IndexedDB)`
`PWA -> QR Code -> Laptop (Django DB)`
