const expect = require('chai').expect;
const { V3WebsocketClient } = require('okex-node');
require('dotenv').load();
const websocketV3Uri = process.env['V3_WS_URL'];

describe('V3 API 推送-永续合约-用户持仓信息', function () {

    const client = new V3WebsocketClient(websocketV3Uri);

    before(done => {
        client.connect();
        client.on('open', () => {
            const apiKey = process.env['V3_API_KEY'];
            const apiSecret = process.env['V3_SECRET_KEY'];
            const passPhrase = process.env['V3_PASSPHRASE'];
            client.login(apiKey, apiSecret, passPhrase);
            client.on('message', message => {
                if (message.indexOf('login') > -1 && message.indexOf('success') > -1) {
                    done();
                }
            });
        });
    });

    it('swap/position:BTC-USD-SWAP', done => {
        let isSubscribed = false;
        const listener = data => {
            const result = JSON.parse(data);
            // 返回数据 {event:'subscribe', subscribe:'swap/position:BTC-USD-SWAP'} 表示已订阅成功
            if (data.indexOf('subscribe') > -1 && data.indexOf('swap/position:BTC-USD-SWAP') > -1) {
                isSubscribed = true;
            } else if (isSubscribed) {
                //
                // {
                // table: "swap/position",
                // data: [{
                //  "margin_mode": "crossed",
                //  "instrument_id": "BTC-USD-SWAP",
                //  "holding": [{
                //     "liquidation_price": "0.07",
                //     "position": "1",
                //     "avail_position": "1",
                //     "avg_cost": "210.24",
                //     "settlement_price": "210.34",
                //     "leverage": "10",
                //     "realized_pnl": "0.00307096",
                //     "side": "short",
                //     "timestamp": "2018-10-17T20:11:443Z"
                //  }]
                // }]
                //}
                //
                expect(result).to.have.property('table');
                expect(result.table).to.equal('swap/position');

                expect(result).to.have.property('data');
                expect(result.data).to.be.an.instanceof(Array);
                expect(result.data.length).to.be.above(0);

                const item = result.data[0];
                expect(item).to.have.property('instrument_id');
                expect(item.instrument_id).to.equal('BTC-USD-SWAP');

                expect(item).to.have.property('margin_mode');
                expect(item.margin_mode).to.be.a('string');

                expect(item).to.have.property('holding');
                expect(item.holding).to.be.a('array');

                const holding = item.holding;
                // 预估爆仓价
                expect(holding).to.have.property('liquidation_price');
                expect(holding.liquidation_price).to.be.a('string');
                expect(holding.liquidation_price).to.be.not.empty;
                // 持仓数量
                expect(holding).to.have.property('position');
                expect(holding.position).to.be.a('string');
                expect(holding.position).to.be.not.empty;
                // 可平数量
                expect(holding).to.have.property('avail_position');
                expect(holding.avail_position).to.be.a('string');
                expect(holding.avail_position).to.be.not.empty;
                // 结算基准价
                expect(holding).to.have.property('settlement_price');
                expect(holding.settlement_price).to.be.a('string');
                expect(holding.settlement_price).to.be.not.empty;
                // 杠杆
                expect(holding).to.have.property('leverage');
                expect(holding.leverage).to.be.a('string');
                expect(holding.leverage).to.be.not.empty;
                // 已实现盈亏
                expect(holding).to.have.property('realized_pnl');
                expect(holding.realized_pnl).to.be.a('string');
                expect(holding.realized_pnl).to.be.not.empty;
                // 方向
                expect(holding).to.have.property('side');
                expect(holding.timestamp).to.be.a('string');
                expect(holding.timestamp).to.be.not.empty;
                // 创建时间
                expect(holding).to.have.property('timestamp');
                expect(holding.timestamp).to.be.a('string');
                expect(holding.timestamp).to.be.not.empty;
                // 保证金
                expect(holding).to.have.property('margin');
                expect(holding.margin).to.be.a('string');
                expect(holding.margin).to.be.not.empty;
                // fixed:逐仓crossed:全仓
                expect(holding).to.have.property('margin_mode');
                expect(holding.margin_mode).to.be.a('string');
                expect(holding.margin_mode).to.be.not.empty;

                done();
                client.removeListener('message', listener);
            }
        }

        client.on('message', listener);
        client.subscribe('swap/position:BTC-USD-SWAP');
    });


    after(done => {
        client.on('close', () => done());
        client.close();
    });
});