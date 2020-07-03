import { SBUtils, SBConfig } from "./utils.js";

export class SBParserMapping {}

class SBSingleValueParser {
    constructor(targetFields, bFirstValue = true, valueConverter = (value) => value) {
        this.targetFields = targetFields;
        this.bFirstValue = bFirstValue;
        this.valueConverter = valueConverter;
    }

    parse(key, value) {
        let outputValue = value;
        if (this.bFirstValue) {
            let values = value.split(' ');
            outputValue = values[0];
        }

        let parsedData = {};
        this.targetFields.forEach(field => {
            parsedData[field] = this.valueConverter(outputValue);
        });
        return parsedData;
    }
}

class SBSplitValueParser {
    constructor(targetFields, delimiter) {
        this.targetFields = targetFields;
        this.delimiter = delimiter;
    }

    parse(key, value) {
        let parsedData = {};

        let splitValue = value.split(this.delimiter);
        if (splitValue.length != this.targetFields.length) {
            SBUtils.log("Mismatching number of fields for " + key);
        }

        let max = Math.min(splitValue.length, this.targetFields.length);
        for(let i = 0; i<max; i++) {
            parsedData[this.targetFields[i]] = splitValue[i];
        }

        return parsedData;
    }
}

class SBSkillParser {
    parse(key, value) {
        let skillName = key.toLowerCase().substring(0, 3);
        let values = value.split(' ');

        let parsedData = {};
        parsedData["data.skills." + skillName + ".enabled"] = true;
        parsedData["data.skills." + skillName + ".mod"] = values[0];
        return parsedData;
    }
}

class SBSkillsParser {
    parse(key, value) {
        let parsedData = {};
        let skillParser = new SBSkillParser();

        let skillPairs = value.split(',');
        skillPairs.forEach(pair => {
            let skillPair = pair.trim().split(' ');
            let skillName = skillPair[0].substring(0,3).toLowerCase();
            let skillModifier = skillPair[1];

            let skillData = skillParser.parse(skillName, skillModifier);
            parsedData = { ...parsedData, ...skillData };
        });

        return parsedData;
    }
}

let parseInteger = (value) => {let p = parseInt(value); return isNaN(p) ? 0 : p;};

SBParserMapping.parsers = {
    "hp": new SBSingleValueParser(["data.attributes.hp.value", "data.attributes.hp.max"]),
    "init": new SBSingleValueParser(["data.attributes.init.total"]),
    "eac": new SBSingleValueParser(["data.attributes.eac.value"]),
    "kac": new SBSingleValueParser(["data.attributes.kac.value"]),
    "fort": new SBSingleValueParser(["data.attributes.fort.bonus"]),
    "ref": new SBSingleValueParser(["data.attributes.reflex.bonus"]),
    "will": new SBSingleValueParser(["data.attributes.will.bonus"]),
    "speed": new SBSingleValueParser(["data.attributes.speed.value"]),
    "str": new SBSingleValueParser(["data.abilities.str.mod"], false, parseInteger),
    "dex": new SBSingleValueParser(["data.abilities.dex.mod"], false, parseInteger),
    "con": new SBSingleValueParser(["data.abilities.con.mod"], false, parseInteger),
    "int": new SBSingleValueParser(["data.abilities.int.mod"], false, parseInteger),
    "wis": new SBSingleValueParser(["data.abilities.wis.mod"], false, parseInteger),
    "cha": new SBSingleValueParser(["data.abilities.cha.mod"], false, parseInteger),
    "senses": new SBSingleValueParser(["data.traits.senses"], false),
    "sr": new SBSingleValueParser(["data.traits.sr"], false),
    "perception": new SBSkillParser(),
    "skills": new SBSkillsParser(),
    "dr": new SBSplitValueParser(["data.traits.damageReduction.value", "data.traits.damageReduction.negatedBy"], "/")
};
