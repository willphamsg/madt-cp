import { applyKeyboardInput } from './keyboard-input.util';

describe('applyKeyboardInput', () => {
    let inputField: HTMLInputElement;

    beforeEach(() => {
        inputField = document.createElement('input');
    });

    function makeKeyTarget(id: string, innerText = ''): HTMLElement {
        const el = document.createElement('div');
        el.id = id;
        el.innerText = innerText;
        return el;
    }

    it('inserts a character at the caret position', () => {
        inputField.value = 'ac';
        inputField.setSelectionRange(1, 1);

        const result = applyKeyboardInput(inputField, makeKeyTarget('key-b', 'b'));

        expect(result).toBe('abc');
        expect(inputField.value).toBe('abc');
        expect(inputField.selectionStart).toBe(2);
        expect(inputField.selectionEnd).toBe(2);
    });

    it('replaces a selection when inserting a character', () => {
        inputField.value = 'abcd';
        inputField.setSelectionRange(1, 3);

        const result = applyKeyboardInput(inputField, makeKeyTarget('key-x', 'x'));

        expect(result).toBe('axd');
        expect(inputField.selectionStart).toBe(2);
        expect(inputField.selectionEnd).toBe(2);
    });

    it('deletes the character before the caret on backspace with no selection', () => {
        inputField.value = 'abc';
        inputField.setSelectionRange(2, 2);

        const result = applyKeyboardInput(inputField, makeKeyTarget('backspaceKey'));

        expect(result).toBe('ac');
        expect(inputField.selectionStart).toBe(1);
        expect(inputField.selectionEnd).toBe(1);
    });

    it('deletes the selected range on backspace with a selection', () => {
        inputField.value = 'abcd';
        inputField.setSelectionRange(1, 3);

        const result = applyKeyboardInput(inputField, makeKeyTarget('backspaceKey'));

        expect(result).toBe('ad');
        expect(inputField.selectionStart).toBe(1);
        expect(inputField.selectionEnd).toBe(1);
    });

    it('leaves the field value untouched on enterKey', () => {
        inputField.value = 'abc';
        inputField.setSelectionRange(3, 3);

        const result = applyKeyboardInput(inputField, makeKeyTarget('enterKey'));

        expect(result).toBe('abc');
    });

    it('uses explicit start/end overrides instead of the current selection', () => {
        inputField.value = 'abcd';

        const result = applyKeyboardInput(inputField, makeKeyTarget('key-z', 'z'), 4, 4);

        expect(result).toBe('abcdz');
    });

    it('falls back to 0 when selectionStart/selectionEnd are unavailable', () => {
        inputField.value = 'bc';
        spyOnProperty(inputField, 'selectionStart').and.returnValue(null);
        spyOnProperty(inputField, 'selectionEnd').and.returnValue(null);

        const result = applyKeyboardInput(inputField, makeKeyTarget('key-a', 'a'));

        expect(result).toBe('abc');
    });
});
