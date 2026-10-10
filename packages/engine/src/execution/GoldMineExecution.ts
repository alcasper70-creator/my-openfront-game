import { zRef } from "@openfront/engine-lib/snapshot/SnapshotType";
import { z } from "zod";
import { Execution, Game, Unit } from "../game/Game";
import { execSnapshotType } from "../snapshot/ExecutionSnapshot";
import type { ExecRecord, SnapshotReader, SnapshotWriter } from "../snapshot/SnapshotContext";

/** Operations-only mine: gold generation is calculated by the game server. */
export class GoldMineExecution implements Execution {
  private active = true;
  private game: Game;
  private lastPaid = 0;
  constructor(private mine: Unit) {}
  init(game: Game): void { this.game = game; }
  tick(ticks: number): void {
    if (!this.mine.isActive() || !this.game.config().operationsMode()) { this.active = false; return; }
    if (ticks - this.lastPaid >= 100) {
      this.lastPaid = ticks;
      const perTick = this.mine.type() === "Oil Well" ? 25_000 : 35_000;
      this.mine.owner().addGold(BigInt(perTick * this.mine.level()));
    }
  }
  isActive(): boolean { return this.active; }
  activeDuringSpawnPhase(): boolean { return false; }
  snapshot(w: SnapshotWriter): ExecRecord { return GoldMineExecutionSnapshot.write({ active: this.active, initialized: this.game !== undefined, lastPaid: this.lastPaid, mine: w.unit(this.mine) }); }
  restoreSnapshot(s: GoldMineState, r: SnapshotReader): void { this.active = s.active; if (s.initialized) this.game = r.game; this.lastPaid = s.lastPaid; this.mine = r.unit(s.mine); }
}
const GoldMineStateSchema = z.object({ active: z.boolean(), initialized: z.boolean(), lastPaid: z.number(), mine: zRef() });
type GoldMineState = z.infer<typeof GoldMineStateSchema>;
export const GoldMineExecutionSnapshot = execSnapshotType({ name: "GoldMine", version: 1, schema: GoldMineStateSchema, cls: () => GoldMineExecution });
