import { createRoutesWithSaveInProgress } from 'platform/forms/save-in-progress/helpers';
import formConfig from './config/form';
import App from './containers/App';

const formRoutes = createRoutesWithSaveInProgress(formConfig);

// Standard pattern: root redirects to introduction
const route = {
  path: '/',
  component: App,
  indexRoute: { onEnter: (nextState, replace) => replace('introduction') },
  childRoutes: formRoutes,
};

export default route;
