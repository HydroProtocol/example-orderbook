# Simple Orderbook Demo

----------------------------

This demo constructs and maintains a level 2 orderbook using the Hydro API. Using the SDK HydroWatcher,
a websocket connection will be created, and the orderbook will be updated in real time. A mini
representation of the orderbook will be printed to the console.

To start the orderbook, use the following command:

`ts-node src/index.ts [marketId]`