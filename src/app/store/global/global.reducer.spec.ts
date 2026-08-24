import { globalReducer, initialGlobalState } from './global.reducer';
import { updateGlobalError } from './global.action';

describe('globalReducer', () => {
    describe('updateGlobalError', () => {
        it('replaces globalError with the full payload (esn, code, description)', () => {
            const state = globalReducer(
                initialGlobalState,
                updateGlobalError({
                    payload: { esn: '9630003', code: '140a', description: 'Description xxxxxx' },
                }),
            );
            expect(state.globalError).toEqual({
                esn: '9630003',
                code: '140a',
                description: 'Description xxxxxx',
            });
        });

        it('clears globalError back to empty code/description', () => {
            const stateWithError = globalReducer(
                initialGlobalState,
                updateGlobalError({ payload: { esn: '9630003', code: '140a', description: 'Something' } }),
            );
            const state = globalReducer(stateWithError, updateGlobalError({ payload: { code: '', description: '' } }));
            expect(state.globalError).toEqual({ code: '', description: '' });
        });
    });
});
