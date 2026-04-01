import { useEffect } from 'react';
import { submitLaunchMessagingAal } from '../../api/SmApi';
import { getFirstError } from '../../util/serverErrors';

const LaunchMessagingAal = () => {
  useEffect(() => {
    const launch = async () => {
      try {
        await submitLaunchMessagingAal();
      } catch (e) {
        if (window.DD_RUM) {
          const error = new Error(
            `Error submitting AAL on Messaging launch. ${getFirstError(e) &&
              JSON.stringify(getFirstError(e))}`,
          );
          window.DD_RUM.addError(error);
        }
      }
    };
    launch();
  }, []);

  return null;
};

export default LaunchMessagingAal;
