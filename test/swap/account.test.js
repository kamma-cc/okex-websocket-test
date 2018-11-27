const expect = require('chai').expect;
const { V3WebsocketClient } = require('okex-node');
require('dotenv').load();
const websocketV3Uri = process.env['V3_WS_URL'];

describe('V3 API 推送-永续合约-账户信息', function () {

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

    it('swap/account:BTC-USD-SWAP', done => {
        let isSubscribed = false;
        const listener = data => {
            const result = JSON.parse(data);
            if (result.event === 'error') {
                done(data);
                return;
            }
            // 返回数据 {event:'subscribe', subscribe:'swap/account:BTC-USD-SWAP'} 表示已订阅成功
            if (result.event === 'subscribe' && result.subscribe === `swap/account:BTC-USD-SWAP`) {
                console.log('subscribe success [swap/account:BTC-USD-SWAP]');
                isSubscribed = true;
            } else if (isSubscribed) {
                // 验证数据返回与API规范
                expect(result).to.have.property('table');
                expect(result.table).to.equal('swap/account');

                expect(result).to.have.property('data');
                expect(result.data).to.be.an.instanceof(Array);
                expect(result.data.length).to.be.above(0);

                //
                // {
                // table: "swap/account",
                // data:[{
                //  "equity": "1",
                //  "total_avail_balance": "88.23567432",
                //  "margin": "0",
                //  "realized_pnl": "0.00307096",
                //  "unrealized_pnl": "0.46",
                //  "margin_ratio": "0.23435632",
                //  "instrument_id": "BTC-USD-SWAP",
                //  "margin_frozen": "0",
                //  "timestamp": "2018-10-17T20:11:443Z"
                // }]
                // }
                //
                const item = result.data[0];
                // 合约名称
                expect(item).to.have.property('instrument_id');
                expect(item.instrument_id).to.equal('BTC-USD-SWAP');
                expect(item.instrument_id).to.be.not.empty;
                // 账户权益
                expect(item).to.have.property('equity');
                expect(item.equity).to.be.a('string');
                expect(item.equity).to.be.not.empty;
                // 已用保证金
                expect(item).to.have.property('margin');
                expect(item.margin).to.be.a('string');
                expect(item.margin).to.be.not.empty;
                // 开仓冻结保证金
                expect(item).to.have.property('margin_frozen');
                expect(item.margin_frozen).to.be.a('string');
                expect(item.margin_frozen).to.be.not.empty;
                // 保证金率
                expect(item).to.have.property('margin_ratio');
                expect(item.margin_ratio).to.be.a('string');
                expect(item.margin_ratio).to.be.not.empty;
                // 已实现盈亏
                expect(item).to.have.property('realized_pnl');
                expect(item.realized_pnl).to.be.a('string');
                expect(item.realized_pnl).to.be.not.empty;
                // 创建时间
                expect(item).to.have.property('timestamp');
                expect(item.timestamp).to.be.a('string');
                expect(item.timestamp).to.be.not.empty;
                // 账户余额
                expect(item).to.have.property('total_avail_balance');
                expect(item.total_avail_balance).to.be.a('string');
                expect(item.total_avail_balance).to.be.not.empty;
                // 未实现盈亏
                expect(item).to.have.property('unrealized_pnl');
                expect(item.unrealized_pnl).to.be.a('string');
                expect(item.unrealized_pnl).to.be.not.empty;
                // 账户类型：逐仓fixed 全仓crossed
                expect(item).to.have.property('margin_mode');
                expect(item.margin_mode).to.be.a('string');
                expect(item.margin_mode).to.be.not.empty;
                // 逐仓账户余额
                expect(item).to.have.property('fixed_balance');
                expect(item.fixed_balance).to.be.a('string');
                expect(item.fixed_balance).to.be.not.empty;

                done();
                client.removeListener('message', listener);
            }
        }

        client.on('message', listener);
        client.subscribe('swap/account:BTC-USD-SWAP');
    });

    after(done => {
        client.on('close', done);
        client.close();
    });

});