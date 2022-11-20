import { SBUtils, SBConfig } from "./utils.js";

export class SBVTTESParser {
    skillNames = ["acrobatics", "athletics", "bluff", "computers", "culture",
        "diplomacy", "disguise", "engineering", "intimidate", "life_science",
        "medicine", "mysticism", "perception", "physical_science", "piloting",
        "profession", "sense_motive", "sleight_of_hand", "stealth", "survival"
    ];

    parseSkill(dict, skill, value) {
        if (value.current != 0) {
            dict["system.skills." + skill + ".enabled"] = true;
            dict["system.skills." + skill + ".mod"] = value.current;
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
        
        let oldDesc = dict["system.details.biography.value"];
        if (oldDesc) {
            dict["system.details.biography.value"] = oldDesc + "<br />" + sectionData;
        } else {
            dict["system.details.biography.value"] = sectionData;
        }
    }

    attributeMapping = {
        "character_level": (dict,val) => dict["system.details.cr"] = val.current,
        "strength_mod": (dict,val) => dict["system.abilities.str.mod"] = val.current,
        "dexterity_mod": (dict,val) => dict["system.abilities.dex.mod"] = val.current,
        "constitution_mod": (dict,val) => dict["system.abilities.con.mod"] = val.current,
        "intelligence_mod": (dict,val) => dict["system.abilities.int.mod"] = val.current,
        "wisdom_mod": (dict,val) => dict["system.abilities.wis.mod"] = val.current,
        "charisma_mod": (dict,val) => dict["system.abilities.cha.mod"] = val.current,
        "race": (dict,val) => dict['system.details.raceAndGrafts'] = SBUtils.camelize(val.current),
        "alignment": (dict,val) => dict["system.details.alignment"] = val.current,
        "type_subtype": (dict,val) => dict['system.details.type'] = SBUtils.camelize(val.current),
        "initiative_base": (dict,val) => dict["system.attributes.init.total"] = val.current,
        "senses": (dict,val) => dict["system.traits.senses"] = val.current,
        "perception_base": (dict,val) => { dict["system.skills.per.mod"] = val.current; dict["system.skills.per.enabled"] = true; },
        "hp": (dict,val) => { dict["system.attributes.hp.value"] = val.current; dict["system.attributes.hp.max"] = val.max; },
        "sp": (dict,val) => { dict["system.attributes.sp.value"] = val.current; dict["system.attributes.sp.max"] = val.max; },
        "rp": (dict,val) => { dict["system.attributes.rp.value"] = val.current; dict["system.attributes.rp.max"] = val.max; },
        "eac_base": (dict,val) => { dict["system.attributes.eac.value"] = val.current; },
        "kac_base": (dict,val) => { dict["system.attributes.kac.value"] = val.current; },
        "cmd_base": (dict,val) => { dict["system.attributes.cmd.value"] = val.current; },
        "fort_base": (dict,val) => { dict["system.attributes.fort.bonus"] = val.current; },
        "ref_base": (dict,val) => { dict["system.attributes.reflex.bonus"] = val.current; },
        "will_base": (dict,val) => { dict["system.attributes.will.bonus"] = val.current; },
        "speed": (dict,val) => { dict[game.system.version.localeCompare("0.12.0", undefined, { numeric: true, sensitivity: 'base' }) >= 0 ? "system.attributes.speed.land.base" : "system.attributes.speed.value"] = val.current; },
        "space": (dict,val) => { dict["system.attributes.space"] = val.current; },
        "reach": (dict,val) => { dict["system.attributes.reach"] = val.current; },
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

        "melee_spell_attack": (dict, val) => { dict["system.attributes.spellcasting.melee"] = val.current; },
        "ranged_spell_attack": (dict, val) => { dict["system.attributes.spellcasting.ranged"] = val.current; },

        "dr": (dict, val) => {
            let drParts = val.current.split('/');
            let damageReduction = {
                value: drParts[0],
                negatedBy: drParts[1]
            }
            dict["system.traits.damageReduction"] = damageReduction;
        },
        "sr": (dict,val) => { dict["system.traits.sr"] = val.current; },

        "resistances": (dict,val) => {
            let recognizedResistances = Object.keys(CONFIG["SFRPG"].energyDamageTypes).map(x => x.toLowerCase());
            let parsedValues = {"value": [], "custom": ""};

            let entries = SBUtils.splitEntries(val.current);
            for (let entry of entries) {
                let values = entry.trim().toLowerCase().split(' ');
                let name = values[0];
                let amount = values[1];

                if (recognizedResistances.includes(name)) {
                    parsedValues.value[name] = amount;
                } else {
                    if (parsedValues.custom) {
                        parsedValues.custom += ", ";
                    }
                    parsedValues.custom += SBUtils.camelize(entry.trim());
                }
            }

            dict["system.traits.dr"] = parsedValues;
        },

        "weaknesses": (dict,val) => {
            let recognizedResistances = Object.keys(CONFIG["SFRPG"].energyDamageTypes).map(x => x.toLowerCase());
            let parsedValues = {"value": [], "custom": ""};

            let entries = SBUtils.splitEntries(val.current);
            for (let entry of entries) {
                if (entry.toLowerCase().startsWith("vulnerable to ")) {
                    entry = entry.substring("vulnerable to ".length);
                }

                let name = entry.trim().toLowerCase();

                if (recognizedResistances.includes(name)) {
                    parsedValues.value.push(name);
                } else {
                    if (parsedValues.custom) {
                        parsedValues.custom += ", ";
                    }
                    parsedValues.custom += SBUtils.camelize(entry.trim());
                }
            }

            dict["system.traits.dv"] = parsedValues;
        },

        "immunities": (dict,val) => {
            let recognizedResistances = Object.keys(CONFIG["SFRPG"].energyDamageTypes).map(x => x.toLowerCase());
            let parsedValues = {"value": [], "custom": ""};

            let entries = SBUtils.splitEntries(val.current);
            for (let entry of entries) {
                let name = entry.trim().toLowerCase();

                if (recognizedResistances.includes(name)) {
                    parsedValues.value.push(name);
                } else {
                    if (parsedValues.custom) {
                        parsedValues.custom += ", ";
                    }
                    parsedValues.custom += SBUtils.camelize(entry.trim());
                }
            }

            dict["system.traits.di"] = parsedValues;
        },

        "size": (dict, val) => {
            let sizes = Object.keys(CONFIG["SFRPG"].actorSizes);
            let indexOfMedium = sizes.indexOf("medium");
            let desiredIndex = indexOfMedium + Number(val.current);
            let size = sizes[desiredIndex];
            dict["system.traits.size"] = size;
        },

        "bio": (dict, val) => {
            let biography = "<strong>Biography</strong><br />";
            biography += unescape(val);

            let oldDesc = dict["system.details.biography.value"];
            dict["system.details.biography.value"] = biography;
            if (oldDesc) {
                dict["system.details.biography.value"] += "<br />" + oldDesc;
            }
        },

        "gmnotes": (dict, val) => {
            let gmNotes = "";
            gmNotes = "<section class=\"secret\"><strong>GM Notes</strong><br/>";
            gmNotes += unescape(val);
            gmNotes += "</section>";

            let oldDesc = dict["system.details.biography.value"];
            if (oldDesc) {
                dict["system.details.biography.value"] += "<br />";
                dict["system.details.biography.value"] += gmNotes;
            } else {
                dict["system.details.biography.value"] = gmNotes;
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

            dict["system.traits.languages"] = { value: officialLanguages, custom: customLanguages };
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

            dict["system.traits.dr"] = { value: officialResists, custom: customResists };
        }
    };

    async parseInput(actorData, inputText) {
        const damageVersion = game.system.version.localeCompare("0.13.0", undefined, { numeric: true, sensitivity: 'base' }) >= 0;

        if (actorData == null || !inputText) {
            return {success: false};
        }

        if (!actorData.system) {
            actorData.system = {};
        }

        let characterData = {
            actorData: actorData,
            items: [],
            spells: [],
            abilityDescriptions: [],
            characterDescriptions: []
        }

        // NPCs by default have no SP or RP
        characterData.actorData["system.attributes.sp.max"] = 0;
        characterData.actorData["system.attributes.rp.max"] = 0;
        characterData.actorData['system.traits.size'] = "medium";

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

        //=====================================================================
        // Abilities
        //=====================================================================
        for (let key of Object.keys(repeatingAbilities)) {
            let ability = repeatingAbilities[key];
            if (!ability.name) {
                continue;
            }

            let abilityName = ability.name.current;

            try {
                let matchingItem = await SBUtils.fuzzyFindItemAsync(abilityName);
                if (!matchingItem) {
                    matchingItem = await SBUtils.fuzzyFindSpellAsync(abilityName);
                    if (!matchingItem) {
                        matchingItem = await SBUtils.fuzzyFindCompendiumAsync("Class Features", abilityName)
                        if (!matchingItem) {
                            matchingItem = await SBUtils.fuzzyFindCompendiumAsync("Feats", abilityName)
                            if (!matchingItem) {
                                matchingItem = await SBUtils.fuzzyFindCompendiumAsync("Universal Creature Rules", abilityName)
                            }
                        }
                    }
                }

                let itemData = matchingItem != null ? matchingItem : {"name": abilityName, system: {}};
                if (itemData["_id"]) {
                    itemData["sourceId"] = itemData["_id"];
                    delete itemData["_id"];
                }

                if (!itemData.type) {
                    itemData["type"] = "feat";
                }

                if (ability.description && ability.description.current) {
                    if (itemData.description && itemData.description.value) {
                        itemData["system.description.value"] = itemData.description.value + "<br />Parsed data:<br />" + ability.description.current;
                    } else {
                        itemData["system.description.value"] = ability.description.current;
                    }
                }

                if (ability.dc_base && ability.dc_base.current) {
                    itemData["system.save.dc"] = ability.dc_base.current;
                }

                if (ability.type && ability.type.current === "SP") {
                    itemData["system.preparation"] = { prepared: true, mode: "innate" };
                }

                characterData.items.push(itemData);
            } catch (err) {
                errors.push([abilityName, err]);
            }
        }

        //=====================================================================
        // Attacks
        //=====================================================================
        for (let key of Object.keys(repeatingAttacks)) {
            let attack = repeatingAttacks[key];
            if (!attack.name) {
                continue;
            }

            let attackName = attack.name.current;

            try {
                let bIsMeleeAttack = ((attack.engagement_range?.current ?? "melee") === "melee");

                let matchingItem = await SBUtils.fuzzyFindItemAsync(attackName);
                if (matchingItem == null) {
                    matchingItem = await SBUtils.fuzzyFindSpellAsync(attackName);
                    if (!matchingItem) {
                        matchingItem = await SBUtils.fuzzyFindCompendiumAsync("Universal Creature Rules", attackName)
                    }
                }

                let itemData = matchingItem != null ? matchingItem : {"name": attackName, system: {}};
                if (itemData["_id"]) {
                    itemData["sourceId"] = itemData["_id"];
                    delete itemData["_id"];
                }

                if (!itemData.type) {
                    itemData["type"] = "weapon";
                }
                if (!itemData.actionType) {
                    itemData["system.actionType"] = bIsMeleeAttack ? "mwak" : "rwak";
                }
                if (!itemData.weaponType) {
                    itemData["system.weaponType"] = bIsMeleeAttack ? "basicM" : "smallA";
                }

                itemData["system.ability"] = "";
                itemData["system.attackBonus"] = attack.total.current;

                let damageType = "s";
                if (attack.type) {
                    let attackDamageTypes = attack.type.current.toLowerCase().split('+');
                    let partA = attackDamageTypes[0].trim()[0];
                    let partB = undefined;
                    if (attackDamageTypes.length > 1) {
                        partB = attackDamageTypes[1].trim()[0];
                    }

                    if (damageVersion) {
                        damageType = [partA];
                        if (partB) {
                            damageType = [partA, partB];
                        }
                    } else {
                        let combo = partA;
                        if (partB) {
                            combo += " & " + partB;
                            if (!(combo in SBConfig.weaponDamageTypes)) {
                                combo = partB + " & " + partA;
                            }
                        }
    
                        if (combo in SBConfig.weaponDamageTypes) {
                            damageType = combo;
                        } else if (partA in SBConfig.weaponDamageTypes) {
                            damageType = partA;
                        }
                    }
                }

                if (damageVersion) {
                    let attackDamageType = {};
                    for (const rawType of damageType) {
                        const parsedType = SBConfig.weaponDamageTypeNew[rawType.trim()];
                        attackDamageType = mergeObject(attackDamageType, parsedType);
                    }

                    const damagePart = {
                        formula: attack.damage_total.current,
                        types: attackDamageType,
                        operator: "and"
                    };

                    itemData = mergeObject(itemData, {system: {damage: {parts: [damagePart]}}});
                } else {
                    if (damageType in SBConfig.weaponDamageTypes) {
                        damageType = SBConfig.weaponDamageTypes[damageType];
                    } else {
                        damageType = SBConfig.weaponDamageTypes["s"];
                    }

                    if (itemData.system.damage?.parts) {
                        let firstPart = itemData.system.damage.parts.len > 0 ? itemData.system.damage.parts[0] : [0, damageType];
                        itemData["system.damage"] = {parts: [[attack.damage_total.current, firstPart[1]]]};
                    } else if (attack.damage_total) {
                        itemData["system.damage"] = {parts: [[attack.damage_total.current, damageType]]};
                    }
                }

                if (attack.description && attack.description.current) {
                    if (itemData.system.description && itemData.system.description.value) {
                        itemData["system.description.value"] = itemData.system.description.value + "<br />Parsed data:<br />" + attack.description.current;
                    } else {
                        itemData["system.description.value"] = attack.description.current;
                    }
                }

                characterData.items.push(itemData);
            } catch (err) {
                errors.push([attackName, err]);
            }
        }

        //=====================================================================
        // Spells
        //=====================================================================
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
                            if (!matchingItem) {
                                matchingItem = await SBUtils.fuzzyFindCompendiumAsync("Universal Creature Rules", spellName)
                            }
                        }
                    }
                }

