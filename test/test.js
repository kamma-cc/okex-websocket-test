const expect = require('chai').expect;
const {V1WebsocketClient, V3WebsocketClient} = require('okex-node');
const websocketUri = process.env['V1_WS_URL'];
const websocketV3Uri = process.env['V3_WS_URL'];

describe('OKEx websocket 接口测试', function() {
  describe('V3 websocket 连接测试', function() {
    it('成功连接上服务器', function(done) {
      const client = new V3WebsocketClient(
          websocketV3Uri);
      client.connect();
      client.on('open', () => done());
    });
  });
  describe('V3 websocket 业务测试', function() {
    const client = new V3WebsocketClient(
        websocketV3Uri);
    before(function(done) {
      client.connect();
      client.on('open', () => done());
    });
    it('登录测试', function(done) {
      client.login(process.env['V3_API_KEY'], process.env['V3_SECRET_KEY'],
          process.env['V3_PASSPHRASE']);
      let number = 0;
      client.on('message', function listener(message) {
        if (message.indexOf('login') > -1 && message.indexOf('success') > -1) {
          done();
        }
      });
    });
    after(function(done) {
      client.on('close', () => done());
      client.close();
    });
  });
});