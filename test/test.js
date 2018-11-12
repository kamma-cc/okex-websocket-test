const expect = require('chai').expect;
const V1WebsocketClient = require('okex-node').V1WebsocketClient;
const websocketUri = process.env["V1_WS_URL"];

describe('OKEx websocket 接口测试', function() {
  describe('V1 websocket 连接测试', function() {
    it('成功连接上服务器', function(done) {
      const client = new V1WebsocketClient(
          websocketUri);
      client.connect();
      client.on('open', () => done());
    });
  });
  describe('V1 websocket 业务测试', function() {
    const client = new V1WebsocketClient(
        websocketUri);
    before(function(done) {
      client.connect();
      client.on('open', () => done());
    });
    it('订阅BTC-USDT增量深度', function(done) {
      client.subscribeSpotDepth('BTC-USDT');
      let number = 0;
      client.on('message', function listener(message) {
        if (message.indexOf('ok_sub_spot_btc_usdt_depth') > -1) {
          number++;
          if (number > 2) {
            done();
            client.removeListener('message', listener);
          }
        }
      });
    });
    it('订阅BTC-USDT最新成交', function(done) {
      this.timeout(60000);
      client.subscribeSpotDeals('BTC-USDT');
      let number = 0;
      client.on('message', function listener(message) {
        if (message.indexOf('ok_sub_spot_btc_usdt_deals') > -1) {
          number++;
          if (number > 2) {
            done();
            client.removeListener('message', listener);
          }
        }
      });
    });
    after(function(done) {
      client.on('close', () => done());
      client.close();
    });
  });
});