import {addLocaleData, Locale} from 'react-intl';
import {replaceMap, unique} from '../lib/Helpers';
import {action, observable, toJS} from 'mobx';

export type LocaleName = string;
export type Messages = {[key: string]: string};

export class I18nState {
  @observable locale: LocaleName = 'en';
  @observable messages = new Map<LocaleName, Messages>();
  @observable data = new Map<LocaleName, Locale>();

  @action
  update (reference: Locale, data: {[key: string]: Locale}, messages: {[key: string]: Messages}) {
    replaceMap(this.data, data);
    replaceMap(this.messages, messages);
    this.messages.set(reference.locale, reference as any);

    if (!this.locale) {
      this.locale = reference.locale;
    }

    this.data.forEach((localeData) =>
      addLocaleData(toJS(localeData))
    );
  }

  get localeMessages () {
    return this.messages.get(this.locale);
  }

  get availableLocales (): string[] {
    return unique([
      ...Array.from(this.messages.keys()),
      ...Array.from(this.data.keys())
    ]);
  }
}
