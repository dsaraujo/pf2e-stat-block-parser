import { TextInputDialog } from "./text-input.js";
import { SFStatblockParser } from "./statblockparser.js";
import { ActorSheetSFRPGNPC } from "../../../systems/sfrpg/module/actor/sheet/npc.js";
import { SFSBPUtils } from "./utils.js";

class SFSBPProgram {
    static ensureParseStatblockVisible() {
        let statblockParseButton = document.getElementById("SFSBP-button");
        if (statblockParseButton != null) {
            return;
        }

        const actorsPanel = document.getElementById("actors");
        const actorFooter = actorsPanel.getElementsByClassName("directory-footer")[0];
        if (actorFooter) {
            SFSBPUtils.log("Creating Statblock Parse button.");

            statblockParseButton = document.createElement("button");
            statblockParseButton.innerHTML = `<i id="SFSBP-button" class="fas fa-list"></i>Parse Statblock`;
            statblockParseButton.onclick = SFSBPProgram.openSFSBP;

            const createEntityButton = actorFooter.getElementsByClassName("create-entity")[0];
            actorFooter.insertBefore(statblockParseButton, createEntityButton);
        }
    }

    static async openSFSBP() {
        SFSBPUtils.log("Opening Statblock Parser.");

        let textResult = await TextInputDialog.textInputDialog({actor: this.actor, title: "Enter NPC stat block"});
        if (textResult.result) {
          if (this.statblockParser === undefined) {
              this.statblockParser = new SFStatblockParser();
          }
          
          // Create actor
          SFSBPUtils.log("Preparing new actor.");
          let actorData = {name: "Generated Actor", type: "npc"};
          let items = [];
          
          // Start parsing
          SFSBPUtils.log("Start parsing...");
          try {
              let parseResult = await this.statblockParser.parseStatblock(actorData, textResult.text);
              if (!parseResult.success) {
                  SFSBPUtils.log("Parsing failed.");
                  return;
              }
              
              actorData = parseResult.actorData;
              items = parseResult.items;
          } catch (error) {
              SFSBPUtils.log("Parsing had an error: " + error + ".");
              throw error;
              return;
          }

          let actor = await Actor.create(actorData);
          if (actor == null) {
              SFSBPUtils.log("Failed to create new actor.");
              return;
          }
          
          if (items.length > 0)
          {
              items.forEach(itemData => {
                  actor.createOwnedItem(itemData);
              });
          }
          
          let sheet = new ActorSheetSFRPGNPC(actor);
          sheet.render(true);
        }
    }
}

/** Ensure the "Parse Statblock" button is visible. */
Hooks.on("renderSidebarTab", async (app, html) => {
    if (app.options.id == "actors") {
        SFSBPProgram.ensureParseStatblockVisible();
    }
});
SFSBPUtils.log("SFRPG Statblock Parser initialized.");
