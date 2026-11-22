import { getLoginHeadline } from './brand';

describe('getLoginHeadline', () => {
  const original = process.env.LOGIN_HEADLINE;

  afterEach(() => {
    if (original === undefined) delete process.env.LOGIN_HEADLINE;
    else process.env.LOGIN_HEADLINE = original;
  });

  it('returns the default when unset', () => {
    delete process.env.LOGIN_HEADLINE;
    expect(getLoginHeadline()).toBe('EVERYTHING WE KNOW');
  });

  it('returns the default when blank', () => {
    process.env.LOGIN_HEADLINE = '   ';
    expect(getLoginHeadline()).toBe('EVERYTHING WE KNOW');
  });

  it('trims and keeps the value', () => {
    process.env.LOGIN_HEADLINE = '  OUR CLIENT GUIDE  ';
    expect(getLoginHeadline()).toBe('OUR CLIENT GUIDE');
  });

  it('drops trailing periods, the layout adds one', () => {
    process.env.LOGIN_HEADLINE = 'OUR CLIENT GUIDE..';
    expect(getLoginHeadline()).toBe('OUR CLIENT GUIDE');
  });
});
