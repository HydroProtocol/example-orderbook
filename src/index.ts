import { BigNumber } from "bignumber.js"
import { SimpleOrderbook } from "./lib/SimpleOrderbook"

const marketId = process.argv[2]
const orderbook = new SimpleOrderbook()
orderbook.run(marketId)