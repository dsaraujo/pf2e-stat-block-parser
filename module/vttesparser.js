import { SBUtils, SBConfig } from "./utils.js";
import { SBUniversalMonsterRules } from "./umg.js";

export class SBVTTESParser {
    skillNames = ["acrobatics", "athletics", "bluff", "computers", "culture",
        "diplomacy", "disguise", "engineering", "intimidate", "life_science",
        "medicine", "mysticism", "perception", "physical_science", "piloting",
        "profession", "sense_motive", "sleight_of_hand", "stealth", "survival"
    ];

    parseSkill(dict, skill, value) {
        if (value.current != 0) {
            dict["data.skills." + skill + ".enabled"] = true;
            dict["data.skills." + skill + ".mod"] = value.current;
        }
    }

    addSectionedData(dict, sectionName, content, isSecret) {
        if (!sectionName || !content) return;

        let sectionData = "";
        if (isSecret) {
            sectionData += "<section class=\"secret\">";
        }
        
        sectionData += "<strong>" + sectionName + "</strong><br />";
        sectionData += content.replace("\n", "<br />").replace("\\n", "<br />") + "<br />";
        
        if (isSecret) {
            sectionData += "</section>";
        }
        
        let oldDesc = dict["data.details.biography.value"];
        if (oldDesc) {
            dict["data.details.biography.value"] = oldDesc + "<br />" + sectionData;
        } else {
            dict["data.details.biography.value"] = sectionData;
        }
    }

