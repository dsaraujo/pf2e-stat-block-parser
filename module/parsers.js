import { SFRPG } from "../../../systems/sfrpg/module/config.js";

import { SBUtils, SBConfig } from "./utils.js";

export class SBParserMapping {}

/** Convenience helper, tries to parse the number to integer, if it is NaN, will return 0 instead. */
let parseInteger = (value) => {let p = parseInt(value); return isNaN(p) ? 0 : p;};

class SBSingleValueParser {
    constructor(targetFields, bFirstValue = true, valueConverter = (value) => value) {
        this.targetFields = targetFields;
        this.bFirstValue = bFirstValue;
        this.valueConverter = valueConverter;
    }

    async parse(key, value) {
        let outputValue = value;
        if (this.bFirstValue) {
            let values = value.split(' ');
            outputValue = values[0];
        }

        let parsedData = {};
        this.targetFields.forEach(field => {
            parsedData[field] = this.valueConverter(outputValue);
        });
        return {actorData: parsedData};
    }
}

class SBSplitValueParser {
    constructor(targetFields, delimiter) {
        this.targetFields = targetFields;
        this.delimiter = delimiter;
    }

    async parse(key, value) {
        let parsedData = {};

        let splitValue = value.split(this.delimiter);
        if (splitValue.length != this.targetFields.length) {
            SBUtils.log("Mismatching number of fields for " + key);
        }

        let max = Math.min(splitValue.length, this.targetFields.length);
        for(let i = 0; i<max; i++) {
            parsedData[this.targetFields[i]] = splitValue[i];
        }

        return {actorData: parsedData};
    }
}

class SBSkillParser {
    async parse(key, value) {
        let skillName = key.toLowerCase().substring(0, 3);
        let values = value.split(' ');

        let parsedData = {};
        parsedData["data.skills." + skillName + ".enabled"] = true;
        parsedData["data.skills." + skillName + ".mod"] = values[0];
        return {actorData: parsedData};
    }
}

class SBSkillsParser {
    async parse(key, value) {
        let parsedData = {};
        let skillParser = new SBSkillParser();

        let skillPairs = value.split(',');
        for (let pair of skillPairs) {
            let skillPair = pair.trim().split(' ');
            let skillName = skillPair[0];
            let skillModifier = skillPair[1];

            let skillData = await skillParser.parse(skillName, skillModifier);
            parsedData = { ...parsedData, ...skillData.actorData };
        }

        return {actorData: parsedData};
    }
}

class SBAttackParser {
    constructor(bIsMelee) {
        this.bIsMelee = bIsMelee;
    }

    async parse(key, value) {
        let items = [];
        
        let allAttacks = value.split(/\sor\s|,/);
        for (let attack of allAttacks) {
            let itemData = await this.parseAttack(attack.trim(), this.bIsMelee);
            items.push(itemData);
        }

        return {items: items};
    }
  
    /** Will parse an attack using the attack format: attack name +attackRoll (damageRoll damageType ; critical effect) */
    async parseAttack(attack, bIsMeleeAttack) {
        let attackInfo = attack.split(/([a-zA-Z\s]*)\s([\+|-]\d*)\s\((.*)\)/);
                    
        let attackName = SBUtils.camelize(attackInfo[1]);
        let attackModifier = attackInfo[2];
        
        let damageString = attackInfo[3].split(";");
        let normalDamage = damageString[0].split("plus")[0].trim();
        let criticalDamage = "";
        if (damageString.length > 1) {
            criticalDamage = damageString[1];
        }
        
        let attackDamageData = normalDamage.split(/(\d*d\d*\+\d*)\s(.*)/);
        let attackDamageRoll = attackDamageData[1];
        let attackDamageType = attackDamageData[2].toLowerCase();
        if (SBConfig.weaponDamageTypes[attackDamageType] != undefined) {
            attackDamageType = SBConfig.weaponDamageTypes[attackDamageType];
        } else {
            attackDamageType = "slashing";
        }
        
        let matchingItem = await SBUtils.fuzzyFindItem(attackName);

        let itemData = matchingItem != null ? matchingItem : {"name": attackName};
        itemData["type"] = "weapon";
        itemData["data.actionType"] = bIsMeleeAttack ? "mwak" : "rwak";
        itemData["data.weaponType"] = bIsMeleeAttack ? "basicM" : "smallA";
        itemData["data.ability"] = bIsMeleeAttack ? "str" : "dex";
        itemData["data.attackBonus"] = parseInteger(attackModifier);
        itemData["data.damage"] = {parts: [[attackDamageRoll, attackDamageType]]};

        if (criticalDamage != "") {
            let criticalDamageRegex = criticalDamage.split(/critical\s(.*)\s(.*)/i);
            let criticalDamageEffect = criticalDamageRegex[1];
            let criticalDamageRoll = criticalDamageRegex[2];
            
            if (criticalDamageEffect != "") {
                itemData["data.critical.effect"] = SBUtils.camelize(criticalDamageEffect);
            }
            if (criticalDamageRoll != "") {
                itemData["data.critical.parts"] = [[criticalDamageRoll, attackDamageType]];
            }
        }
        
        return itemData;
    }
}

