import { beforeEach, describe, expect, it } from 'vitest';
import { runAssertion } from '../../asserts';

describe('runAssertion', () => {
  let div: HTMLDivElement;
  let input: HTMLInputElement;
  let option: HTMLOptionElement;

  beforeEach(() => {
    div = document.createElement('div');
    input = document.createElement('input');
    option = document.createElement('option');
  });
  
  // Content assertions
  it('should assert have.text', () => {
    div.textContent = 'Hello World';
    expect(() => runAssertion(div, 'have.text', 'Hello World')).not.toThrow();
    const message = runAssertion(div, 'have.text', 'Hello World');
    expect(message).toBe('Assertion passed: Text is exactly "Hello World"');
    expect(() => runAssertion(div, 'have.text', 'Wrong Text')).toThrow('Assertion failed: Expected text to be "Wrong Text", but got "Hello World"');
  });

  it('should assert not.have.text', () => {
    div.textContent = 'Hello World';
    expect(() => runAssertion(div, 'not.have.text', 'Hello World')).toThrow('Assertion failed: Expected text to not be "Hello World", but got "Hello World"');
    expect(() => runAssertion(div, 'not.have.text', 'Wrong Text')).not.toThrow();
  });

  it('should assert contain.text', () => {
    div.textContent = 'Hello World';
    expect(() => runAssertion(div, 'contain.text', 'World')).not.toThrow();
    expect(() => runAssertion(div, 'contain.text', 'Missing')).toThrow('Assertion failed: Expected text to contain "Missing", but got "Hello World"');
    const message = runAssertion(div, 'contain.text', 'World');
    expect(message).toBe('Assertion passed: Text contains "World"');
  });

  it('should assert be.empty', () => {
    div.textContent = '';
    expect(() => runAssertion(div, 'be.empty')).not.toThrow();
    const message = runAssertion(div, 'be.empty');
    expect(message).toBe('Assertion passed: Text is empty');
    div.textContent = 'Not Empty';
    expect(() => runAssertion(div, 'be.empty')).toThrow('Assertion failed: Expected text to be empty, but got "Not Empty"');
  });

  // Attribute assertions
  it('should assert have.attr', () => {
    div.setAttribute('data-test', 'value');
    expect(() => runAssertion(div, 'have.attr', 'data-test', 'value')).not.toThrow();
    expect(() => runAssertion(div, 'have.attr', 'data-test', 'wrong')).toThrow('Assertion failed: Expected attribute "data-test" to be "wrong", but got "value"');
    const message = runAssertion(div, 'have.attr', 'data-test', 'value');
    expect(message).toBe('Assertion passed: Attribute "data-test" is "value"');
  });

  it('should assert have.value', () => {
    input.value = 'input value';
    expect(() => runAssertion(input, 'have.value', 'input value')).not.toThrow();
    expect(() => runAssertion(input, 'have.value', 'wrong value')).toThrow('Assertion failed: Expected value to be "wrong value", but got "input value"');
    const message = runAssertion(input, 'have.value', 'input value');
    expect(message).toBe('Assertion passed: Value is "input value"');
  });

  // State assertions
  it('should assert be.disabled and be.enabled', () => {
    input.disabled = true;
    expect(() => runAssertion(input, 'be.disabled')).not.toThrow();
    expect(() => runAssertion(input, 'be.enabled')).toThrow('Assertion failed: Expected element to be enabled');
    const message = runAssertion(input, 'be.disabled');
    expect(message).toBe('Assertion passed: Element is disabled');
    input.disabled = false;
    expect(() => runAssertion(input, 'be.enabled')).not.toThrow();
    expect(() => runAssertion(input, 'be.disabled')).toThrow();
  });

  it('should assert be.checked', () => {
    input.type = 'checkbox';
    input.checked = true;
    expect(() => runAssertion(input, 'be.checked')).not.toThrow();
    const message = runAssertion(input, 'be.checked');
    expect(message).toBe('Assertion passed: Element is checked');
    input.checked = false;
    expect(() => runAssertion(input, 'be.checked')).toThrow('Assertion failed: Expected element to be checked');
  });

  it('should assert be.selected', () => {
    option.selected = true;
    expect(() => runAssertion(option, 'be.selected')).not.toThrow();
    const message = runAssertion(option, 'be.selected');
    expect(message).toBe('Assertion passed: Element is selected');
    option.selected = false;
    expect(() => runAssertion(option, 'be.selected')).toThrow('Assertion failed: Expected element to be selected');
  });

  it('should assert be.focused', () => {
    document.body.appendChild(input);
    input.focus();
    expect(() => runAssertion(input, 'be.focused')).not.toThrow();
    const message = runAssertion(input, 'be.focused');
    expect(message).toBe('Assertion passed: Element is focused');
    const anotherInput = document.createElement('input');
    document.body.appendChild(anotherInput);
    anotherInput.focus();
    expect(() => runAssertion(input, 'be.focused')).toThrow('Assertion failed: Expected element to be focused');
  });

  // Visibility assertions
  it('should assert be.visible and not.be.visible', () => {
    div.style.display = 'block';
    document.body.appendChild(div);
    expect(() => runAssertion(div, 'be.visible')).not.toThrow();
    const message = runAssertion(div, 'be.visible');
    expect(message).toBe('Assertion passed: Element is visible');
    div.style.display = 'none';
    expect(() => runAssertion(div, 'be.visible')).toThrow('Assertion failed: Expected element to be visible');
    expect(() => runAssertion(div, 'not.be.visible')).not.toThrow();
  });

  // Class assertions
  it('should assert have.class and not.have.class', () => {
    div.className = 'active';
    expect(() => runAssertion(div, 'have.class', 'active')).not.toThrow();
    const message = runAssertion(div, 'have.class', 'active');
    expect(message).toBe('Assertion passed: Element has class "active"');
    expect(() => runAssertion(div, 'have.class', 'inactive')).toThrow('Assertion failed: Expected element to have class "inactive"');
    expect(() => runAssertion(div, 'not.have.class', 'inactive')).not.toThrow();
    expect(() => runAssertion(div, 'not.have.class', 'active')).toThrow('Assertion failed: Expected element to not have class "active"');
  });

  // default case
  it('should throw for unknown assertion', () => {
    expect(() => runAssertion(div, 'unknown.assertion' as any)).toThrow('Unknown assertion: unknown.assertion');
  });
});
