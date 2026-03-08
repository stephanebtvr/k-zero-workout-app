import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({ providedIn: 'root' })
export class ThemeService {
    private themeKey = 'ironpath_theme';

    // Signal de l'état du thème
    readonly theme = signal<Theme>('system');

    constructor() {
        this.initTheme();

        // Effet réactif : chaque fois que \`theme\` change, on applique
        effect(() => {
            this.applyTheme(this.theme());
        });
    }

    setTheme(newTheme: Theme) {
        this.theme.set(newTheme);
        localStorage.setItem(this.themeKey, newTheme);
    }

    private initTheme() {
        const saved = localStorage.getItem(this.themeKey) as Theme;
        if (saved) {
            this.theme.set(saved);
        } else {
            this.theme.set('system');
        }

        // Écouter les changements système si on est en "system"
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (this.theme() === 'system') {
                this.applyTheme('system');
            }
        });
    }

    private applyTheme(theme: Theme) {
        const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
            document.body.classList.add('dark-theme');
            document.body.classList.remove('light-theme');
        } else {
            document.body.classList.add('light-theme');
            document.body.classList.remove('dark-theme');
        }
    }
}
