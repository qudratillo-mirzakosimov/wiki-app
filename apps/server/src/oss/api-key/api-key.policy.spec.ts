import { isApiKeysEnabled } from './api-key.policy';

describe('isApiKeysEnabled', () => {
  it.each(['true', ' true '])('is on for %p', (value) => {
    expect(isApiKeysEnabled({ API_KEYS_ENABLED: value })).toBe(true);
  });

  it.each([undefined, '', 'false', '1', 'TRUE', 'yes'])('is off for %p', (value) => {
    expect(isApiKeysEnabled({ API_KEYS_ENABLED: value })).toBe(false);
  });
});
