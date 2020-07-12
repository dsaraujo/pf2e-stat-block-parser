import { SBUtils, SBConfig } from "./utils.js";

export class SBVTTESParser {
    attributeMapping = {
        "strength_mod": (dict,val) => dict["data.abilities.str.mod"] = val.current,
        "dexterity_mod": (dict,val) => dict["data.abilities.dex.mod"] = val.current,
        "constitution_mod": (dict,val) => dict["data.abilities.con.mod"] = val.current,
        "intelligence_mod": (dict,val) => dict["data.abilities.int.mod"] = val.current,
        "wisdom_mod": (dict,val) => dict["data.abilities.wis.mod"] = val.current,
        "charisma_mod": (dict,val) => dict["data.abilities.cha.mod"] = val.current,
        "race": (dict,val) => {
            let splitValue = val.current.split(/(\S*)\s(.*)\s(\S*)/i);
            let npcGender = splitValue[1];
            let npcRace = splitValue[2];
            let npClass = splitValue[3];
            if (npcGender) {
                dict['data.details.gender'] = SBUtils.camelize(npcGender);
            }
            if (npcRace) {
                dict['data.details.race'] = SBUtils.camelize(npcRace);
            }
            if (npClass) {
                dict['data.details.class'] = SBUtils.camelize(npClass);
            }
        },
        "alignment": (dict,val) => dict["data.details.alignment"] = val.current,
        "type_subtype": (dict,val) => {
            if (val.current.includes('(')) {
                let splitValue = val.current.split(/(.*)\s\((.*)\)/i)
                dict['data.details.type'] = SBUtils.camelize(splitValue[1].trim());
                dict['data.details.subtype'] = SBUtils.camelize(splitValue[2].trim());
            } else {
                dict['data.details.type'] = SBUtils.camelize(val.current);
            }
        },
        "initiative_base": (dict,val) => dict["data.attributes.init.total"] = val.current,
        "senses": (dict,val) => dict["data.traits.senses"] = val.current,
        "perception_base": (dict,val) => { dict["data.skills.per.mod"] = val.current; dict["data.skills.per.enabled"] = true; },
        "hp": (dict,val) => { dict["data.attributes.hp.value"] = val.max; dict["data.attributes.hp.value"] = val.max; },
        "sp": (dict,val) => { dict["data.attributes.sp.value"] = val.max; dict["data.attributes.sp.value"] = val.max; },
        "rp": (dict,val) => { dict["data.attributes.rp.value"] = val.max; dict["data.attributes.rp.value"] = val.max; },
        "eac_base": (dict,val) => { dict["data.attributes.eac.value"] = val.max; },
        "kac_base": (dict,val) => { dict["data.attributes.kac.value"] = val.max; },
        "cmd_base": (dict,val) => { dict["data.attributes.cmd.value"] = val.max; },
        "fort_base": (dict,val) => { dict["data.attributes.fort.bonus"] = val.max; },
        "ref_base": (dict,val) => { dict["data.attributes.reflex.bonus"] = val.max; },
        "will_base": (dict,val) => { dict["data.attributes.will.bonus"] = val.max; },
        "resistances": (dict,val) => { SBUtils.log("> TODO: Implement resistances") }, // "Electricity 5, fire 5"
        "speed": (dict,val) => { dict["data.attributes.speed.value"] = val.max; }
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

        let items = [];
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
            if (parsedValue != null) {
                SBUtils.log("> " + JSON.stringify(parsedValue[0]));
                try {
                    target(characterData.actorData, parsedValue[0]);
                } catch {
                    errors.push([firstWord, err]);
                }
            }
        }

        return {success: true, characterData: characterData, errors: errors};
    }
}
