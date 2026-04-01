import React, { useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { VaButton } from '@department-of-veterans-affairs/component-library/dist/react-bindings';
import { selectIsCernerPatient } from 'platform/user/cerner-dsot/selectors';
import {
  getTooltipByName,
  createNewTooltip,
  setTooltip,
  incrementTooltip,
  updateTooltipVisibility,
} from '../../actions/tooltip';

const MAX_IPE_VIEWS = 3;

const InProductionEducationAlert = ({
  tooltipName,
  children,
  className,
  dismissButtonTestId,
  onDismiss,
  ...props
}) => {
  const dispatch = useDispatch();
  const tooltipVisible = useSelector(
    state => state.sm?.tooltip?.tooltipVisible,
  );
  const tooltipId = useSelector(state => state.sm?.tooltip?.tooltipId);
  const isCernerPatient = useSelector(selectIsCernerPatient);

  useEffect(
    () => {
      if (!isCernerPatient) return;

      const fetchOrCreateTooltip = async () => {
        const existing = await dispatch(getTooltipByName(tooltipName));

        if (existing?.id) {
          if (existing.counter >= MAX_IPE_VIEWS) {
            dispatch(updateTooltipVisibility(existing.id));
            return;
          }
          dispatch(setTooltip(existing.id, !existing.hidden));
          if (!existing.hidden) {
            dispatch(incrementTooltip(existing.id));
          }
        } else if (!existing) {
          const created = await dispatch(createNewTooltip(tooltipName));
          if (created?.id) {
            dispatch(setTooltip(created.id, !created.hidden));
            if (!created.hidden) {
              dispatch(incrementTooltip(created.id));
            }
          }
        }
      };

      fetchOrCreateTooltip();
    },
    [dispatch, isCernerPatient, tooltipName],
  );

  const handleStopShowing = useCallback(
    () => {
      if (tooltipId) {
        dispatch(updateTooltipVisibility(tooltipId));
      }
      if (onDismiss) {
        onDismiss();
      }
    },
    [dispatch, tooltipId, onDismiss],
  );

  if (!tooltipVisible || !isCernerPatient) return null;

  return (
    <aside className={`sm-ipe-alert ${className || ''}`} {...props}>
      {children}
      <VaButton
        className="vads-u-margin-top--3"
        secondary
        text="Stop showing this hint"
        data-testid={dismissButtonTestId}
        onClick={handleStopShowing}
      />
    </aside>
  );
};

InProductionEducationAlert.propTypes = {
  children: PropTypes.node.isRequired,
  tooltipName: PropTypes.string.isRequired,
  className: PropTypes.string,
  dismissButtonTestId: PropTypes.string,
  onDismiss: PropTypes.func,
};

export default InProductionEducationAlert;
