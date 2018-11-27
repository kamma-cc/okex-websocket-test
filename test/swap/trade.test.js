const expect = require('chai').expect;
const { V3WebsocketClient } = require('okex-node');
require('dotenv').load();
const websocketV3Uri = process.env['V3_WS_URL'];

describe('V3 API 推送-永续合约-交易数据', function() {

    const client = new V3WebsocketClient(websocketV3Uri);

    before(done => {
        client.connect();
        client.on('open', done);
    });

    it('最近成交明细 swap/trade', done => {
        let isSubscribed = false;
        const listener = data => {
            // 返回数据 {event:'subscribe', subscribe:'swap/trade:BTC-USD-SWAP'} 表示已订阅成功
            if (data.indexOf('subscribe') > -1 && data.indexOf('swap/trade:BTC-USD-SWAP') > -1) {
                console.log('subscribe success [swap/trade:BTC-USD-SWAP]');
                isSubscribed = true;
            } else if (isSubscribed) {
                const result = JSON.parse(data);
                // {
                // "instrument_id"："BTC-USD-SWAP"，
                // "trade_id": "199",
                // "price": 25,
                // "size": 12,
                // "side": 1,
                // "timestamp": "2018-10-24T20:11:443Z"
                // },
                expect(result).to.have.property('table');
                expect(result.table).to.equal('swap/trade');

                expect(result).to.have.property('data');
                expect(result.data).to.be.an.instanceof(Array);
                expect(result.data.length).to.be.above(0);

                const item = result.data[0];
                //
                expect(item).to.have.property('instrument_id');
                expect(item.instrument_id).to.equal('BTC-USD-SWAP');
                // 成交id
                expect(item).to.have.property('trade_id');
                expect(item.trade_id).to.be.a('string');
                expect(item.trade_id).to.be.not.empty;
                // 成交价格
                expect(item).to.have.property('price');
                expect(item.price).to.be.a('string');
                expect(item.price).to.be.not.empty;
                // 成交数量
                expect(item).to.have.property('size');
                expect(item.size).to.be.a('string')
                expect(item.size).to.be.not.empty;
                // 成交方向
                expect(item).to.have.property('side');
                expect(item.side).to.be.a('string');
                expect(item.side).to.be.not.empty;
                // 成交时间
                expect(item).to.have.property('timestamp');
                expect(item.timestamp).to.be.a('string');
                expect(item.timestamp).to.be.not.empty;

                done();
                client.removeListener('message', listener);
            }
        }
        client.on('message', listener);
        client.subscribe('swap/trade:BTC-USD-SWAP');
    });

    after(done => {
        client.on('close', () => done());
        client.close();
    });
});