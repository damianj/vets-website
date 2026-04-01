import { expect } from 'chai';
import sinon from 'sinon';
import route from '../../routes';
import App from '../../containers/App';

describe('21-4502 routes', () => {
  it('exports a route object', () => {
    expect(route).to.be.an('object');
  });

  it('has correct root path', () => {
    expect(route.path).to.equal('/');
  });

  it('uses App component', () => {
    expect(route.component).to.equal(App);
  });

  it('has indexRoute that redirects to introduction (standard pattern)', () => {
    const replaceSpy = sinon.spy();
    route.indexRoute.onEnter({}, replaceSpy);
    expect(replaceSpy.calledWith('introduction')).to.be.true;
  });

  it('has form routes as child routes', () => {
    expect(route.childRoutes).to.be.an('array');
    expect(route.childRoutes.length).to.be.greaterThan(0);
  });
});
