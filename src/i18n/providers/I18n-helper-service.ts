import { Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

@Injectable()
export class I18nHelperService {
  constructor(private readonly i18n: I18nService) {}

  // Method to create a namespace-specific translator
  createNamespaceTranslator(namespace: string) {
    return {
      t: (key: string, options: Record<string, any> = {}): string => {
        const context = I18nContext.current();
        const fullKey = `${namespace}.${key}`;
        return this.i18n.t(fullKey, { ...options, lang: context?.lang });
      },
    };
  }

  // Keep the regular t method for cases where you want to use the full path
  t(key: string, options: Record<string, any> = {}): string {
    const context = I18nContext.current();
    return this.i18n.t(key, { ...options, lang: context?.lang });
  }
}
