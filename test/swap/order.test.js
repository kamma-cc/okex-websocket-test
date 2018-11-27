const expect = require('chai').expect;
const { V3WebsocketClient } = require('okex-node');
require('dotenv').load();
const websocketV3Uri = process.env['V3_WS_URL'];

describe('V3 API 推送-永续合约-交易详情', function () {

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

    it('swap/order:BTC-USD-SWAP', done => {
        let isSubscribed = false;
        const listener = data => {
            const result = JSON.parse(data);
            if (result.event === 'error') {
                done(data);
                return;
            }
            // 返回数据 {event:'subscribe', subscribe:'swap/order:BTC-USD-SWAP'} 表示已订阅成功
            if (result.event === 'subscribe' && result.subscribe === `swap/order:BTC-USD-SWAP`) {
                console.log(`subscribe success [swap/order:BTC-USD-SWAP]`);
                isSubscribed = true;
            } else if (isSubscribed) {
                // 验证数据返回与API规范
                expect(result).to.have.property('table');
                expect(result.table).to.equal('swap/order');

                expect(result).to.have.property('data');
                expect(result.data).to.be.an.instanceof(Array);
                expect(result.data.length).to.be.above(0);

                const item = result.data[0];

                expect(item).to.have.property('instrument_id');
                expect(item.instrument_id).to.equal('BTC-USD-SWAP');

                expect(item).to.have.property('size');
                expect(item.size).to.be.a('string');

                expect(item).to.have.property('timestamp');
                expect(item.timestamp).to.be.a('string');

                expect(item).to.have.property('filled_qty');
                expect(item.filled_qty).to.be.a('string');

                expect(item).to.have.property('fee');
                expect(item.fee).to.be.a('string');

                expect(item).to.have.property('order_id');
                expect(item.order_id).to.be.a('string');

                expect(item).to.have.property('price');
                expect(item.price).to.be.a('string');

                expect(item).to.have.property('price_avg');
                expect(item.price_avg).to.be.a('string');

                expect(item).to.have.property('status');
                expect(item.status).to.be.a('string');

                expect(item).to.have.property('type');
                expect(item.type).to.be.a('string');

                expect(item).to.have.property('contract_val');
                expect(item.contract_val).to.be.a('string');
                done();
                client.removeListener('message', listener);
            }
        }

        client.on('message', listener);
        client.subscribe('swap/order:BTC-USD-SWAP');
    });

    after(done => {
        client.on('close', () => done());
        client.close();
    });

});