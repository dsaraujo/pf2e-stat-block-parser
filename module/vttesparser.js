import { SBUtils, SBConfig } from "./utils.js";

export class SBVTTESParser {
    parseSkill(dict, skill, value) {
        if (value.current != 0) {
            dict["data.skills." + skill + ".enabled"] = true;
            dict["data.skills." + skill + ".mod"] = value.current;
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

        "languages": (dict, val) => {
            let officialLanguages = [];
            let customLanguages = "";

            let languages = val.current.split(',');
            for (let language of languages) {
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
            }

            dict["data.traits.languages"] = { value: officialLanguages, custom: customLanguages };
        },

        "resistances": (dict, val) => {
            let officialResists = [];
            let customResists = "";

            let rawResistances = val.current.split(',');
            for (let resistance of rawResistances) {
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
            }

            dict["data.traits.dr"] = { value: officialResists, custom: customResists };
        }
    };

    async parseInput(actorData, inputText) {
        if (actorData == null || !inputText) {
            return {success: false};
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

        let errors = [];

        let parsedJson = JSON.parse(inputText);

        characterData.actorData["name"] = parsedJson.name;
        if (parsedJson.avatar) {
            characterData.actorData["img"] = parsedJson.avatar;
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
            }
        }

        //console.log(repeatingAbilities);
        //console.log(repeatingAttacks);

        return {success: true, characterData: characterData, errors: errors};
    }
}
