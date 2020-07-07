import { ActorSheetSFRPGNPC } from "../../../systems/sfrpg/module/actor/sheet/npc.js";

import { SBStatblockParser } from "./statblockparser.js";
import { SBTextInputDialog } from "./text-input.js";
import { SBUtils } from "./utils.js";
import { SBVTTESParser } from "./vttesparser.js";

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
          // Create actor
          let dataFormat = textResult.dataFormat;
          let actorData = {name: "Generated Actor", type: "npc"};
          let items = [];
          let errors = [];

          let selectedParser = null;
          if (dataFormat === "vttes") {
              selectedParser = new SBVTTESParser();
          } else {
              selectedParser = new SBStatblockParser();
          }
          
          // Start parsing
          SBUtils.log("Starting parsing input for format: " + dataFormat);
          try {
              let parseResult = await selectedParser.parseInput(actorData, textResult.text.trim());
              if (!parseResult.success) {
                  SBUtils.log("Parsing failed.");
                  return;
              }
              
              actorData = parseResult.actorData;
              items = parseResult.items;
              errors = parseResult.errors;
          } catch (error) {
              SBUtils.log("Parsing had an error: " + error + ".");
              throw error;
              return;
          }

          if (errors.length > 0) {
              let errorMessage = "";
              SBUtils.log("> There were " + errors.length + " issue(s) parsing the provided statblock:");
              for(let error of errors) {
                  let errorText = "Failed to parse '" + error[0] + "' (" + error[1] + ")";

                  SBUtils.log(">> " + errorText);
                  if (errorMessage.length > 0) {
                      errorMessage += "<br/>";
                  }
                  errorMessage += errorText;
              }

              ui.notifications.error("There were " + errors.length + " issue(s) parsing the provided statblock:<br/>" + errorMessage + "<br/><br/>Click to dismiss.", {permanent: true});
          }

          SBUtils.log("> Creating actor.");//: " + JSON.stringify(actorData));
          let actor = await Actor.create(actorData);
          if (actor == null) {
              SBUtils.log("Failed to create new actor.");
              return;
          }
          
          SBUtils.log("> Adding items.");
          if (items.length > 0) {
              for (let itemData of items) {
                  //SBUtils.log(">> Creating item: " + JSON.stringify(itemData));
                  await actor.createOwnedItem(itemData);
              }
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
