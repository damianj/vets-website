import content from '../../locales/en/content.json';
import { replaceStrValues } from './formatting';

/**
 * Creates a function that generates modal titles or descriptions based on item/noun context.
 * @param {string} itemKey - Content key to use when item name exists
 * @param {string} nounKey - Content key to use when item name does not exist
 * @returns {Function} Function that accepts props and returns formatted content string
 *
 * @example
 * const cancelEditTitle = createModalTitleOrDescription(
 *   'health-insurance--cancel-edit-item-title',
 *   'health-insurance--cancel-edit-noun-title',
 * );
 * // Later called with props: cancelEditTitle(props) -> 'Cancel editing Blue Cross?'
 */
export const createModalTitleOrDescription = (itemKey, nounKey) => props => {
  const itemName = props.getItemName(
    props.itemData,
    props.index,
    props.formData,
  );
  const contentKey = itemName ? itemKey : nounKey;
  const replacementValue = itemName || props.nounSingular;
  return replaceStrValues(content[contentKey], replacementValue);
};