class SBTraitParser {
    constructor(traitField, supportedValues) {
        this.traitField = traitField;
        this.supportedValues = supportedValues;
    }

    async parse(key, value) {
        let parsedValues = {"value": [], "custom": ""};

        //SBUtils.log("Parsing trait: " + key + ", supported: " + this.supportedValues);

        let values = value.split(',');
        for (let traitValue of values) {
            let splitTrait = traitValue.trim().toLowerCase().split(' ');
            
            let traitName = splitTrait[0]
            let traitModifier = splitTrait.length > 1 ? splitTrait[1] : null;

            //SBUtils.log("Trait: " + traitName + ", supported: " + this.supportedValues.includes(traitName));
            if (this.supportedValues.includes(traitName)) {
                if (traitModifier != null) {
                    let trait = {};
                    trait[traitName] = traitModifier;
                    parsedValues.value.push(trait);
                } else {
                    parsedValues.value.push(traitName);
                }
            } else {
                if (parsedValues.custom.length > 0) {
                    parsedValues.custom += ", ";
                }
                parsedValues.custom += SBUtils.camelize(traitName);
            }
        }

        let actorData = {};
        actorData[this.traitField] = parsedValues;
        return {actorData: actorData};
    }
}

class SBWeaknessesParser {
    async parse(key, value) {
        let recognizedWeaknesses = Object.keys(SFRPG.energyDamageTypes).map(x => x.toLowerCase());

        let knownWeaknesses = [];
        let customWeaknesses = "";

        let weaknesses = value.split(',');
        for (let rawWeakness of weaknesses) {
            let parsedWeakness = rawWeakness.split(/vulnerab.*\sto\s(.*)/i);
            if (parsedWeakness[0].length == 0 && recognizedWeaknesses.includes(parsedWeakness[1].toLowerCase())) {
                knownWeaknesses.push(parsedWeakness[1].toLowerCase());
            } else {
                if (customWeaknesses) {
                    customWeaknesses += ", ";
                }
                customWeaknesses += SBUtils.camelize(rawWeakness);
            }
        }

        let parsedData = {};
        parsedData["data.traits.dv"] = {"value": knownWeaknesses, "custom": customWeaknesses};
        return {actorData: parsedData};
    }
}

SBParserMapping.parsers = {
    "hp": new SBSingleValueParser(["data.attributes.hp.value", "data.attributes.hp.max"]),
    "sp": new SBSingleValueParser(["data.attributes.sp.value", "data.attributes.sp.max"]),
    "rp": new SBSingleValueParser(["data.attributes.rp.value", "data.attributes.rp.max"]),
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
    "dr": new SBSplitValueParser(["data.traits.damageReduction.value", "data.traits.damageReduction.negatedBy"], "/"),
    "melee": new SBAttackParser(true),
    "ranged": new SBAttackParser(false), 
    "languages": new SBTraitParser("data.traits.languages", Object.keys(SFRPG.languages).map(x => x.toLowerCase())),
    "resistances": new SBTraitParser("data.traits.dr", Object.keys(SFRPG.energyDamageTypes).map(x => x.toLowerCase())),
    "weaknesses": new SBWeaknessesParser()
};
