import React from 'react';
import Wrapper from '../layout/Wrapper';

export default function Error() {
  return (
    <Wrapper
      testID="error-page"
      errorAlert
      pageTitle="Schedule an appointment with VA Solid Start"
    />
  );
}
