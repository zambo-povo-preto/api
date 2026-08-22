import { getDictionary } from "@/dictionaries";

export const getAppContext = async (c: DomainContext) => {
  const t = getDictionary();

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  let inputs: any = {};

  // Só tenta ler o body se a requisição NÃO for do tipo GET ou HEAD
  if (c.req.method !== "GET" && c.req.method !== "HEAD") {
    try {
      inputs = await c.req.json();
    } catch (error) {
      // Se vier um POST/PUT com body vazio ou malformado,
      // ele apenas ignora e mantém o inputs como {} em vez de derrubar a API
    }
  }

  return {
    t,
    timezone: c.get("timezone"),
    timezoneOffset: c.get("timezoneOffset"),
    inputs,
    user: c.get("user"),
    queries: c.req.query(),
    params: c.req.param(),
    locale: c.get("locale"),
  };
};
