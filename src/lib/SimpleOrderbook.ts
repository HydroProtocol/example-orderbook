import { HydroWatcher, HydroListener, Orderbook, PriceLevel, Side, ChannelName, Market, HydroClient } from "@hydro-protocol/sdk"
import { BigNumber } from "bignumber.js"
import { RBTree } from "bintrees"

export class SimpleOrderbook {
  private asks: RBTree<PriceLevel>
  private bids: RBTree<PriceLevel>
  private watcher: HydroWatcher
  private client: HydroClient
  private market: Market

  constructor() {
    // Sort ascending
    this.asks = new RBTree((a: PriceLevel, b: PriceLevel) => a.price.gt(b.price) ? 1 : a.price.eq(b.price) ? 0 : -1)
    // Sort descending
    this.bids = new RBTree((a: PriceLevel, b: PriceLevel) => a.price.gt(b.price) ? -1 : a.price.eq(b.price) ? 0 : 1)
    
    this.watcher = new HydroWatcher(this.getListener())
    this.client = HydroClient.withoutAuth()
    this.market = new Market({})
  }

  public async run(marketId: string) {
    this.market = await this.client.getMarket(marketId)
    this.watcher.subscribe(ChannelName.ORDERBOOK, [marketId])
  }

  private getListener(): HydroListener {
    return {
      orderbookSnapshot: (orderbook: Orderbook) => {
        // Populate the trees
        this.asks.clear()
        this.bids.clear()

        orderbook.asks.forEach((ask: PriceLevel) => this.asks.insert(ask))
        orderbook.bids.forEach((bid: PriceLevel) => this.bids.insert(bid))

        this.printOrderbook()
      },
      orderbookUpdate: (side: Side, priceLevel: PriceLevel) => {
        // Update the trees with this new price level
        const tree = side === Side.BUY ? this.bids : this.asks

        if (priceLevel.amount.eq(0) || tree.find(priceLevel)) {
          tree.remove(priceLevel)
        }
        if (!priceLevel.amount.eq(0)) {
          tree.insert(priceLevel)
        }

        this.printOrderbook()
      }
    }
  }

  private printOrderbook() {
    let it, item

    const asks: PriceLevel[] = []
    it = this.asks.iterator()
    while((item = it.next()) !== null && asks.length < 10) {
      asks.unshift(item)
    }

    const bids: PriceLevel[] = []
    it = this.bids.iterator()
    while((item = it.next()) !== null && bids.length < 10) {
      bids.push(item)
    }

    console.clear()
    console.log(
      "\x1b[37m",
      this.market.id,
    )
    console.log(
      "\x1b[37m",
      "".padStart(10),
      "Price".padStart(20),
      "Amount".padStart(20),
    )
    asks.forEach((ask: PriceLevel) => console.log(
      "\x1b[31m",
      "".padStart(10),
      ask.price.toFixed(this.market.priceDecimals).padStart(20),
      ask.amount.toFixed(this.market.amountDecimals).padStart(20),
    ))
    console.log(
      "\x1b[37m",
      "Spread".padEnd(10),
      asks[asks.length-1].price.minus(bids[0].price).toFixed(this.market.priceDecimals).padStart(20),
    )
    bids.forEach((bid: PriceLevel) => console.log(
      "\x1b[32m",
      "".padStart(10),
      bid.price.toFixed(this.market.priceDecimals).padStart(20),
      bid.amount.toFixed(this.market.amountDecimals).padStart(20),
    ))
  }
}