    attributeMapping = {
        "character_level": (dict,val) => dict["data.details.cr"] = val.current,
        "strength_mod": (dict,val) => dict["data.abilities.str.mod"] = val.current,
        "dexterity_mod": (dict,val) => dict["data.abilities.dex.mod"] = val.current,
        "constitution_mod": (dict,val) => dict["data.abilities.con.mod"] = val.current,
        "intelligence_mod": (dict,val) => dict["data.abilities.int.mod"] = val.current,
        "wisdom_mod": (dict,val) => dict["data.abilities.wis.mod"] = val.current,
        "charisma_mod": (dict,val) => dict["data.abilities.cha.mod"] = val.current,
        "race": (dict,val) => dict['data.details.raceAndGrafts'] = SBUtils.camelize(val.current),
        "alignment": (dict,val) => dict["data.details.alignment"] = val.current,
        "type_subtype": (dict,val) => dict['data.details.type'] = SBUtils.camelize(val.current),
        "initiative_base": (dict,val) => dict["data.attributes.init.total"] = val.current,
        "senses": (dict,val) => dict["data.traits.senses"] = val.current,
        "perception_base": (dict,val) => { dict["data.skills.per.mod"] = val.current; dict["data.skills.per.enabled"] = true; },
        "hp": (dict,val) => { dict["data.attributes.hp.value"] = val.current; dict["data.attributes.hp.max"] = val.max; },
        "sp": (dict,val) => { dict["data.attributes.sp.value"] = val.current; dict["data.attributes.sp.max"] = val.max; },
        "rp": (dict,val) => { dict["data.attributes.rp.value"] = val.current; dict["data.attributes.rp.max"] = val.max; },
        "eac_base": (dict,val) => { dict["data.attributes.eac.value"] = val.current; },
        "kac_base": (dict,val) => { dict["data.attributes.kac.value"] = val.current; },
        "cmd_base": (dict,val) => { dict["data.attributes.cmd.value"] = val.current; },
        "fort_base": (dict,val) => { dict["data.attributes.fort.bonus"] = val.current; },
        "ref_base": (dict,val) => { dict["data.attributes.reflex.bonus"] = val.current; },
        "will_base": (dict,val) => { dict["data.attributes.will.bonus"] = val.current; },
        "resistances": (dict,val) => { SBUtils.log("> TODO: Implement resistances") }, // "Electricity 5, fire 5"
        "speed": (dict,val) => { dict["data.attributes.speed.value"] = val.current; },
        "space": (dict,val) => { dict["data.attributes.space"] = val.current; },
        "reach": (dict,val) => { dict["data.attributes.reach"] = val.current; },
        "acrobatics": (dict, val) => { this.parseSkill(dict, "acr", val); },
        "athletics": (dict, val) => { this.parseSkill(dict, "ath", val); },
        "bluff": (dict, val) => { this.parseSkill(dict, "blu", val); },
        "computers": (dict, val) => { this.parseSkill(dict, "com", val); },
        "culture": (dict, val) => { this.parseSkill(dict, "cul", val); },
        "diplomacy": (dict, val) => { this.parseSkill(dict, "dip", val); },
        "disguise": (dict, val) => { this.parseSkill(dict, "dis", val); },
        "engineering": (dict, val) => { this.parseSkill(dict, "eng", val); },
        "intimidate": (dict, val) => { this.parseSkill(dict, "int", val); },
        "life_science": (dict, val) => { this.parseSkill(dict, "lsc", val); },
        "medicine": (dict, val) => { this.parseSkill(dict, "med", val); },
        "mysticism": (dict, val) => { this.parseSkill(dict, "mys", val); },
        "perception": (dict, val) => { this.parseSkill(dict, "per", val); },
        "physical_science": (dict, val) => { this.parseSkill(dict, "phs", val); },
        "piloting": (dict, val) => { this.parseSkill(dict, "pil", val); },
        "profession": (dict, val) => { this.parseSkill(dict, "pro", val); },
        "sense_motive": (dict, val) => { this.parseSkill(dict, "sen", val); },
        "sleight_of_hand": (dict, val) => { this.parseSkill(dict, "sle", val); },
        "stealth": (dict, val) => { this.parseSkill(dict, "ste", val); },
        "survival": (dict, val) => { this.parseSkill(dict, "sur", val); },

        "size": (dict, val) => {
            let sizes = Object.keys(CONFIG["SFRPG"].actorSizes);
            let indexOfMedium = sizes.indexOf("medium");
            let desiredIndex = indexOfMedium + Number(val.current);
            let size = sizes[desiredIndex];
            dict["data.traits.size"] = size;
        },

        "bio": (dict, val) => {
            let biography = "<strong>Biography</strong><br />";
            biography += unescape(val);

            let oldDesc = dict["data.details.biography.value"];
            dict["data.details.biography.value"] = biography;
            if (oldDesc) {
                dict["data.details.biography.value"] += "<br />" + oldDesc;
            }
        },

        "gmnotes": (dict, val) => {
            let gmNotes = "";
            gmNotes = "<section class=\"secret\"><strong>GM Notes</strong><br/>";
            gmNotes += unescape(val);
            gmNotes += "</section>";

            let oldDesc = dict["data.details.biography.value"];
            if (oldDesc) {
                dict["data.details.biography.value"] += "<br />";
                dict["data.details.biography.value"] += gmNotes;
            } else {
                dict["data.details.biography.value"] = gmNotes;
            }
        },

        "languages": (dict, val) => {
            let officialLanguages = [];
            let customLanguages = "";

            let languages = val.current.split(/[,;]/g);
            for (let language of languages) {
                try {
                    let keyedLanguage = language.trim().toLowerCase();
                    if (keyedLanguage == "lashunta") {
                        keyedLanguage = "castrovelian";
                    }

                    if (keyedLanguage in CONFIG["SFRPG"].languages) {
                        officialLanguages.push(keyedLanguage);
                    } else {
                        if (customLanguages.length > 0) {
                            customLanguages += ", ";
                        }
                        customLanguages += SBUtils.camelize(language);
                    }
                } catch (err) {
                    errors.push([language, err]);
                }
            }

            dict["data.traits.languages"] = { value: officialLanguages, custom: customLanguages };
        },

        "resistances": (dict, val) => {
            let officialResists = [];
            let customResists = "";

            let rawResistances = val.current.split(',');
            for (let resistance of rawResistances) {
                try {
                    let resistanceMatch = resistance.trim().match(/(\D*)(\d*)/);
                    let resist = resistanceMatch[1].trim().toLowerCase();
                    let amount = resistanceMatch[2].trim();

                    if (resist in CONFIG["SFRPG"].energyDamageTypes) {
                        let resistData = {};
                        resistData[resist] = amount;
                        officialResists.push(resistData);
                    } else {
                        if (customResists.length > 0) {
                            customResists += ", ";
                        }
                        customResists += SBUtils.camelize(resist) + " " + amount;
                    }
                } catch (err) {
                    errors.push([resistance, err]);
                }
            }

            dict["data.traits.dr"] = { value: officialResists, custom: customResists };
        }
    };

