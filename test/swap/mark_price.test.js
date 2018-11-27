const expect = require('chai').expect;
const { V3WebsocketClient } = require('okex-node')
require('dotenv').load();
const websocketV3Uri = process.env['V3_WS_URL'];

describe('V3 API 推送-永续合约-标记价格', function () {

    const client = new V3WebsocketClient(websocketV3Uri);

    before(done => {
        client.connect();
        client.on('open', done);
    });

    it('swap/mark_price:BTC-USD-SWAP', done => {
        let isSubscribed = false;
        const listener = data => {
            // 返回数据 {event:'subscribe', subscribe:'swap/mark_price:BTC-USD-SWAP'} 表示已订阅成功
            if (data.indexOf('subscribe') > -1 && data.indexOf('swap/mark_price:BTC-USD-SWAP') > -1) {
                console.log(`subscribe success [swap/mark_price:BTC-USD-SWAP]`);
                isSubscribed = true;
            } else if (isSubscribed && data.indexOf('swap/mark_price') > -1) {
                console.log(data);
                try {
                    const result = JSON.parse(data);
                    expect(result).to.have.property('table');
                    expect(result.table).to.equal('swap/mark_price');

                    expect(result).to.have.property('data');
                    expect(result.data).to.be.a('Array');
                    expect(result.data.length).to.be.above(0);

                    const item = result.data[0];

                    expect(item).to.have.property('instrument_id');
                    expect(item.instrument_id).to.equal('BTC-USD-SWAP');

                    expect(item).to.have.property('mark_price');
                    expect(item.mark_price).to.be.a('string');

                    expect(item).to.have.property('timestamp');
                    expect(item.timestamp).to.be.a('string');

                    done();
                } catch(e) {
                    done(e);
                } finally {
                    client.removeListener('message', listener);
                }
            }
        }
        client.on('message', listener);
        client.subscribe('swap/mark_price:BTC-USD-SWAP');
    });

    after(done => {
        client.on('close', () => done());
        client.close();
    });

});