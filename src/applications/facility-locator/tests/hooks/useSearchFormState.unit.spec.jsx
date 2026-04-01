import { expect } from 'chai';
import { renderHook, act } from '@testing-library/react-hooks';
import useSearchFormState from '../../hooks/useSearchFormState';

describe('useSearchFormState hook', () => {
  const getDefaultQuery = () => ({
    facilityType: null,
    serviceType: null,
    searchString: '',
    vamcServiceDisplay: null,
  });

  describe('initialization', () => {
    it('should initialize draft state from currentQuery', () => {
      const currentQuery = {
        facilityType: 'health',
        serviceType: 'primaryCare',
        searchString: 'Austin, TX',
        vamcServiceDisplay: 'Primary care',
      };

      const { result } = renderHook(() => useSearchFormState(currentQuery));

      expect(result.current.draftFormState.facilityType).to.equal('health');
      expect(result.current.draftFormState.serviceType).to.equal('primaryCare');
      expect(result.current.draftFormState.searchString).to.equal('Austin, TX');
      expect(result.current.draftFormState.vamcServiceDisplay).to.equal(
        'Primary care',
      );
    });

    it('should initialize with default form flags', () => {
      const { result } = renderHook(() =>
        useSearchFormState(getDefaultQuery()),
      );

      expect(result.current.draftFormState.isValid).to.be.true;
      expect(result.current.draftFormState.locationChanged).to.be.false;
      expect(result.current.draftFormState.facilityTypeChanged).to.be.false;
      expect(result.current.draftFormState.serviceTypeChanged).to.be.false;
    });

    it('should initialize selectedServiceType as null', () => {
      const { result } = renderHook(() =>
        useSearchFormState(getDefaultQuery()),
      );

      expect(result.current.selectedServiceType).to.be.null;
    });
  });

  describe('updateDraftState', () => {
    it('should merge updates into draft state', () => {
      const { result } = renderHook(() =>
        useSearchFormState(getDefaultQuery()),
      );

      act(() => {
        result.current.updateDraftState({ searchString: 'Denver, CO' });
      });

      expect(result.current.draftFormState.searchString).to.equal('Denver, CO');
    });

    it('should accept an updater function', () => {
      const currentQuery = {
        ...getDefaultQuery(),
        searchString: 'Austin',
      };
      const { result } = renderHook(() => useSearchFormState(currentQuery));

      act(() => {
        result.current.updateDraftState(prev => ({
          ...prev,
          searchString: `${prev.searchString}, TX`,
        }));
      });

      expect(result.current.draftFormState.searchString).to.equal('Austin, TX');
    });

    it('should run validation after update', () => {
      const { result } = renderHook(() =>
        useSearchFormState(getDefaultQuery()),
      );

      act(() => {
        result.current.updateDraftState({
          searchString: 'Austin, TX',
          facilityType: 'health',
        });
      });

      expect(result.current.draftFormState.isValid).to.be.true;
      expect(result.current.draftFormState.locationChanged).to.be.true;
      expect(result.current.draftFormState.facilityTypeChanged).to.be.true;
    });

    it('should mark form invalid when required fields missing', () => {
      const currentQuery = {
        ...getDefaultQuery(),
        searchString: 'Austin, TX',
        facilityType: 'health',
      };
      const { result } = renderHook(() => useSearchFormState(currentQuery));

      act(() => {
        result.current.updateDraftState({ searchString: '' });
      });

      expect(result.current.draftFormState.isValid).to.be.false;
    });
  });

  describe('handleFacilityTypeChange', () => {
    it('should update facility type from event', () => {
      const { result } = renderHook(() =>
        useSearchFormState(getDefaultQuery()),
      );

      act(() => {
        result.current.handleFacilityTypeChange({
          target: { value: 'health' },
        });
      });

      expect(result.current.draftFormState.facilityType).to.equal('health');
    });

    it('should reset serviceType when facility type changes', () => {
      const currentQuery = {
        ...getDefaultQuery(),
        facilityType: 'health',
        serviceType: 'primaryCare',
        vamcServiceDisplay: 'Primary care',
      };
      const { result } = renderHook(() => useSearchFormState(currentQuery));

      act(() => {
        result.current.handleFacilityTypeChange({
          target: { value: 'benefits' },
        });
      });

      expect(result.current.draftFormState.facilityType).to.equal('benefits');
      expect(result.current.draftFormState.serviceType).to.be.null;
      expect(result.current.draftFormState.vamcServiceDisplay).to.be.null;
    });

    it('should set facilityTypeChanged flag', () => {
      const { result } = renderHook(() =>
        useSearchFormState(getDefaultQuery()),
      );

      act(() => {
        result.current.handleFacilityTypeChange({
          target: { value: 'health' },
        });
      });

      expect(result.current.draftFormState.facilityTypeChanged).to.be.true;
    });
  });

  describe('handleServiceTypeChange', () => {
    it('should update service type from event target', () => {
      const { result } = renderHook(() =>
        useSearchFormState(getDefaultQuery()),
      );

      act(() => {
        result.current.handleServiceTypeChange({
          target: { value: 'primaryCare' },
          selectedItem: { id: 'primaryCare', name: 'Primary care' },
        });
      });

      expect(result.current.draftFormState.serviceType).to.equal('primaryCare');
    });

    it('should set selectedServiceType from selectedItem', () => {
      const { result } = renderHook(() =>
        useSearchFormState(getDefaultQuery()),
      );

      const selectedItem = { id: 'primaryCare', name: 'Primary care' };
      act(() => {
        result.current.handleServiceTypeChange({
          target: { value: 'primaryCare' },
          selectedItem,
        });
      });

      expect(result.current.selectedServiceType).to.deep.equal(selectedItem);
    });

    it('should treat "All" as null serviceType', () => {
      const currentQuery = {
        ...getDefaultQuery(),
        serviceType: 'primaryCare',
      };
      const { result } = renderHook(() => useSearchFormState(currentQuery));

      act(() => {
        result.current.handleServiceTypeChange({
          target: { value: 'All' },
          selectedItem: null,
        });
      });

      expect(result.current.draftFormState.serviceType).to.be.null;
    });

    it('should trim whitespace from service type value', () => {
      const { result } = renderHook(() =>
        useSearchFormState(getDefaultQuery()),
      );

      act(() => {
        result.current.handleServiceTypeChange({
          target: { value: '  primaryCare  ' },
          selectedItem: null,
        });
      });

      expect(result.current.draftFormState.serviceType).to.equal('primaryCare');
    });
  });

  describe('setDraftFormState', () => {
    it('should be exposed for direct state manipulation', () => {
      const { result } = renderHook(() =>
        useSearchFormState(getDefaultQuery()),
      );

      act(() => {
        result.current.setDraftFormState(prev => ({
          ...prev,
          isValid: false,
          locationChanged: true,
        }));
      });

      expect(result.current.draftFormState.isValid).to.be.false;
      expect(result.current.draftFormState.locationChanged).to.be.true;
    });
  });

  describe('submitErrorsRef preservation', () => {
    it('preserves submit errors across unrelated field changes when field is still invalid', () => {
      const currentQuery = {
        facilityType: null,
        serviceType: null,
        searchString: '',
        vamcServiceDisplay: null,
      };
      const { result } = renderHook(() => useSearchFormState(currentQuery));

      // Simulate submit setting location error
      act(() => {
        result.current.setSubmitErrors({ locationChanged: true });
      });

      // Change an unrelated field (facility type) while location is still empty
      act(() => {
        result.current.updateDraftState({ facilityType: 'health' });
      });

      // Location error should persist because searchString is still empty
      expect(result.current.draftFormState.locationChanged).to.be.true;
    });

    it('clears submit error when the corresponding field becomes valid', () => {
      const currentQuery = {
        facilityType: null,
        serviceType: null,
        searchString: '',
        vamcServiceDisplay: null,
      };
      const { result } = renderHook(() => useSearchFormState(currentQuery));

      // Simulate submit setting location error
      act(() => {
        result.current.setSubmitErrors({ locationChanged: true });
      });

      // Fix the field by entering a location
      act(() => {
        result.current.updateDraftState({ searchString: 'Austin, TX' });
      });

      expect(result.current.draftFormState.locationChanged).to.be.true;

      // Update without changing searchString — error no longer sticky
      act(() => {
        result.current.updateDraftState({ facilityType: 'health' });
      });

      expect(result.current.draftFormState.locationChanged).to.be.false;
    });

    it('clears service type submit error when facility type changes', () => {
      const currentQuery = {
        facilityType: 'provider',
        serviceType: null,
        searchString: 'Austin, TX',
        vamcServiceDisplay: null,
      };
      const { result } = renderHook(() => useSearchFormState(currentQuery));

      // Simulate submit setting service type error
      act(() => {
        result.current.setSubmitErrors({ serviceTypeChanged: true });
      });

      // Change facility type away from provider
      act(() => {
        result.current.handleFacilityTypeChange({
          target: { value: 'health' },
        });
      });

      // Service type error should be cleared because facility type changed
      expect(result.current.draftFormState.serviceTypeChanged).to.be.false;
    });

    it('does not produce sticky errors when editing without a prior submit', () => {
      const currentQuery = {
        facilityType: null,
        serviceType: null,
        searchString: '',
        vamcServiceDisplay: null,
      };
      const { result } = renderHook(() => useSearchFormState(currentQuery));

      act(() => {
        result.current.updateDraftState({
          searchString: 'Austin, TX',
          facilityType: 'health',
        });
      });

      // Flags are true because fields changed from initial values
      expect(result.current.draftFormState.locationChanged).to.be.true;
      expect(result.current.draftFormState.facilityTypeChanged).to.be.true;

      // Update without changing any field values
      act(() => {
        result.current.updateDraftState({
          searchString: 'Austin, TX',
          facilityType: 'health',
        });
      });

      // Without submit errors, flags reset because validateForm sees no diff
      expect(result.current.draftFormState.locationChanged).to.be.false;
      expect(result.current.draftFormState.facilityTypeChanged).to.be.false;
      expect(result.current.draftFormState.serviceTypeChanged).to.be.false;
    });
  });

  describe('validation for CC_PROVIDER', () => {
    it('should mark form invalid when provider type has no serviceType', () => {
      const { result } = renderHook(() =>
        useSearchFormState(getDefaultQuery()),
      );

      act(() => {
        result.current.updateDraftState({
          searchString: 'Austin, TX',
          facilityType: 'provider',
          serviceType: null,
        });
      });

      expect(result.current.draftFormState.isValid).to.be.false;
    });

    it('should mark form valid when provider type has serviceType', () => {
      const { result } = renderHook(() =>
        useSearchFormState(getDefaultQuery()),
      );

      act(() => {
        result.current.updateDraftState({
          searchString: 'Austin, TX',
          facilityType: 'provider',
          serviceType: 'dentist',
        });
      });

      expect(result.current.draftFormState.isValid).to.be.true;
    });
  });
});
