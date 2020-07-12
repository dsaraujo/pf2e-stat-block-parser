import { ActorSheetSFRPGNPC } from "../../../systems/sfrpg/module/actor/sheet/npc.js";

import { SBStatblockParser } from "./statblockparser.js";
import { SBTextInputDialog } from "./text-input.js";
import { SBUtils } from "./utils.js";
import { SBVTTESParser } from "./vttesparser.js";

class SBProgram {
    static ensureParseStatblockVisible() {
        if (!game.user.isGM && !Actor.can(game.user, "create")) {
            return;
        }

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
            let characterData = {
                actorData: {name: "Generated Actor", type: "npc"},
                items: [],
                spells: [],
                abilityDescriptions: [],
                characterDescriptions: []
            }
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
                let parseResult = await selectedParser.parseInput(characterData.actorData, textResult.text.trim());
                if (!parseResult.success) {
                    SBUtils.log("Parsing failed.");
                    return;
                }
              
                characterData = parseResult.characterData;
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
            let actor = await Actor.create(characterData.actorData);
            if (actor == null) {
                SBUtils.log("Failed to create new actor.");
                SBProgram.logErrors(errors);
                return;
            }

            if (characterData.characterDescriptions.length > 0) {
                SBUtils.log(`> Processing ${characterData.characterDescriptions.length} character description(s).`);

                characterData.characterDescriptions.sort(function(a, b) {
                    if (a.category != b.category) {
                        return a.category.localeCompare(b.category);
                    }
                    if (a.title != b.title) {
                        return a.title.localeCompare(b.title);
                    }
                    return 0;
                });

                let fullDescription = "";
                let currentCategory = "";
                for (let description of characterData.characterDescriptions) {
                    if (currentCategory != description.category) {
                        fullDescription += `<h2>${description.category}</h2>\n`;
                        currentCategory = description.category;
                    }
                    fullDescription += `<h3>${description.title}</h3>\n`;
                    fullDescription += `<p>${description.body}</p>\n`;
                    fullDescription += `<p>&nbsp;</p>\n`;
                }
                if (fullDescription) {
                    let actorDescription = {};
                    actorDescription["data.details.biography.value"] = fullDescription;
                    await actor.update(actorDescription);
                }
            }

            if (characterData.abilityDescriptions.length > 0) {
                SBUtils.log(`> Processing ${characterData.abilityDescriptions.length} ability description(s).`);
                for (let abilityDescription of characterData.abilityDescriptions) {
                    for (let i = 0; i<characterData.items.length; i++) {
                        if (SBUtils.stringStartsWith(abilityDescription.name, characterData.items[i]["name"], false)) {
                            characterData.items[i]["name"] = abilityDescription.name;
                            if (characterData.items[i]["data.description.value"]) {
                                characterData.items[i]["data.description.value"] = abilityDescription.description + "<br/><br/>Original description:<br/>" + characterData.items[i]["data.description"];
                            } else {
                                characterData.items[i]["data.description.value"] = abilityDescription.description;
                            }
                        }
                    }
                }
            }
            
            if (characterData.items.length > 0) {
                SBUtils.log(`> Adding ${characterData.items.length} item(s).`);
                let addedItemIds = [];
                for (let itemData of characterData.items) {
                    try {
                        //SBUtils.log(">> Creating item: " + JSON.stringify(itemData));
                        if (!itemData["sourceId"] || !addedItemIds.includes(itemData["sourceId"])) {
                            await actor.createOwnedItem(itemData);
                            if (itemData["sourceId"]) {
                                addedItemIds.push(itemData["sourceId"]);
                            }
                        }
                    } catch (err) {
                        errors.push(["Failed to create item: " + itemData["name"], err]);
                    }
                }
            }
            
            if (characterData.spells.length > 0) {
                SBUtils.log(`> Adding ${characterData.spells.length} spell(s).`);
                let addedSpellIds = [];
                for (let spellData of characterData.spells) {
                    try {
                        //SBUtils.log(">> Creating spell: " + JSON.stringify(itemData));
                        if (!spellData["sourceId"] || !addedSpellIds.includes(spellData["sourceId"])) {
                            await actor.createOwnedItem(spellData);
                            if (spellData["sourceId"]) {
                                addedSpellIds.push(spellData["sourceId"]);
                            }
                        }
                    } catch (err) {
                        errors.push(["Failed to create spell: " + spellData["name"], err]);
                    }
                }
            }
            
            SBUtils.log("Actor created, opening sheet.");
            let sheet = new ActorSheetSFRPGNPC(actor);
            sheet.render(true);

            SBProgram.logErrors(errors);

            if (errors.length > 0) {
                throw errors[0][1];
            }
        }
    }

    static logErrors(errors) {
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
    }
}

/** Ensure the "Parse Statblock" button is visible. */
Hooks.on("renderSidebarTab", async (app, html) => {
    if (app.options.id == "actors") {
        SBProgram.ensureParseStatblockVisible();
    }
});
SBUtils.log("SFRPG Statblock Parser initialized.");
