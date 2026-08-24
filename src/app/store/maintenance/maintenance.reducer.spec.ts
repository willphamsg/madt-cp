import {
    maintenanceReducer,
    initialMaintenanceState,
    updateManualCalibrateBls,
    updateFareBusStopMode,
} from './maintenance.reducer';

describe('maintenanceReducer', () => {
    describe('updateManualCalibrateBls', () => {
        it('should use payload.newFactor when provided', () => {
            const state = maintenanceReducer(
                initialMaintenanceState,
                updateManualCalibrateBls({ payload: { newFactor: 5 } }),
            );
            expect(state.manualCalibrateBls.newFactor).toBe(5);
        });

        it('should fall back to the existing newFactor when payload.newFactor is falsy', () => {
            const withFactor = maintenanceReducer(
                initialMaintenanceState,
                updateManualCalibrateBls({ payload: { newFactor: 5 } }),
            );
            const state = maintenanceReducer(withFactor, updateManualCalibrateBls({ payload: {} }));
            expect(state.manualCalibrateBls.newFactor).toBe(5);
        });

        it('should use payload.timeout when provided', () => {
            const state = maintenanceReducer(
                initialMaintenanceState,
                updateManualCalibrateBls({ payload: { timeout: 3000 } }),
            );
            expect(state.manualCalibrateBls.timeout).toBe(3000);
        });

        it('should default timeout to undefined when payload.timeout is falsy', () => {
            const state = maintenanceReducer(initialMaintenanceState, updateManualCalibrateBls({ payload: {} }));
            expect(state.manualCalibrateBls.timeout).toBeUndefined();
        });
    });

    describe('updateFareBusStopMode', () => {
        it('should use payload.timeout when provided', () => {
            const state = maintenanceReducer(
                initialMaintenanceState,
                updateFareBusStopMode({ payload: { timeout: 4000 } }),
            );
            expect(state.fareBusStopMode.timeout).toBe(4000);
        });

        it('should default timeout to undefined when payload.timeout is falsy', () => {
            const state = maintenanceReducer(initialMaintenanceState, updateFareBusStopMode({ payload: {} }));
            expect(state.fareBusStopMode.timeout).toBeUndefined();
        });
    });
});
