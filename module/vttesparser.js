import { SBUtils, SBConfig } from "./utils.js";

export class SBVTTESParser {
    attributeMapping = {
        "strength_mod": "data.abilities.str.mod",
        "dexterity_mod": "data.abilities.dex.mod",
        "constitution_mod": "data.abilities.con.mod",
        "intelligence_mod": "data.abilities.int.mod",
        "wisdom_mod": "data.abilities.wis.mod",
        "charisma_mod": "data.abilities.cha.mod",
    };

    async parseInput(actorData, inputText) {
        if (actorData == null || !inputText) {
            return {success: false};
        }

        let items = [];

        let parsedJson = JSON.parse(inputText);

        actorData["name"] = parsedJson.name;
        if (parsedJson.avatar) {
            actorData["img"] = parsedJson.avatar;
        }

        let recognizedMappings = Object.keys(this.attributeMapping);
        for(let key of recognizedMappings)
        {
            let target = this.attributeMapping[key];
            let parsedValue = parsedJson.attribs.filter(x => x.name == key);
            if (parsedValue != null) {
                actorData[target] = parsedValue[0].current;
            }
        }

        return {success: true, actorData: actorData, items: items};
    }
}
