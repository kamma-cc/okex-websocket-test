const expect = require('chai').expect;
const { V3PublicClient } = require('okex-node');

describe('V3 API 推送-永续合约-Instruments', function() {

    const client = new V3PublicClient('https://www.okex.com/');

    const expectItem = (item, attribute) => {
        expect(item).to.have.property(attribute);
        expect(item[attribute]).to.be.a('string');
        expect(item[attribute]).to.be.not.empty;
    }

    it('getSwapInstruments', async () => {
        const instruments = await client.getSwapInstruments();
        console.log(instruments);
        expect(instruments).to.be.a('array');
        [...instruments].forEach(item => {
            expectItem(item, 'instrument_id');
            expectItem(item, 'underlying_index');
            expectItem(item, 'quote_currency');
            expectItem(item, 'coin');
            expectItem(item, 'contract_val');
            expectItem(item, 'listing');
            expectItem(item, 'delivery');
            expectItem(item, 'size_increment');
            expectItem(item, 'tick_size');
        });
    });

});