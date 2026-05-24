import { AsyncPipe, DOCUMENT } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';

type ThemeMode = 'light' | 'dark';
type ThemeDirection = 'ltr' | 'rtl';
type ThemeColor =
  | 'Blue_Theme'
  | 'Aqua_Theme'
  | 'Purple_Theme'
  | 'Green_Theme'
  | 'Cyan_Theme'
  | 'Orange_Theme';
type LayoutType = 'vertical' | 'horizontal';
type ContainerMode = 'boxed' | 'full';
type SidebarType = 'full' | 'mini-sidebar';
type CardStyle = 'border' | 'shadow';

@Component({
  selector: 'app-shell',
  imports: [AsyncPipe, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent implements OnInit {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly settingsStorageKey = 'wolfpage.portal.settings';

  readonly colorThemes: { value: ThemeColor; label: string; skinClass: string }[] = [
    { value: 'Blue_Theme', label: 'Blue', skinClass: 'skin-1' },
    { value: 'Aqua_Theme', label: 'Aqua', skinClass: 'skin-2' },
    { value: 'Purple_Theme', label: 'Purple', skinClass: 'skin-3' },
    { value: 'Green_Theme', label: 'Green', skinClass: 'skin-4' },
    { value: 'Cyan_Theme', label: 'Cyan', skinClass: 'skin-5' },
    { value: 'Orange_Theme', label: 'Orange', skinClass: 'skin-6' },
  ];

  sidebarOpen = false;
  customizerOpen = false;
  themeMode: ThemeMode = 'light';
  direction: ThemeDirection = 'ltr';
  colorTheme: ThemeColor = 'Blue_Theme';
  layoutType: LayoutType = 'vertical';
  containerMode: ContainerMode = 'boxed';
  sidebarType: SidebarType = 'full';
  cardStyle: CardStyle = 'shadow';

  ngOnInit(): void {
    this.loadSettings();
    this.applySettings();
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleCustomizer(): void {
    this.customizerOpen = !this.customizerOpen;
  }

  closeCustomizer(): void {
    this.customizerOpen = false;
  }

  setThemeMode(themeMode: ThemeMode): void {
    this.themeMode = themeMode;
    this.applyAndPersistSettings();
  }

  setDirection(direction: ThemeDirection): void {
    this.direction = direction;
    this.applyAndPersistSettings();
  }

  setColorTheme(colorTheme: ThemeColor): void {
    this.colorTheme = colorTheme;
    this.applyAndPersistSettings();
  }

  setLayoutType(layoutType: LayoutType): void {
    this.layoutType = layoutType;
    this.applyAndPersistSettings();
  }

  setContainerMode(containerMode: ContainerMode): void {
    this.containerMode = containerMode;
    this.applyAndPersistSettings();
  }

  setSidebarType(sidebarType: SidebarType): void {
    this.sidebarType = sidebarType;
    this.applyAndPersistSettings();
  }

  setCardStyle(cardStyle: CardStyle): void {
    this.cardStyle = cardStyle;
    this.applyAndPersistSettings();
  }

  changeWorkspace(workspaceId: string): void {
    if (!workspaceId) {
      return;
    }

    this.auth.setActiveWorkspace(workspaceId);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  private applyAndPersistSettings(): void {
    this.applySettings();
    this.persistSettings();
  }

  private applySettings(): void {
    const root = this.document.documentElement;

    root.setAttribute('data-bs-theme', this.themeMode);
    root.setAttribute('dir', this.direction);
    root.setAttribute('data-color-theme', this.colorTheme);
    root.setAttribute('data-layout', this.layoutType);
    root.setAttribute('data-boxed-layout', this.containerMode);
    root.setAttribute('data-card', this.cardStyle);
    this.document.body.setAttribute('data-sidebartype', this.sidebarType);
  }

  private loadSettings(): void {
    const rawSettings = localStorage.getItem(this.settingsStorageKey);

    if (!rawSettings) {
      return;
    }

    try {
      const settings = JSON.parse(rawSettings) as Partial<{
        themeMode: ThemeMode;
        direction: ThemeDirection;
        colorTheme: ThemeColor;
        layoutType: LayoutType;
        containerMode: ContainerMode;
        sidebarType: SidebarType;
        cardStyle: CardStyle;
      }>;

      if (settings.themeMode === 'light' || settings.themeMode === 'dark') {
        this.themeMode = settings.themeMode;
      }

      if (settings.direction === 'ltr' || settings.direction === 'rtl') {
        this.direction = settings.direction;
      }

      const storedColorTheme = settings.colorTheme;

      if (storedColorTheme && this.colorThemes.some((theme) => theme.value === storedColorTheme)) {
        this.colorTheme = storedColorTheme;
      }

      if (settings.layoutType === 'vertical' || settings.layoutType === 'horizontal') {
        this.layoutType = settings.layoutType;
      }

      if (settings.containerMode === 'boxed' || settings.containerMode === 'full') {
        this.containerMode = settings.containerMode;
      }

      if (settings.sidebarType === 'full' || settings.sidebarType === 'mini-sidebar') {
        this.sidebarType = settings.sidebarType;
      }

      if (settings.cardStyle === 'border' || settings.cardStyle === 'shadow') {
        this.cardStyle = settings.cardStyle;
      }
    } catch {
      localStorage.removeItem(this.settingsStorageKey);
    }
  }

  private persistSettings(): void {
    localStorage.setItem(
      this.settingsStorageKey,
      JSON.stringify({
        themeMode: this.themeMode,
        direction: this.direction,
        colorTheme: this.colorTheme,
        layoutType: this.layoutType,
        containerMode: this.containerMode,
        sidebarType: this.sidebarType,
        cardStyle: this.cardStyle,
      }),
    );
  }
}
