export const getAppContext = (c: DomainContext) => {
  return {
    t: c.get('dictionary'),
    timezone: c.get('timezone'),
    timezoneOffset: c.get('timezoneOffset'),
    daf: c.get('daf'),
    inputs: c.get('inputs'),
    user: c.get('user'),
    queries: c.req.query(),
    params: c.req.param(),
    locale: c.get('locale'),
  };
};