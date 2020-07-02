import { TextInputDialog } from "./text-input.js";
import { SFStatblockParser } from "./statblockparser.js";
import { ActorSheetSFRPGNPC } from "../../../systems/sfrpg/module/actor/sheet/npc.js";

class SFSBPProgram {
    static ensureParseStatblockVisible() {
        let statblockParseButton = document.getElementById("SFSBP-button");
        if (statblockParseButton != null) {
            return;
        }

        const actorsPanel = document.getElementById("actors");
        const actorFooter = actorsPanel.getElementsByClassName("directory-footer")[0];
        if (actorFooter) {
            console.log("SFSBP | Creating Statblock Parse button.");

            statblockParseButton = document.createElement("button");
            statblockParseButton.innerHTML = `<i id="SFSBP-button" class="fas fa-list"></i>Parse Statblock`;
            statblockParseButton.onclick = SFSBPProgram.openSFSBP;

            const createEntityButton = actorFooter.getElementsByClassName("create-entity")[0];
            actorFooter.insertBefore(statblockParseButton, createEntityButton);
        }
    }

    static async openSFSBP() {
        //console.log("SFSBP | Opening Statblock Parser.");

        let textResult = await TextInputDialog.textInputDialog({actor: this.actor, title: "Enter NPC stat block"});
        if (textResult.result) {
          if (this.statblockParser === undefined) {
              this.statblockParser = new SFStatblockParser();
          }
          
          // Create actor
          console.log("SFSBP | Preparing new actor.");
          let actorData = {name: "Generated Actor", type: "npc"};
          let items = [];
          
          // Start parsing
          //console.log("SFSBP | Start parsing: " + textResult.text);
          try {
              let parseResult = await this.statblockParser.parseStatblock(actorData, textResult.text);
              if (!parseResult.success) {
                  console.log("SFSBP | Parsing failed.");
                  return;
              }
              
              actorData = parseResult.actorData;
              items = parseResult.items;
          } catch (error) {
              console.log("SFSBP | Parsing had an error: " + error + ".");
              return;
          }

          let actor = await Actor.create(actorData);
          if (actor == null) {
              console.log("SFSBP | Failed to create new actor.");
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
console.log("SFSBP | SFRPG Statblock Parser initialized.");