                let itemData = matchingItem != null ? matchingItem : {"name": spellName, data: {}};
                if (itemData["_id"]) {
                    itemData["sourceId"] = itemData["_id"];
                    delete itemData["_id"];
                }

                if (!itemData.type) {
                    itemData["type"] = "feat";
                }

                if (spell.description && spell.description.current) {
                    if (itemData.system.description && itemData.system.description.value) {
                        itemData["system.description.value"] = itemData.system.description.value + "<br />Parsed data:<br />" + spell.description.current;
                    } else {
                        itemData["system.description.value"] = spell.description.current;
                    }
                }

                if (spell.dc_base && spell.dc_base.current) {
                    itemData["system.save.dc"] = spell.dc_base.current;
                }

                itemData["system.preparation"] = { prepared: true };

                let attackBonus = "";
                if (itemData?.system?.actionType === "msak") {
                    attackBonus = characterData.actorData["system.attributes.spellcasting.melee"] || "";
                } else if (itemData?.system?.actionType === "rsak") {
                    attackBonus = characterData.actorData["system.attributes.spellcasting.ranged"] || "";
                }
                if (attackBonus) {
                    itemData["system.attackBonus"] = attackBonus;
                }

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
            
            let oldDesc = characterData.actorData["system.details.biography.value"];
            if (oldDesc) {
                characterData.actorData["system.details.biography.value"] = oldDesc + "<br />" + bonusDesc;
            } else {
                characterData.actorData["system.details.biography.value"] = bonusDesc;
            }
        }

        let oldDesc = characterData.actorData["system.details.biography.value"];
        if (oldDesc) {
            characterData.actorData["system.details.biography.value"] = oldDesc + "<br />";
        }

        return {success: true, characterData: characterData, errors: errors};
    }
}
