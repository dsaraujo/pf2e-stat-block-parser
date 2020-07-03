import { ActorSheetSFRPGNPC } from "../../../systems/sfrpg/module/actor/sheet/npc.js";

import { SBStatblockParser } from "./statblockparser.js";
import { SBTextInputDialog } from "./text-input.js";
import { SBUtils } from "./utils.js";

class SBProgram {
    static ensureParseStatblockVisible() {
        let statblockParseButton = document.getElementById("SFSBP-button");
        if (statblockParseButton != null) {
            return;
        }

        const actorsPanel = document.getElementById("actors");
        const actorFooter = actorsPanel.getElementsByClassName("directory-footer")[0];
        if (actorFooter) {
            SBUtils.log("Creating Statblock Parse button.");

            statblockParseButton = document.createElement("button");
            statblockParseButton.innerHTML = `<i id="SFSBP-button" class="fas fa-list"></i>Parse Statblock`;
            statblockParseButton.onclick = SBProgram.openSFSBP;

            const createEntityButton = actorFooter.getElementsByClassName("create-entity")[0];
            actorFooter.insertBefore(statblockParseButton, createEntityButton);
        }
    }

    static async openSFSBP() {
        SBUtils.log("Opening Statblock Parser.");

        let textResult = await SBTextInputDialog.textInputDialog({actor: this.actor, title: "Enter NPC stat block"});
        if (textResult.result) {
          if (this.statblockParser === undefined) {
              this.statblockParser = new SBStatblockParser();
          }
          
          // Create actor
          let actorData = {name: "Generated Actor", type: "npc"};
          let items = [];
          
          // Start parsing
          SBUtils.log("Starting parsing input.");
          try {
              let parseResult = await this.statblockParser.parseStatblock(actorData, textResult.text);
              if (!parseResult.success) {
                  SBUtils.log("Parsing failed.");
                  return;
              }
              
              actorData = parseResult.actorData;
              items = parseResult.items;
          } catch (error) {
              SBUtils.log("Parsing had an error: " + error + ".");
              throw error;
              return;
          }

          SBUtils.log("> Creating actor.");
          let actor = await Actor.create(actorData);
          if (actor == null) {
              SBUtils.log("Failed to create new actor.");
              return;
          }
          
          SBUtils.log("> Adding items.");
          if (items.length > 0)
          {
              items.forEach(itemData => {
                  actor.createOwnedItem(itemData);
              });
          }
          
          SBUtils.log("Actor created, opening sheet.");
          let sheet = new ActorSheetSFRPGNPC(actor);
          sheet.render(true);
        }
    }
}

/** Ensure the "Parse Statblock" button is visible. */
Hooks.on("renderSidebarTab", async (app, html) => {
    if (app.options.id == "actors") {
        SBProgram.ensureParseStatblockVisible();
    }
});
SBUtils.log("SFRPG Statblock Parser initialized.");
