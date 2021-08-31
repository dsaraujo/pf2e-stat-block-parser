import { SBPCGenParser } from "./pcgenparser.js";
import { SBStatblockParser } from "./statblockparser.js";
import { SBTextInputDialog } from "./text-input.js";
import { SBUtils } from "./utils.js";
import { SBVTTESParser } from "./vttesparser.js";
import { SBParsing, initParsers } from "./parsers.js";

class SBProgram {
    static ensureParseStatblockVisible() {
        if (!game.user.isGM && !Actor.canUserCreate(game.user)) {
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
            statblockParseButton.onclick = ev => SBProgram.openSFSBP();

            const createEntityButton = actorFooter.getElementsByClassName("create-entity")[0];
            actorFooter.insertBefore(statblockParseButton, createEntityButton);
        }
    }

    static async openSFSBP(folderId = null) {
        SBUtils.log("Opening Statblock Parser. Target folder is: " + folderId);

        let textResult = await SBTextInputDialog.textInputDialog({actor: this.actor, title: "Enter NPC stat block"});
        if (textResult.result) {
            // Create actor
            let dataFormat = textResult.dataFormat;
            let characterData = {
                actorData: {name: "Generated Actor", type: "npc", folder: folderId},
                items: [],
                spells: [],
                abilityDescriptions: [],
                characterDescriptions: []
            }
            let errors = [];
            let bHasMultiAttacks = false;

            let selectedParser = null;
            switch (dataFormat) {
                default:
                    selectedParser = new SBStatblockParser();
                    break;

                case "vttes":
                    selectedParser = new SBVTTESParser();
                    break;

                case "pcgen":
                    selectedParser = new SBPCGenParser();
                    break;
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

            SBUtils.log("> Setting up token defaults.");
            const tokenSize = SBUtils.actorSizeToTokenSize(characterData.actorData?.data?.traits?.size || "medium");
            characterData.actorData = mergeObject(characterData.actorData, {
                token: {
                    bar2: {
                        attribute: "attributes.rp"
                    },
                    displayBars: CONST.TOKEN_DISPLAY_MODES.OWNER,
                    displayName: CONST.TOKEN_DISPLAY_MODES.OWNER,
                    width: tokenSize,
                    height: tokenSize
                }
            });

            SBUtils.log("> Creating actor.");//: " + JSON.stringify(actorData));
            const actor = await Actor.create(characterData.actorData);
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
                let bInSecretMode = false;
                for (let description of characterData.characterDescriptions) {
                    if (description.bIsSecret && !bInSecretMode) {
                        bInSecretMode = true;
                        fullDescription += "<section class=\"secret\">\n";
                    } else if (!description.bIsSecret && bInSecretMode) {
                        bInSecretMode = false;
                        fullDescription += "</section>\n";
                    }

                    let bIsCategoryUpdated = false;
                    if (currentCategory != description.category) {
                        fullDescription += `<h2>${description.category}</h2>\n`;
                        currentCategory = description.category;
                        bIsCategoryUpdated = true;
                    }
                    if (!bIsCategoryUpdated) {
                        fullDescription += `<h3>${description.title}</h3>\n`;
                    }
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
                for (const abilityDescription of characterData.abilityDescriptions) {
                    let abilityItemFound = false;
                    for (let i = 0; i<characterData.items.length; i++) {
                        const typeString = SBParsing.parseSubtext(abilityDescription.name)[0];
                        if (SBUtils.stringStartsWith(typeString, characterData.items[i]["name"], false)
                            || SBUtils.stringStartsWith(characterData.items[i]["name"], typeString, false)) {
                                abilityItemFound = true;
                                characterData.items[i]["name"] = abilityDescription.name;
                                const originalDesc = characterData.items[i]["data.description.value"];
                                if (originalDesc) {
                                    characterData.items[i]["data.description.value"] = abilityDescription.description + "<br/><br/>Original description:<br/>" + originalDesc;
                                } else {
                                    characterData.items[i]["data.description.value"] = abilityDescription.description;
                                }
                        }
                    }

                    if (!abilityItemFound) {
                        const newItem = {
                            name: abilityDescription.name,
                            type: 'feat',
                            data: {
                                description: {
                                    value: abilityDescription.description
                                }
                            }
                        };
                        characterData.items.push(newItem);
                    }
                }
            }
            
            const embeddedItemsToCreate = [];
            if (characterData.items.length > 0) {
                SBUtils.log(`> Adding ${characterData.items.length} item(s).`);
                const addedItemIds = [];
                for (const itemData of characterData.items) {
                    if (!itemData["name"]) {
                        errors.push([`Parser produced an item of type ${itemData.type} without a name.`, ""]);
                        SBUtils.log(`Parser produced an item without a name.`);
                        console.log(itemData);
                        continue;
                    }

                    try {
                        //SBUtils.log(">> Creating item: " + JSON.stringify(itemData));
                        // Clean up data we don't care about.
                        delete itemData.id;
                        delete itemData._id;
                        delete itemData.effects;
                        delete itemData.permission;
                        delete itemData.sort;
                        delete itemData.folder;

                        if (!itemData["sourceId"] || !addedItemIds.includes(itemData["sourceId"])) {
                            embeddedItemsToCreate.push(itemData);
                            if (itemData["sourceId"]) {
                                addedItemIds.push(itemData["sourceId"]);
                            }

                            if (itemData["name"].includes("MultiATK")) {
                                bHasMultiAttacks = true;
                            }
                        }
                    } catch (err) {
                        errors.push(["Failed to create item: " + itemData["name"], err]);
                    }
                }
            }
            
            if (characterData.spells.length > 0) {
                SBUtils.log(`> Adding ${characterData.spells.length} spell(s).`);
                const addedSpellIds = [];
                for (const spellData of characterData.spells) {
                    try {
                        //SBUtils.log(">> Creating spell: " + JSON.stringify(spellData));
                        // Clean up data we don't care about.
                        delete spellData.id;
                        delete spellData._id;
                        delete spellData.effects;
                        delete spellData.flags;
                        delete spellData.permission;
                        delete spellData.sort;
                        delete spellData.folder;

                        if (!spellData["sourceId"] || !addedSpellIds.includes(spellData["sourceId"])) {
                            embeddedItemsToCreate.push(spellData);
                            if (spellData["sourceId"]) {
                                addedSpellIds.push(spellData["sourceId"]);
                            }
                        }
                    } catch (err) {
                        errors.push(["Failed to create spell: " + spellData["name"], err]);
                    }
                }
            }

            await actor.createEmbeddedDocuments("Item", embeddedItemsToCreate).then((createdItems) => {
                const bulkUpdates = [];
                const gearItemIds = [];
                for (const createdItem of createdItems) {
                    const isGear = createdItem?.data?.flags?.sbp?.isGear || false;

                    if (!isGear) {
                        if (["weapon", "equipment"].includes(createdItem.type)) {
                            bulkUpdates.push({_id: createdItem.id, "data.proficient": true, "data.equippable": true, "data.equipped": true});
                        }
                    } else {
                        gearItemIds.push(createdItem.id);
                        bulkUpdates.push({_id: createdItem.id, "flags.-=sbp": null, "data.equipped": false});
                    }
                }

                if (gearItemIds.length > 0) {
                    // Create loot container, then perform bulk updates

                    const lootContainer = {
                        "name": "Loot",
                        "type": "container",
                        "img": "icons/svg/item-bag.svg",
                        "data": {
                          "container": {
                            "contents": [
                            ],
                            "storage": [
                              {
                                "type": "bulk",
                                "subtype": "",
                                "amount": 1000,
                                "acceptsType": [
                                  "weapon",
                                  "shield",
                                  "equipment",
                                  "goods",
                                  "consumable",
                                  "container",
                                  "technological",
                                  "fusion",
                                  "upgrade",
                                  "augmentation",
                                  "magic",
                                  "hybrid",
                                  "ammunition",
                                  "weaponAccessory"
                                ],
                                "affectsEncumbrance": true,
                                "weightProperty": "bulk"
                              }
                            ],
                            "isOpen": true
                          }
                        }
                    };

                    for (const containedItem of gearItemIds) {
                        lootContainer.data.container.contents.push({
                            id: containedItem,
                            index: 0
                        });
                    }

                    actor.createEmbeddedDocuments("Item", [lootContainer]).then((createdItem) => {
                        if (bulkUpdates.length > 0) {
                            actor.updateEmbeddedDocuments("Item", bulkUpdates);
                        }
                    });
                } else {
                    if (bulkUpdates.length > 0) {
                        actor.updateEmbeddedDocuments("Item", bulkUpdates);
                    }
                }
            });
            
            SBUtils.log("Actor created, opening sheet.");
            const registeredSheet = Actors.registeredSheets.find(x => x.name === "ActorSheetSFRPGNPC");
            const sheet = new registeredSheet(actor);
            sheet.render(true);

            SBProgram.logErrors(errors);

            if (bHasMultiAttacks) {
                ui.notifications.info("This character has multiattacks, please check the Action Types and Ability Modifiers of these attacks and adjust their attack bonuses accordingly.<br/><br/>Click to dismiss.", {permanent: true});
            }

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

Hooks.on("getActorDirectoryFolderContext", async(html, folderOptions) => {
    folderOptions = folderOptions.push(
        {
          name: "Parse Statblock",
          icon: '<i class="fas fa-list"></i>',
          condition: game.user.isGM,
          callback: header => {
            const li = header.parent();
            SBProgram.openSFSBP(li.data("folderId"));
          }
        });
});

Hooks.on("ready", function() {
    initParsers();
    SBUtils.log("SFRPG Statblock Parser initialized.");
});
