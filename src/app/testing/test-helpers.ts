/**
 * Shared test helpers for Angular unit tests.
 * Provides initialState for provideMockStore() to avoid NgRx selector errors.
 */
import { initialGlobalState } from '@store/global/global.reducer';
import { initialMainState } from '@store/main/main.reducer';
import { initialMaintenanceState } from '@store/maintenance/maintenance.reducer';
import { initialFareState } from '@store/fare/fare.reducer';

export const mockInitialState = {
    global: initialGlobalState,
    main: initialMainState,
    maintenance: initialMaintenanceState,
    fare: initialFareState,
};
