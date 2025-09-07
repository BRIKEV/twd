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
    expect(() => runAssertion(div, 'have.text', 'Wrong Text')).toThrow();
  });

  it('should assert contain.text', () => {
    div.textContent = 'Hello World';
    expect(() => runAssertion(div, 'contain.text', 'World')).not.toThrow();
    expect(() => runAssertion(div, 'contain.text', 'Missing')).toThrow();
  });

  it('should assert be.empty', () => {
    div.textContent = '';
    expect(() => runAssertion(div, 'be.empty')).not.toThrow();
    div.textContent = 'Not Empty';
    expect(() => runAssertion(div, 'be.empty')).toThrow();
  });

  // Attribute assertions
  it('should assert have.attr', () => {
    div.setAttribute('data-test', 'value');
    expect(() => runAssertion(div, 'have.attr', 'data-test', 'value')).not.toThrow();
    expect(() => runAssertion(div, 'have.attr', 'data-test', 'wrong')).toThrow();
  });

  it('should assert have.value', () => {
    input.value = 'input value';
    expect(() => runAssertion(input, 'have.value', 'input value')).not.toThrow();
    expect(() => runAssertion(input, 'have.value', 'wrong value')).toThrow();
  });

  // State assertions
  it('should assert be.disabled and be.enabled', () => {
    input.disabled = true;
    expect(() => runAssertion(input, 'be.disabled')).not.toThrow();
    expect(() => runAssertion(input, 'be.enabled')).toThrow();
    input.disabled = false;
    expect(() => runAssertion(input, 'be.enabled')).not.toThrow();
    expect(() => runAssertion(input, 'be.disabled')).toThrow();
  });

  it('should assert be.checked', () => {
    input.type = 'checkbox';
    input.checked = true;
    expect(() => runAssertion(input, 'be.checked')).not.toThrow();
    input.checked = false;
    expect(() => runAssertion(input, 'be.checked')).toThrow();
  });

  it('should assert be.selected', () => {
    option.selected = true;
    expect(() => runAssertion(option, 'be.selected')).not.toThrow();
    option.selected = false;
    expect(() => runAssertion(option, 'be.selected')).toThrow();
  });

  it('should assert be.focused', () => {
    document.body.appendChild(input);
    input.focus();
    expect(() => runAssertion(input, 'be.focused')).not.toThrow();
    const anotherInput = document.createElement('input');
    document.body.appendChild(anotherInput);
    anotherInput.focus();
    expect(() => runAssertion(input, 'be.focused')).toThrow();
  });

  // Visibility assertions
  it('should assert be.visible and not.be.visible', () => {
    div.style.display = 'block';
    document.body.appendChild(div);
    expect(() => runAssertion(div, 'be.visible')).not.toThrow();
    div.style.display = 'none';
    expect(() => runAssertion(div, 'be.visible')).toThrow();
    expect(() => runAssertion(div, 'not.be.visible')).not.toThrow();
  });

  // Class assertions
  it('should assert have.class and not.have.class', () => {
    div.className = 'active';
    expect(() => runAssertion(div, 'have.class', 'active')).not.toThrow();
    expect(() => runAssertion(div, 'have.class', 'inactive')).toThrow();
    expect(() => runAssertion(div, 'not.have.class', 'inactive')).not.toThrow();
    expect(() => runAssertion(div, 'not.have.class', 'active')).toThrow();
  });

  // default case
  it('should throw for unknown assertion', () => {
    expect(() => runAssertion(div, 'unknown.assertion' as any)).toThrow('Unknown assertion: unknown.assertion');
  });
});
