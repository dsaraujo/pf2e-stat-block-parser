import { SFRPG } from "../../../systems/sfrpg/module/config.js";

import { SBUtils, SBConfig } from "./utils.js";

export class SBParserMapping {}

/** Convenience helper, tries to parse the number to integer, if it is NaN, will return 0 instead. */
let parseInteger = (value) => {let p = parseInt(value); return isNaN(p) ? 0 : p;};

export class SBParserBase {
    constructor() {

    }

    async parse(key, value) {
        return {};
    }
}

export class SBCategoryParserBase extends SBParserBase {
    constructor() {
        super();
    }

    async parse(key, value) {
        return {};
    }
}

class SBSingleValueParser extends SBParserBase {
    constructor(targetFields, bFirstValue = true, valueConverter = (value) => value) {
        super();
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

class SBSplitValueParser extends SBParserBase {
    constructor(targetFields, delimiter) {
        super();
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

class SBSkillParser extends SBParserBase {
    async parse(key, value) {
        let skillName = SBConfig.skillMapping[key.toLowerCase()];
        if (!skillName) {
            skillName = key.toLowerCase().substring(0, 3);
        }

        let values = value.split(' ');

        let parsedData = {};
        parsedData["data.skills." + skillName + ".enabled"] = true;
        parsedData["data.skills." + skillName + ".mod"] = values[0];
        return {actorData: parsedData};
    }
}

class SBSkillsParser extends SBParserBase {
    async parse(key, value) {
        let parsedData = {};
        let skillParser = new SBSkillParser();

        let skillPairs = value.split(',');
        for (let pair of skillPairs) {
            let skillPair = pair.trim().split(/(.*)\s([\+|-]\d*)/i);

            if (skillPair[0].length != 0 || !skillPair[1] || !skillPair[2]) {
                //SBUtils.log("Failed to parse skill: " + pair);
                continue;
            }

            let skillName = skillPair[1].trim();
            let skillModifier = skillPair[2].trim();

            let skillData = await skillParser.parse(skillName, skillModifier);
            parsedData = { ...parsedData, ...skillData.actorData };
        }

        return {actorData: parsedData};
    }
}

class SBAttackParser extends SBParserBase {
    constructor(bIsMelee) {
        super();
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

class SBTraitParser extends SBParserBase {
    constructor(traitField, supportedValues) {
        super();
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

class SBLanguagesParser extends SBTraitParser {
    constructor(traitField, supportedValues) {
        super(traitField, supportedValues);
    }

    async parse(key, value) {
        value = value.toLowerCase().replace("lashunta", "castrovelian");
        return super.parse(key, value);
    }
}

class SBWeaknessesParser extends SBParserBase {
    async parse(key, value) {
        let recognizedWeaknesses = Object.keys(SFRPG.damageTypes).map(x => x.toLowerCase());

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

class SBImmunitiesParser extends SBParserBase {
    async parse(key, value) {
        let recognizedConditionImmunities = Object.keys(SFRPG.conditionTypes).map(x => x.toLowerCase());
        let recognizedDamageImmunities = Object.keys(SFRPG.damageTypes).map(x => x.toLowerCase());

        let knownConditionImmunities = [];
        let knownDamageImmunities = [];
        let customImmunities = "";

        // Replace known cases
        value = value.toLowerCase()
            .replace("stunning", "stunned")
            .replace("sleep", "asleep");

        let rawImmunities = value.split(',');
        for (let rawImmunity of rawImmunities) {
            let parsedImmunity = rawImmunity.trim();
            if (recognizedConditionImmunities.includes(parsedImmunity)) {
                knownConditionImmunities.push(parsedImmunity);
            } else if (recognizedDamageImmunities.includes(parsedImmunity)) {
                knownDamageImmunities.push(parsedImmunity);
            } else {
                if (customImmunities) {
                    customImmunities += ", ";
                }
                customImmunities += SBUtils.camelize(parsedImmunity);
            }
        }

        let parsedData = {};
        parsedData["data.traits.ci"] = {"value": knownConditionImmunities, "custom": customImmunities};
        parsedData["data.traits.di"] = {"value": knownDamageImmunities, "custom": customImmunities};
        return {actorData: parsedData};
    }
}

class SBAbilityParser extends SBParserBase {
    async parse(key, value) {
        let items = [];

        let parsedAbilities = {};
        
        let hierarchy = [];
        let currentToken = "";
        for (var i = 0; i<value.length; i++)
        {
            let character = value[i];
            if (character === '(') {
                hierarchy.push(currentToken.trim());
                parsedAbilities[currentToken.trim()] = [];
                currentToken = "";
            } else if (character === ')') {
                let top = hierarchy.length > 0 ? hierarchy[hierarchy.length - 1] : "";
                if (top) {
                    parsedAbilities[top].push(currentToken.trim());
                } else {
                    parsedAbilities[currentToken] = "";
                }
                currentToken = "";
                hierarchy.pop();
            } else if (character === ',') {
                let top = hierarchy.length > 0 ? hierarchy[hierarchy.length - 1] : "";
                if (top) {
                    parsedAbilities[top].push(currentToken.trim());
                } else {
                    parsedAbilities[currentToken.trim()] = "";
                }
                currentToken = "";
            } else {
                currentToken += character;
            }
        }
        if (currentToken != "") {
            parsedAbilities[currentToken] = "";
            currentToken = "";
        }

        //SBUtils.log("Abilities: " + JSON.stringify(parsedAbilities));
        let abilityKeys = Object.keys(parsedAbilities);
        for (let ability of abilityKeys) {
            if (!ability) {
                continue;
            }

            let abilityValue = parsedAbilities[ability];
            ability = SBUtils.camelize(ability);
            if (Array.isArray(abilityValue)) {
                for (let subAbility of abilityValue) {
                    let itemData = {};
                    itemData["name"] = ability + " - " + SBUtils.camelize(subAbility);
                    itemData["type"] = "feat";
                    items.push(itemData);
                    }
            } else {
                let itemData = {};
                itemData["name"] = ability;
                itemData["type"] = "feat";
                items.push(itemData);
            }
        }

        return {items: items};
    }
}

SBParserMapping.parsers = {
    "base": {
        "init": new SBSingleValueParser(["data.attributes.init.total"]),
        "senses": new SBSingleValueParser(["data.traits.senses"], false),
        "perception": new SBSkillParser()
    },
    "defense": {
        "hp": new SBSingleValueParser(["data.attributes.hp.value", "data.attributes.hp.max"]),
        "sp": new SBSingleValueParser(["data.attributes.sp.value", "data.attributes.sp.max"]),
        "rp": new SBSingleValueParser(["data.attributes.rp.value", "data.attributes.rp.max"]),
        "eac": new SBSingleValueParser(["data.attributes.eac.value"]),
        "kac": new SBSingleValueParser(["data.attributes.kac.value"]),
        "fort": new SBSingleValueParser(["data.attributes.fort.bonus"]),
        "ref": new SBSingleValueParser(["data.attributes.reflex.bonus"]),
        "will": new SBSingleValueParser(["data.attributes.will.bonus"]),
        "sr": new SBSingleValueParser(["data.traits.sr"], false),
        "dr": new SBSplitValueParser(["data.traits.damageReduction.value", "data.traits.damageReduction.negatedBy"], "/"),
        "resistances": new SBTraitParser("data.traits.dr", Object.keys(SFRPG.energyDamageTypes).map(x => x.toLowerCase())),
        "weaknesses": new SBWeaknessesParser(),
        "immunities": new SBImmunitiesParser(),
        "defensive abilities": new SBAbilityParser()
    },
    "offense": {
        "speed": new SBSingleValueParser(["data.attributes.speed.value"]),
        "melee": new SBAttackParser(true),
        "ranged": new SBAttackParser(false),
        "offensive abilities": new SBAbilityParser(),
        "* spell-like abilities": null,
        "* spells known": null
    },
    "statistics": {
        "str": new SBSingleValueParser(["data.abilities.str.mod"], false, parseInteger),
        "dex": new SBSingleValueParser(["data.abilities.dex.mod"], false, parseInteger),
        "con": new SBSingleValueParser(["data.abilities.con.mod"], false, parseInteger),
        "int": new SBSingleValueParser(["data.abilities.int.mod"], false, parseInteger),
        "wis": new SBSingleValueParser(["data.abilities.wis.mod"], false, parseInteger),
        "cha": new SBSingleValueParser(["data.abilities.cha.mod"], false, parseInteger),
        "skills": new SBSkillsParser(),
        "languages": new SBLanguagesParser("data.traits.languages", Object.keys(SFRPG.languages).map(x => x.toLowerCase())),
        "other abilities": new SBAbilityParser(),
        "gear": null,
        "* telepathy": null
    },
    "tactics": {
        "combat": null,
        "morale": null
    },
    "special abilities": null
};
