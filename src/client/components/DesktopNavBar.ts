import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import "./NavAccountMenu";
import "./NavUtilityIcons";

@customElement("desktop-nav-bar")
export class DesktopNavBar extends LitElement {
  createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("showPage", this._onShowPage);

    const current = window.currentPageId;
    if (current) {
      // Wait for render
      this.updateComplete.then(() => {
        this._updateActiveState(current);
      });
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener("showPage", this._onShowPage);
  }

  private _onShowPage = (e: Event) => {
    const pageId = (e as CustomEvent).detail;
    this._updateActiveState(pageId);
  };

  private _updateActiveState(pageId: string) {
    this.querySelectorAll(".nav-menu-item").forEach((el) => {
      if ((el as HTMLElement).dataset.page === pageId) {
        el.classList.add("active");
      } else {
        el.classList.remove("active");
      }
    });
  }

  render() {
    window.currentPageId ??= "page-play";
    const currentPage = window.currentPageId;

    return html`
      <nav
        class="hidden lg:flex w-full border-b border-cyan-300/15 bg-gradient-to-r from-slate-950 via-cyan-950/50 to-slate-950 backdrop-blur-md items-center justify-center gap-3 py-3 px-6 shrink-0 z-50 relative"
      >
        <div class="flex flex-col items-center justify-center">
          <div class="h-8 flex items-center gap-2">
            <span class="grid h-7 w-7 place-items-center rounded-lg border border-cyan-300/50 bg-cyan-300/10 text-sm">⚡</span>
            <span class="text-lg font-black tracking-[0.14em] text-cyan-200 drop-shadow-[0_0_10px_rgba(34,211,238,0.55)]">FRONTLINE FRENZY</span>
          </div>
          <div
            id="game-version"
            class="l-header__highlightText text-center"
          ></div>
        </div>
        <button
          class="nav-menu-item ${currentPage === "page-play"
            ? "active"
            : ""} rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-cyan-200 font-medium tracking-wider uppercase cursor-pointer transition-colors [&.active]:bg-cyan-300/10 [&.active]:text-cyan-200 "
          data-page="page-play"
          data-i18n="main.play"
        ></button>
        <button
          class="nav-menu-item ${currentPage === "page-item-store" ? "active" : ""} rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-cyan-200 font-medium tracking-wider uppercase cursor-pointer transition-colors [&.active]:bg-cyan-300/10 [&.active]:text-cyan-200"
          data-page="page-item-store"
        >Armory <span class="ml-1 rounded bg-fuchsia-400/20 px-1.5 py-0.5 text-[9px] text-fuchsia-200">NEW</span></button>
        <button
          class="nav-menu-item ${currentPage === "page-inventory" ? "active" : ""} rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-cyan-200 font-medium tracking-wider uppercase cursor-pointer transition-colors [&.active]:bg-cyan-300/10 [&.active]:text-cyan-200"
          data-page="page-inventory"
        >Loadout</button>
        <button
          class="nav-menu-item rounded-lg px-3 py-2 text-white/70 hover:bg-white/5 hover:text-cyan-200 font-medium tracking-wider uppercase cursor-pointer transition-colors [&.active]:bg-cyan-300/10 [&.active]:text-cyan-200"
          data-page="page-leaderboard"
          data-i18n="main.leaderboard"
        ></button>
        <div class="flex items-center gap-1 pl-5 ml-1 border-l border-white/10">
          <nav-utility-icons size="desktop"></nav-utility-icons>
          <nav-account-menu variant="desktop"></nav-account-menu>
        </div>
      </nav>
    `;
  }
}
