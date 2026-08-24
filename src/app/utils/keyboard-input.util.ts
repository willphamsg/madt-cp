/**
 * Applies a single custom-keyboard key press (backspace or character) to an
 * `<input>` element, mirroring the caret-aware insert/delete behavior shared
 * by every screen that drives a text field from the `custom-keyboard` component.
 *
 * `enterKey` presses are intentionally left untouched here — callers own the
 * "submit" behavior for their own confirm action, so this only mutates
 * `inputField` for backspace/character keys and simply returns the
 * (possibly unchanged) value for the `enterKey` case.
 */
export function applyKeyboardInput(
    inputField: HTMLInputElement,
    target: HTMLElement,
    start: number = inputField?.selectionStart ?? 0,
    end: number = inputField?.selectionEnd ?? 0,
): string {
    const value = inputField.value;

    if (target.id === 'backspaceKey') {
        if (start === end) {
            inputField.value = value.slice(0, start - 1) + value.slice(end);
            inputField.selectionStart = inputField.selectionEnd = start - 1;
        } else {
            inputField.value = value.slice(0, start) + value.slice(end);
            inputField.selectionStart = inputField.selectionEnd = start;
        }
    } else if (target.id !== 'enterKey') {
        const keyValue = target.innerText.trim();
        inputField.value = value.slice(0, start) + keyValue + value.slice(end);
        inputField.selectionStart = inputField.selectionEnd = start + keyValue.length;
    }

    return inputField.value;
}
