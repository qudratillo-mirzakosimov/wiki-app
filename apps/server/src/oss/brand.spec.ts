import { injectWindowConfig, getLoginHeadline } from './brand';

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

  it('drops trailing periods and whitespace together', () => {
    process.env.LOGIN_HEADLINE = 'GUIDE. .';
    expect(getLoginHeadline()).toBe('GUIDE');
  });
});

describe('injectWindowConfig', () => {
  const template = '<head><!--window-config--></head><body>REST</body>';

  function inject(config: Record<string, unknown>): string {
    return injectWindowConfig(template, '<!--window-config-->', config);
  }

  it('keeps $-patterns in values literal', () => {
    const html = inject({ LOGIN_HEADLINE: "WE SAVE $' $` $& $$ FOR YOU" });
    expect(html).toContain("WE SAVE $' $` $& $$ FOR YOU");
    expect(html.match(/<body>/g)).toHaveLength(1);
  });

  it('cannot be closed early by </script> in a value', () => {
    const html = inject({ APP_NAME: '</script><script>alert(1)</script>' });
    expect(html.match(/<\/script>/g)).toHaveLength(1);
    const json = html.match(/window\.CONFIG=(.*);<\/script>/)![1];
    expect(JSON.parse(json).APP_NAME).toBe(
      '</script><script>alert(1)</script>',
    );
  });
});
