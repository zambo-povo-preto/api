import { getDictionary } from "@/dictionaries";

export const getAppContext = async (c: DomainContext) => {
  const t = getDictionary()

  const inputs = await c.req.json();

  return {
    t,
    timezone: c.get('timezone'),
    timezoneOffset: c.get('timezoneOffset'),
    inputs,
    user: c.get('user'),
    queries: c.req.query(),
    params: c.req.param(),
    locale: c.get('locale'),
  };
};