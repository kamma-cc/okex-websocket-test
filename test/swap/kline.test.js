const expect = require('chai').expect;
const { V3WebsocketClient } = require('okex-node');
require('dotenv').load();
const websocketV3Uri = process.env.V3_WS_URL;

describe('V3 API 推送-永续合约-K-Line', () => {

    const client = new V3WebsocketClient(websocketV3Uri);
    let listener;

    before(done => {
        client.connect();
        client.on('open', () => {
            done();
        });
    });

    function expectTestCase(result, candle) {

        expect(result).to.have.property('table');
        expect(result.table).to.equal('swap/'+ candle);
        expect(result).to.have.property('data');
        expect(result.data).to.be.a('Array');
        expect(result.data.length).to.be.above(0);

        const item = result.data[0];
        expect(item).to.have.property('instrument_id');
        expect(item.instrument_id).to.be.equal('BTC-USD-SWAP');

        expect(item).to.have.property('candle');
        expect(item.candle).to.be.a('Array');
        expect(item.candle.length).to.be.equal(7);

    }

    let cases = ['60s', '180s', '300s', '900s', '1800s', '3600s', '7200s', '14400s', '21600s', '43200s', '86400s', '604800s'];

    cases.forEach(time => {
        let candle = 'candle'+ time;

        it (`K-Line case swap/${candle}:BTC-USD-SWAP`, done => {
            let isSubscribed = false;

            listener = data => {
                // 处理返回异常信息
                if (data.indexOf('error') > -1 && data.indexOf('message') > -1 && data.indexOf('errorCode') > -1) {
                    done(data);
                }
                // 返回数据 {event:'subscribe', subscribe:'swap/candle60s:BTC-USD-SWAP'} 表示已订阅成功
                if (data.indexOf('subscribe') > -1 && data.indexOf(`swap/${candle}:BTC-USD-SWAP`) > -1) {
                    console.log(`subscribe success [swap/${candle}:BTC-USD-SWAP]`);
                    isSubscribed = true;
                } else if (isSubscribed && data.indexOf(`swap/${candle}`) > -1) {
                    console.log(data);
                    const result = JSON.parse(data);
                    // expectTestCase 通过，表示测试用例成功
                    expectTestCase(result, candle);
                    done();
                    client.removeListener('message', listener);
                }
            }

            client.on('message', listener);
            client.subscribe(`swap/${candle}:BTC-USD-SWAP`);
        });

    });

    afterEach(() => {
        client.removeListener('message', listener);
    });

    after(done => {
        client.on('close', done);
        client.close();
    });

});
