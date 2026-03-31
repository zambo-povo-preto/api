import ptBR from './pt-BR.json';

export type Lang = keyof typeof dictionaries;
export type DictionaryKey = keyof typeof ptBR;

export const dictionaries = {
  'pt-BR': ptBR,
};

export type TranslatorFn = (
  key: DictionaryKey,
  vars?: {
    [key: string]: string | number;
  },
) => string;

export const getDictionary = (lang = 'pt-BR') => {
  let validLang: Lang = 'pt-BR';
  if (Object.keys(dictionaries).includes(lang)) {
    validLang = lang as Lang;
  }

  const dictionary = dictionaries[validLang];

  const t = (
    key: DictionaryKey,
    vars?: {
      [key: string]: string | number;
    },
  ) => {
    let translationString = dictionary[key];

    if (vars) {
      for (const key of Object.keys(vars)) {
        translationString = translationString?.replace(
          `{{${key}}}`,
          vars[key].toString(),
        );
      }
    }

    return translationString;
  };

  return t;
};