    async parseInput(actorData, inputText) {
        if (actorData == null || !inputText) {
            return {success: false};
        }

        if (!actorData.data) {
            actorData.data = {};
        }

        let characterData = {
            actorData: actorData,
            items: [],
            spells: [],
            abilityDescriptions: [],
            characterDescriptions: []
        }

        // NPCs by default have no SP or RP
        characterData.actorData["data.attributes.sp.max"] = 0;
        characterData.actorData["data.attributes.rp.max"] = 0;
        characterData.actorData['data.traits.size'] = "medium";

        let errors = [];

        let parsedJson = JSON.parse(inputText);

        characterData.actorData["name"] = parsedJson.name;
        if (parsedJson.avatar) {
            characterData.actorData["img"] = parsedJson.avatar;
        }

        if (parsedJson.bio) {
            this.attributeMapping["bio"](characterData.actorData, parsedJson.bio);
        }

        if (parsedJson.gmnotes) {
            this.attributeMapping["gmnotes"](characterData.actorData, parsedJson.gmnotes);
        }

        let recognizedMappings = Object.keys(this.attributeMapping);
        for(let key of recognizedMappings)
        {
            let target = this.attributeMapping[key];
            let parsedValue = parsedJson.attribs.filter(x => x.name == key);
            if (parsedValue && parsedValue.length > 0) {
                try {
                    target(characterData.actorData, parsedValue[0]);
                } catch (err) {
                    errors.push([key, err]);
                }
            }
        }

        // Now we parse advanced attributes, repeating_ability and repeating_attack
        let repeatingAbilities = {};
        let repeatingAttacks = {};
        let repeatingSpells = {};
        for (let attrib of parsedJson.attribs) {
            if (attrib.name.startsWith("repeating_ability_")) {
                let cutname = attrib.name.substring("repeating_ability_".length);
                let id = cutname.substring(0, 20);
                let key = cutname.substring(21);

                if (!(id in repeatingAbilities)) {
                    repeatingAbilities[id] = {};
                }
                repeatingAbilities[id][key] = {current: attrib.current, max: attrib.max};
            } else if (attrib.name.startsWith("repeating_attack_")) {
                let cutname = attrib.name.substring("repeating_attack_".length);
                let id = cutname.substring(0, 20);
                let key = cutname.substring(21);

                if (!(id in repeatingAttacks)) {
                    repeatingAttacks[id] = {};
                }
                repeatingAttacks[id][key] = {current: attrib.current, max: attrib.max};
            } else if (attrib.name.startsWith("repeating_spell_")) {
                let cutname = attrib.name.substring("repeating_spell_".length);
                let id = cutname.substring(0, 20);
                let key = cutname.substring(21);

                if (!(id in repeatingSpells)) {
                    repeatingSpells[id] = {};
                }
                repeatingSpells[id][key] = {current: attrib.current, max: attrib.max};
            }
        }

        for (let key of Object.keys(repeatingAbilities)) {
            let ability = repeatingAbilities[key];
            if (!ability.name) {
                continue;
            }

            let abilityName = ability.name.current;

            try {
                let matchingItem = await SBUtils.fuzzyFindItemAsync(abilityName);
                if (matchingItem == null) {
                    matchingItem = await SBUtils.fuzzyFindSpellAsync(abilityName);
                    if (matchingItem == null) {
                        matchingItem = await SBUtils.fuzzyFindCompendiumAsync("Class Features", abilityName)
                        if (matchingItem == null) {
                            matchingItem = await SBUtils.fuzzyFindCompendiumAsync("Feats", abilityName)
                        }
                    }
                }

                let itemData = matchingItem != null ? matchingItem : {"name": abilityName, data: {}};
                if (matchingItem == null) {
                    let matchingRule = SBUniversalMonsterRules.specialAbilities.filter((x) => x.name == abilityName);
                    if (matchingRule.length > 0) {
                        itemData["data.description.value"] = `<p>${matchingRule[0].description}</p>`;
                    }
                }

                if (itemData["_id"]) {
                    itemData["sourceId"] = itemData["_id"];
                    delete itemData["_id"];
                }

                if (!itemData.type) {
                    itemData["type"] = "feat";
                }

                if (ability.description && ability.description.current) {
                    if (itemData.data.description && itemData.data.description.value) {
                        itemData["data.description.value"] = itemData.data.description.value + "<br />Parsed data:<br />" + ability.description.current;
                    } else {
                        itemData["data.description.value"] = ability.description.current;
                    }
                }

                if (ability.dc_base && ability.dc_base.current) {
                    itemData["data.save.dc"] = ability.dc_base.current;
                }

                if (ability.type && ability.type.current === "SP") {
                    itemData["data.preparation"] = { prepared: true, mode: "innate" };
                }

                characterData.items.push(itemData);
            } catch (err) {
                errors.push([abilityName, err]);
            }
        }

        for (let key of Object.keys(repeatingAttacks)) {
            let attack = repeatingAttacks[key];
            if (!attack.name) {
                continue;
            }

            let attackName = attack.name.current;

            try {
                let bIsMeleeAttack = (attack.engagement_range.current === "melee");

                let matchingItem = await SBUtils.fuzzyFindItemAsync(attackName);
                if (matchingItem == null) {
                    matchingItem = await SBUtils.fuzzyFindSpellAsync(attackName);
                }

                let itemData = matchingItem != null ? matchingItem : {"name": attackName, data: {}};
                if (matchingItem == null) {
                    let matchingRule = SBUniversalMonsterRules.specialAbilities.filter((x) => x.name == attackName);
                    if (matchingRule.length > 0) {
                        itemData["data.description.value"] = `<p>${matchingRule[0].description}</p>`;
                    }
                }

                if (itemData["_id"]) {
                    itemData["sourceId"] = itemData["_id"];
                    delete itemData["_id"];
                }

                if (!itemData.type) {
                    itemData["type"] = "weapon";
                }
                if (!itemData.data.actionType) {
                    itemData["data.actionType"] = bIsMeleeAttack ? "mwak" : "rwak";
                }
                if (!itemData.data.weaponType) {
                    itemData["data.weaponType"] = bIsMeleeAttack ? "basicM" : "smallA";
                }

                itemData["data.ability"] = "";
                itemData["data.attackBonus"] = attack.total.current;

                let damage = itemData["data.damage"];
                if (damage) {
                    let firstPart = itemData["data.damage"].parts.len > 0 ? itemData["data.damage"].parts[0] : [0, "S"];
                    itemData["data.damage"] = {parts: [[attack.damage_total.current, firstPart[1]]]};
                } else {
                    itemData["data.damage"] = {parts: [[attack.damage_total.current, "S"]]};
                }

                if (attack.description && attack.description.current) {
                    if (itemData.data.description && itemData.data.description.value) {
                        itemData["data.description.value"] = itemData.data.description.value + "<br />Parsed data:<br />" + attack.description.current;
                    } else {
                        itemData["data.description.value"] = attack.description.current;
                    }
                }

                characterData.items.push(itemData);
            } catch (err) {
                errors.push([attackName, err]);
            }
        }

        for (let key of Object.keys(repeatingSpells)) {
            let spell = repeatingSpells[key];
            if (!spell.name) {
                continue;
            }

            let spellName = spell.name.current;

            try {
                let matchingItem = await SBUtils.fuzzyFindItemAsync(spellName);
                if (matchingItem == null) {
                    matchingItem = await SBUtils.fuzzyFindSpellAsync(spellName);
                    if (matchingItem == null) {
                        matchingItem = await SBUtils.fuzzyFindCompendiumAsync("Class Features", spellName)
                        if (matchingItem == null) {
                            matchingItem = await SBUtils.fuzzyFindCompendiumAsync("Feats", spellName)
                        }
                    }
                }

                let itemData = matchingItem != null ? matchingItem : {"name": spellName, data: {}};
                if (matchingItem == null) {
                    let matchingRule = SBUniversalMonsterRules.specialAbilities.filter((x) => x.name == spellName);
                    if (matchingRule.length > 0) {
                        itemData["data.description.value"] = `<p>${matchingRule[0].description}</p>`;
                    }
                }

                if (itemData["_id"]) {
                    itemData["sourceId"] = itemData["_id"];
                    delete itemData["_id"];
                }

                if (!itemData.type) {
                    itemData["type"] = "feat";
                }

                if (spell.description && spell.description.current) {
                    if (itemData.data.description && itemData.data.description.value) {
                        itemData["data.description.value"] = itemData.data.description.value + "<br />Parsed data:<br />" + spell.description.current;
                    } else {
                        itemData["data.description.value"] = spell.description.current;
                    }
                }

                if (spell.dc_base && spell.dc_base.current) {
                    itemData["data.save.dc"] = spell.dc_base.current;
                }

                itemData["data.preparation"] = { prepared: true };

                characterData.items.push(itemData);
            } catch (err) {
                errors.push([spellName, err]);
            }
        }

        // Add tactics, environment, organization, etc.
        let tactics = parsedJson.attribs.find(x => x.name === "tactics");
        if (tactics) {
            this.addSectionedData(characterData.actorData, "Tactics", tactics.current, true);
        }

        let environment = parsedJson.attribs.find(x => x.name === "environment");
        if (environment) {
            this.addSectionedData(characterData.actorData, "Environment", environment.current, true);
        }

        let organization = parsedJson.attribs.find(x => x.name === "organization");
        if (organization) {
            this.addSectionedData(characterData.actorData, "Organization", organization.current, true);
        }

        // Now iterate over skill contextual notes
        let bonusDescriptions = [];
        let skillDescriptionKeys = this.skillNames.map(x => x + "_description");
        for (let attrib of parsedJson.attribs) {
            if (skillDescriptionKeys.includes(attrib.name)) {
                let cleanedUpName = SBUtils.camelize(attrib.name.replace("_"," ").trim());
                bonusDescriptions.push(cleanedUpName + ": " + attrib.current);
            }
        }

        if (bonusDescriptions.length > 0) {
            let bonusDesc = "<section class=\"secret\"><strong>Skill notes</strong><br />";
            for (let desc of bonusDescriptions) {
                bonusDesc += desc + "<br />";
            }
            bonusDesc += "</section>";
            
            let oldDesc = characterData.actorData["data.details.biography.value"];
            if (oldDesc) {
                characterData.actorData["data.details.biography.value"] = oldDesc + "<br />" + bonusDesc;
            } else {
                characterData.actorData["data.details.biography.value"] = bonusDesc;
            }
        }

        let oldDesc = characterData.actorData["data.details.biography.value"];
        if (oldDesc) {
            characterData.actorData["data.details.biography.value"] = oldDesc + "<br />";
        }

        return {success: true, characterData: characterData, errors: errors};
    }
}
