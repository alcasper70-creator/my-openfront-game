import { UserMeResponse } from "@openfront/shared/ApiSchemas";
import { html, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import { firebaseIdToken, firebaseUpdateDisplayName } from "./Firebase";
import "./components/UsernamePanel";
import { ProfileMenuModal } from "./ProfileMenuModal";
import { translateText } from "./Utils";

/**
 * Standalone account-username management, opened from the nav profile menu
 * (`#modal=change-username`). Renders the same <username-panel> the account
 * modal used to, so the cooldown/claim rules live in one place.
 */
@customElement("change-username-modal")
export class ChangeUsernameModal extends ProfileMenuModal {
  protected routerName = "change-username";
  protected titleKey = "change_username_modal.title";
  @state() private frontlineName = localStorage.getItem("firebase_commander_name") ?? "";
  @state() private frontlineDraft = this.frontlineName;
  @state() private frontlineSaving = false;
  @state() private frontlineError = "";

  protected override renderBody(): TemplateResult {
    if (this.frontlineName) {
      return html`<div class="p-6"><p class="mb-4 text-sm text-white/60">This updates your Frontline Google commander name and leaderboard name.</p>
        <input class="w-full rounded-lg border border-cyan-300/30 bg-slate-950 px-4 py-3 text-white" maxlength="24" .value=${this.frontlineDraft} @input=${(e: Event) => { this.frontlineDraft = (e.target as HTMLInputElement).value; }} />
        ${this.frontlineError ? html`<p class="mt-3 text-sm text-red-300">${this.frontlineError}</p>` : ""}
        <button ?disabled=${this.frontlineSaving} @click=${this.saveFrontlineName} class="mt-5 rounded-lg bg-cyan-300 px-4 py-2 text-xs font-black uppercase text-slate-950 disabled:opacity-50">${this.frontlineSaving ? "Saving…" : "Save commander name"}</button>
      </div>`;
    }
    return super.renderBody();
  }

  private saveFrontlineName = async () => {
    const name = this.frontlineDraft.trim().replace(/\s+/g, " ");
    if (name.length < 3 || name.length > 24) { this.frontlineError = "Use a name between 3 and 24 characters."; return; }
    this.frontlineSaving = true;
    this.frontlineError = "";
    try {
      if (!(await firebaseIdToken())) throw new Error("Google sign-in required");
      await firebaseUpdateDisplayName(name);
      localStorage.setItem("firebase_commander_name", name);
      this.frontlineName = name;
      this.close();
    } catch (error) {
      this.frontlineError = error instanceof Error ? error.message : "Could not save commander name.";
    } finally { this.frontlineSaving = false; }
  };

  protected renderSignedIn(userMe: UserMeResponse): TemplateResult {
    const player = userMe.player;
    // Older backends don't return the username fields; the panel renders
    // nothing for them, so say why instead of showing an empty modal.
    if (player.usernameStatus === undefined) {
      return html`
        <div class="p-6">
          <div
            class="bg-white/5 rounded-xl border border-white/10 p-8 text-center"
          >
            <p class="text-white/60 text-sm">
              ${translateText("change_username_modal.unavailable")}
            </p>
          </div>
        </div>
      `;
    }
    return html`
      <div class="custom-scrollbar mr-1">
        <div class="p-6">
          <username-panel .player=${player}></username-panel>
        </div>
      </div>
    `;
  }
}
