const expect = require('chai').expect;
const { V3WebsocketClient } = require('okex-node');
require('dotenv').load();
const websocketV3Uri = process.env['V3_WS_URL'];

describe('V3 API 推送-永续合约-限价范围', function () {

    const client = new V3WebsocketClient(websocketV3Uri);

    before(done => {
        client.connect();
        client.on('open', done);
    });

    it('swap/price_range:BTC-USD-SWAP', done => {
        let isSubscribed = false;
        const listener = data => {
            const result = JSON.parse(data);
            if (result.event === 'error') {
                done(data);
                return;
            }
            // 返回数据 {event:'subscribe', subscribe:'swap/price_range:BTC-USD-SWAP'} 表示已订阅成功
            if (result.event === 'subscribe' && result.subscribe === `swap/price_range:BTC-USD-SWAP`) {
                console.log('subscribe success [swap/price_range:BTC-USD-SWAP]');
                isSubscribed = true;
            } else if (isSubscribed) {
                try {
                    expect(result).to.have.property('table');
                    expect(result.table).to.equal('swap/price_range');
                    expect(result).to.have.property('data');
                    expect(result.data).to.be.an.instanceof(Array);
                    expect(result.data.length).to.be.above(0);

                    const item = result.data[0];
                    // 合约名称
                    expect(item).to.have.property('instrument_id');
                    expect(item.instrument_id).to.equal('BTC-USD-SWAP');
                    expect(item.instrument_id).to.not.empty;
                    // 最低卖价
                    expect(item).to.have.property('lowest');
                    expect(item.lowest).to.be.a('string');
                    expect(item.lowest).to.be.not.empty;
                    // 最高买价
                    expect(item).to.have.property('highest');
                    expect(item.highest).to.be.a('string');
                    expect(item.highest).to.be.not.empty;
                    // 系统时间戳
                    expect(item).to.have.property('timestamp');
                    expect(item.timestamp).to.be.a('string');
                    expect(item.timestamp).to.be.not.empty;

                    done();
                } catch(e) {
                    done(e)
                } finally {
                    client.removeListener('message', listener);
                }

            }
        }
        client.on('message', listener);
        client.subscribe('swap/price_range:BTC-USD-SWAP');
    });

    after(done => {
        client.on('close', done);
        client.close();
    });
});