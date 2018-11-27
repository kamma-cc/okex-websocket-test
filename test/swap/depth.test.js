const expect = require('chai').expect;
const { V3WebsocketClient } = require('okex-node');
require('dotenv').load();
const websocketV3Uri = process.env['V3_WS_URL'];

describe('V3 API 推送-永续合约-深度数据', function () {

    const client = new V3WebsocketClient(websocketV3Uri);
    let listener;

    before(function (done) {
        client.connect();
        client.on('open', done);
    });

    afterEach(() => {
        if (listener) {
            client.removeListener('message', listener);
        }
    });

    it('深度 5 数据 swap/depth5', function (done) {
        let isSubscribed = false;
        listener = data => {
            // 处理返回异常信息
            if (data.indexOf('error') > -1 && data.indexOf('message') > -1 && data.indexOf('errorCode') > -1) {
                done(data);
            }
            // 返回数据 {event:'subscribe', subscribe:'swap/depth5:BTC-USD-SWAP'} 表示已订阅成功
            if (data.indexOf('subscribe') > -1 && data.indexOf('swap/depth5:BTC-USD-SWAP') > -1) {
                console.log('Subscribe Success [swap/depth5:BTC-USD-SWAP]')
                isSubscribed = true;
            } else if (isSubscribed && data.indexOf('swap/depth5') > -1) {
                console.log(data);
                const result = JSON.parse(data);
                expect(result).to.have.property('data');
                expect(result.data).to.be.an.instanceof(Array);
                expect(result.data.length).to.be.above(0);
                // 数据属性完整性及类型校验
                const item = result.data[0];
                expect(item).to.have.property('instrument_id');
                expect(item.instrument_id).to.equal('BTC-USD-SWAP');
                expect(item).to.have.property('asks');
                expect(item.asks).to.be.an.instanceof(Array);
                expect(item.asks.length).to.be.most(5);
                expect(item).to.have.property('bids');
                expect(item.bids).to.be.an.instanceof(Array);
                expect(item.bids.length).to.be.most(5)
                expect(item).to.have.property('timestamp');
                expect(item.timestamp).to.be.not.empty;

                done();
            }
        }

        client.on('message', listener);
        client.subscribe('swap/depth5:BTC-USD-SWAP');
    });

    it('深度 200 数据 swap/depth', function (done) {
        let isSubscribed = false;
        listener = data => {
            // 处理返回异常信息
            if (data.indexOf('error') > -1 && data.indexOf('message') > -1 && data.indexOf('errorCode') > -1) {
                done(data);
            }
            // 返回数据 {event:'subscribe', subscribe:'swap/depth:BTC-USD-SWAP'} 表示已订阅成功
            if (data.indexOf('subscribe') > -1 && data.indexOf('swap/depth:BTC-USD-SWAP') > -1) {
                console.log('Subscribe Success [swap/depth5:BTC-USD-SWAP]')
                isSubscribed = true;
            } else if (isSubscribed && data.indexOf('swap/depth') > -1) {
                console.log(data);
                const result = JSON.parse(data);
                // 数据属性完整性及类型校验
                // {
                // "table":"swap/depth",
                // "data":[{
                //  "instrument_id":"BTC-USD-SWAP",
                //  "timestamp":"2018-10-24T20:11:443Z",
                //  "asks": [[410.65,10,8,4],...], // size <= 200
                //  "bids": [[410.65,10,8,4],...], // size <= 200
                // }]
                // }
                //
                try {
                    expect(result).to.have.property('data');
                    expect(result.data).to.be.a('Array');
                    expect(result.data.length).to.be.equal(1);

                    const item = result.data[0];

                    expect(item).to.have.property('instrument_id');
                    expect(item.instrument_id).to.equal('BTC-USD-SWAP');

                    expect(item).to.have.property('timestamp');
                    expect(item.timestamp).to.be.not.empty;

                    expect(item).to.have.property('asks');
                    expect(item.asks).to.be.a('Array');
                    expect(item.asks.length).to.be.most(200);

                    expect(item).to.have.property('bids');
                    expect(item.bids).to.be.a('Array');
                    expect(item.bids.length).to.be.most(200);

                    done();
                } catch(e) {
                    done(e);
                } finally {
                    client.removeListener('message', listener);
                }
            }
        }

        client.on('message', listener);
        client.subscribe('swap/depth:BTC-USD-SWAP');

    });

    after(function(done)  {
        client.on('close', () => done());
        client.close();
    });
});