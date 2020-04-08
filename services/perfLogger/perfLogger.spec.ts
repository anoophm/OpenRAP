import { PerfLogger } from './index';
import { perfLogDataSet1, INITIAL_TRIGGER, DAY_IN_MILLISECONDS, MONTH_IN_MILLISECONDS } from './perfLogger.spec.data';
const sinon = require('sinon'), chai = require('chai'), pies = require('chai-spies');
chai.use(spies);
const spy = chai.spy.sandbox(), expect = chai.expect;

const mockDataBaseSDK = {
  data: [],
  bulkDocs: (db_name, data) => {
    this.perf_log = data;
    return Promise.resolve();
  },
  find : (db_name, query) => {
    const matchedRows = [];
    for(let log of this.perf_log){
      if(query.selector.createdOn['$gte'] >= log.createdOn && query.selector.createdOn['$lte'] <= log.createdOn){
        matchedRows.push(log);
      }
      if(query.limit === matchedRows.length){
        return Promise.resolve(matchedRows);
      }
    }
  }
}
describe.only('PerfLogger', async () => {
  let perfLogger;
  let clock;
  before(async () => {
    process.env.APP_BASE_URL = 'https://www.sunbird.org/';
    perfLogger = new PerfLogger();
    clock = sinon.useFakeTimers();
  });
  afterEach(async () => {
    clock.restore();
    spy.restore();
  })
  it(`should subscribe to timer on initialize and handleTimerEvent should be triggered after passed
        initial trigger value and every 24 hours`, () => {
    const handleTimerEvent = spy.on(perfLogger, 'handleTimerEvent', () => undefined);
    perfLogger.initialize(INITIAL_TRIGGER, DAY_IN_MILLISECONDS);
    clock.tick(INITIAL_TRIGGER + 1);
    expect(handleTimerEvent).to.have.been.called();
    expect(handleTimerEvent).to.have.been.called.once;
    expect(handleTimerEvent).to.have.been.called.with(0);
    clock.tick(DAY_IN_MILLISECONDS + 1);
    expect(handleTimerEvent).to.have.been.called.twice;
    expect(handleTimerEvent).to.have.been.called.with(1);
  });
});