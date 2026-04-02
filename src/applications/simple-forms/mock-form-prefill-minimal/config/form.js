import { createFormConfig } from '../../mock-form-prefill/config/form';
import manifest from '../manifest.json';

/** @type {FormConfig} */
const formConfig = createFormConfig({ rootUrl: manifest.rootUrl });

export default formConfig;
