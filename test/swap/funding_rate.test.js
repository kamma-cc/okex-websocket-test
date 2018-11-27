const expect = require('chai').expect;
const { V3WebsocketClient } = require('okex-node');
require('dotenv').load();
const websocketV3Uri = process.env['V3_WS_URL'];

describe('V3 API 推送-永续合约-资金费率', function () {

    const client = new V3WebsocketClient(websocketV3Uri);

    before(done => {
        client.connect();
        client.on('open', () => {
            done();
        });
    });

    it('swap/funding_rate:BTC-USD-SWAP', done => {
        let isSubscribed = false;
        const listener = data => {
            // 返回数据 {event:'subscribe', subscribe:'swap/funding_rate:BTC-USD-SWAP'} 表示已订阅成功
            if (data.indexOf('subscribe') > -1 && data.indexOf('swap/funding_rate:BTC-USD-SWAP') > -1) {
                console.log('subscribe success [swap/funding_rate:BTC-USD-SWAP]');
                isSubscribed = true;
            } else if (isSubscribed && data.indexOf('swap/funding_rate') > -1) {
                try {
                    console.log(data);
                    const result = JSON.parse(data);
                    // 数据属性完整性及类型校验
                    // {
                    // "table":"swap/funding_rate",
                    // "data":[{
                    //  "instrument_id":"BTC-USD-SWAP",
                    //  "timestamp":"2018-10-24T20:11:443Z",
                    //  "interest_rate": "0.0025",
                    //  "funding_rate": "0"
                    // }]
                    // }
                    //
                    expect(result).to.have.property('table');
                    expect(result.table).to.equal('swap/funding_rate');

                    expect(result).to.have.property('data');
                    expect(result.data).to.be.a('Array');
                    expect(result.data.length).to.be.above(0);

                    const item = result.data[0];
                    // 合约名称
                    expect(item).to.have.property('instrument_id');
                    expect(item.instrument_id).to.equal('BTC-USD-SWAP');
                    // 结算时间
                    expect(item).to.have.property('funding_time');
                    expect(item.funding_time).to.be.a('string');
                    expect(item.funding_time).to.be.not.empty;
                    // 利率
                    expect(item).to.have.property('interest_rate');
                    expect(item.interest_rate).to.be.a('string');
                    expect(item.interest_rate).to.be.not.empty;
                    // 资金费率
                    expect(item).to.have.property('funding_rate');
                    expect(item.funding_rate).to.be.a('string');
                    expect(item.funding_rate).to.be.not.empty;

                    done();
                } catch(e) {
                    done(e);
                } finally {
                    client.removeListener('message', listener);
                }
            }
        }

        client.on('message', listener);
        client.subscribe('swap/funding_rate:BTC-USD-SWAP');
    });

    after(done => {
        client.on('close', done);
        client.close();
    });
});