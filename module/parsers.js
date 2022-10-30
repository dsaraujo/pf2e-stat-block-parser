import { SBUtils, SBConfig } from "./utils.js";

export class SBParserMapping {}
export class SBParsing {}

/** Convenience helper, tries to parse the number to integer, if it is NaN, will return 0 instead. */
SBParsing.parseInteger = (value) => {let p = parseInt(value); return isNaN(p) ? 0 : p;};

/** Convenience helper, returns an array with the base text and the sub text if found. Format: base text (sub text) */
SBParsing.parseSubtext = (value) => { return SBUtils.parseSubtext(value); }

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

class SBCopyValueParser extends SBParserBase {
    constructor(targetField) {
        super();
        this.targetField = targetField;
    }

    async parse(key, value) {
        const parsedData = {};
        parsedData[this.targetField] = value;
        return {actorData: parsedData};
    }
}

class SBSplitValueParser extends SBParserBase {
    constructor(targetFields, delimiter, oneToOne = true) {
        super();
        this.targetFields = targetFields;
        this.delimiter = delimiter;
        this.oneToOne = oneToOne;
    }

    async parse(key, value) {
        const parsedData = {};

        const splitValue = SBUtils.splitEntries(value, {additionalDelimiters: this.delimiter, preventDefaultSplitters: true});
        if (splitValue.length != this.targetFields.length && this.oneToOne) {
            throw "Mismatching number of fields for " + key;
            //console.log(['Mismatch field count', value, this.delimiter, splitValue]);
            //throw `Mismatching number of fields for ${key}, expected ${this.targetFields.length}, found ${splitValue.length}. (Source: '${value}' with delim ${this.delimiter})`;
        }

        const max = Math.max(splitValue.length, this.targetFields.length);
        for(let i = 0; i<max; i++) {
            let targetIndex = i;
            if (i >= this.targetFields.length) {
                targetIndex = this.targetFields.length - 1;
            }

            if (i < splitValue.length) {
                if (parsedData[this.targetFields[targetIndex]]) {
                    parsedData[this.targetFields[targetIndex]] += ", " + splitValue[i];
                } else {
                    parsedData[this.targetFields[targetIndex]] = splitValue[i];
                }
            } else {
                parsedData[this.targetFields[targetIndex]] = "";
            }
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

        const npc2Version = game.system.version.localeCompare("0.16.0", undefined, { numeric: true, sensitivity: 'base' }) >= 0;

        const values = value.split(' ');

        const parsedData = {};
        parsedData["system.skills." + skillName + ".enabled"] = true;
        if (npc2Version) {
            parsedData["system.skills." + skillName + ".ranks"] = SBParsing.parseInteger(values[0]);
        } else {
            parsedData["system.skills." + skillName + ".mod"] = values[0];
        }
        return {actorData: parsedData};
    }
}

class SBSpeedParser extends SBParserBase {
    async parse(key, value) {

        const values = SBUtils.splitEntries(value);

        const speedData = {
            land: { base: 0 },
            flying: { base: 0, baseManeuverability: 0 },
            swimming: { base: 0 },
            burrowing: { base: 0 },
            climbing: { base: 0 },
            special: "",
            mainMovement: ""
        };

        for (const entry of values) {
            const unitRemoved = entry.replace("ft.", "").trim();
            const parsedSubtext = SBUtils.parseSubtext(unitRemoved);

            const speed = parsedSubtext[0].split(' ');
            if (speed.length == 1) {
                const numericSpeed = Number(speed[0]);
                if (!Number.isNaN(numericSpeed)) {
                    speedData.land.base = numericSpeed;
                    if (!speedData.mainMovement) {
                        speedData.mainMovement = "land";
                    }
                } else {
                    speedData.special = speed[0];
                }
            } else {
                const speedKey = speed[0];
                const numericSpeed = Number(speed[1]);
                if (speedKey === "fly") {
                    speedData.flying.base = numericSpeed;
                    if (SBUtils.stringContains(entry, "clumsy", false)) {
                        speedData.flying.baseManeuverability = -1;
                    } else if (SBUtils.stringContains(entry, "perfect", false)) {
                        speedData.flying.baseManeuverability = 1;
                    }

                    if (!speedData.mainMovement) {
                        speedData.mainMovement = "flying";
                    }
                } else if (speedKey === "swim") {
                    speedData.swimming.base = numericSpeed;
                    
                    if (!speedData.mainMovement) {
                        speedData.mainMovement = "swimming";
                    }
                } else if (speedKey === "burrow") {
                    speedData.burrowing.base = numericSpeed;
                    
                    if (!speedData.mainMovement) {
                        speedData.mainMovement = "burrowing";
                    }
                } else if (speedKey === "climb") {
                    speedData.climbing.base = numericSpeed;
                    
                    if (!speedData.mainMovement) {
                        speedData.mainMovement = "climbing";
                    }
                } else {
                    if (speedData.special) {
                        speedData.special += "; ";
                    }
                    speedData.special += entry;
                    
                    if (!speedData.mainMovement) {
                        speedData.mainMovement = "special";
                    }
                }
            }
        }

        const parsedData = {};
        parsedData["system.attributes.speed"] = speedData;
        return {actorData: parsedData};
    }
}

class SBSkillsParser extends SBParserBase {
    async parse(key, value) {
        let parsedData = {};
        let skillParser = new SBSkillParser();

        let skillPairs = SBUtils.splitEntries(value);
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
    constructor(bIsMelee, bIsMulti) {
        super();
        this.bIsMelee = bIsMelee;
        this.bIsMulti = bIsMulti;
    }

    async parse(key, value) {
        let items = [];
        let errors = [];
        
        let prefix = "";
        let allAttacks = SBUtils.splitEntries(value);
        for (let attack of allAttacks) {
            try {
                let attackInput = attack;
                if (prefix) {
                    attackInput = prefix + " or " + attackInput;
                }

                let itemData = await this.parseAttack(attackInput.trim(), this.bIsMelee);
                if (itemData !== null) {
                    items.push(itemData);
                    prefix = "";
                } else {
                    prefix = attack.trim();
                }
            } catch (err) {
                errors.push([key + " -> " + attack.trim(), err]);
            }
        }

        return {items: items, errors: errors};
    }
  
    /** Will parse an attack using the attack format: attack name +attackRoll (damageRoll damageType ; critical effect) */
    async parseAttack(attack, bIsMeleeAttack) {
        const damageVersion = game.system.version.localeCompare("0.13.0", undefined, { numeric: true, sensitivity: 'base' }) >= 0;

        //SBUtils.log("Parsing attack: " + attack);
        const attackInfo = SBParsing.parseSubtext(attack);

        const mainBlock = attackInfo[0].split(/(.*)\s([\+|-][\s]*\d*)/i);
        if (mainBlock.length < 2) {
            return null;
        }

        const attackName = SBUtils.camelize(mainBlock[1]);
        //SBUtils.log("Parsed attack: " + JSON.stringify(attackInfo));
        const attackModifier = mainBlock[2];
        let additionalName = "";
        
        let attackDamageRoll = undefined;
        let attackDamageType = undefined;
        let criticalDamage = "";

        try {
            const damageString = attackInfo[1].split(";");
            const damageBlock = damageString[0].split("plus");
            const normalDamage = damageBlock[0].trim();
            if (damageString.length > 1) {
                criticalDamage = damageString[1];
            }

            const attackDamageData = normalDamage.split(/(\d+d\d+)\s*(\+\s?\S*\s*)?(\S*){1}/i);
            attackDamageRoll = attackDamageData[1].trim();
            if (attackDamageData[2]) {
                attackDamageRoll += " " + attackDamageData[2].trim();
            }
            attackDamageType = attackDamageData[3].toLowerCase();
            if (attackDamageData[4]) {
                attackDamageType += attackDamageData[4].toLowerCase();
            }

            if (damageVersion) {
                const rawTypes = SBUtils.splitEntries(attackDamageType, {additionalEntrySplitters: ["&"]});
                attackDamageType = {};
                for (const rawType of rawTypes) {
                    const parsedType = SBConfig.weaponDamageTypeNew[rawType.trim()];
                    attackDamageType = mergeObject(attackDamageType, parsedType);
                }
            } else {
                if (SBConfig.weaponDamageTypes[attackDamageType]) {
                    attackDamageType = SBConfig.weaponDamageTypes[attackDamageType];
                } else {
                    attackDamageType = "slashing";
                }
            }

            if (damageBlock.length > 1) {
                additionalName = " (plus " + SBUtils.camelize(damageBlock[1].trim()) + ")";
            }
        } catch (err) {
            attackDamageRoll = undefined;
            attackDamageType = undefined;
        }
        
        let matchingItem = await SBUtils.fuzzyFindItemAsync(attackName);
        if (!matchingItem) {
            matchingItem = await SBUtils.fuzzyFindSpellAsync(attackName);
            if (!matchingItem) {
                matchingItem = await SBUtils.fuzzyFindCompendiumAsync("Universal Creature Rules", attackName);
            }
        }

        //SBUtils.log("(W) > " + attackName + " found: " + JSON.stringify(matchingItem));

        let itemData = matchingItem != null ? matchingItem : {"name": attackName, system: {}};

        if (this.bIsMulti) {
            itemData["name"] = "[MultiATK] " + itemData["name"];
        }
        if (additionalName) {
            itemData["name"] += additionalName;
        }

        if (itemData["_id"]) {
            itemData["sourceId"] = itemData["_id"];
            delete itemData["_id"];
        }
        if (!itemData.type) {
            itemData["type"] = "weapon";
        }
        if (!itemData.actionType) {
            itemData = mergeObject(itemData, {system: {actionType: bIsMeleeAttack ? "mwak" : "rwak"}});
        }
        if (!itemData.weaponType) {
            itemData = mergeObject(itemData, {system: {weaponType: bIsMeleeAttack ? "basicM" : "smallA"}});
        }
        if (!itemData.quantity) {
            itemData = mergeObject(itemData, {system: {quantity: 1}});
        }

        itemData = mergeObject(itemData, {system: {ability: ""}});
        itemData = mergeObject(itemData, {system: {attackBonus: SBParsing.parseInteger(attackModifier)}});
        
        if (attackDamageRoll) {
            if (damageVersion) {
                const damagePart = {
                    formula: attackDamageRoll,
                    types: attackDamageType,
                    operator: "and"
                };
                itemData = mergeObject(itemData, {system: {damage: {parts: [damagePart]}}});
            } else {
                itemData = mergeObject(itemData, {system: {damage: {parts: [[attackDamageRoll, attackDamageType]]}}});
            }
        }

        if (criticalDamage) {
            criticalDamage = criticalDamage.trim();

            // First remove the crit(ical) text
            let effectOnly = criticalDamage;
            if (SBUtils.stringStartsWith(criticalDamage, "critical", false)) {
                effectOnly = criticalDamage.substr(9);
            } else if (SBUtils.stringStartsWith(criticalDamage, "crit", false)) {
                effectOnly = criticalDamage.substr(5);
            }

            let criticalDamageEffect = effectOnly;
            let criticalDamageRoll = "";

            // Disabling critical damage roll parsing. Apparently isn't used anywhere anyway.
            // Leaving it here for myself, in case I ever need to re-enable it and I'm like, wtf was I doing here again?
            /*if (!SBUtils.stringContains(effectOnly, "dc", false)) {
                const criticalDamageRegex = effectOnly.split(/(.*)\s(.*)/i);
                criticalDamageEffect = criticalDamageRegex[1];
                criticalDamageRoll = criticalDamageRegex[2];
            }*/

            const criticalObject = {
                effect: "",
                parts: []
            };

            if (criticalDamageEffect) {
                criticalObject.effect = SBUtils.camelize(criticalDamageEffect);
            }
            if (criticalDamageRoll && attackDamageType) {
                if (damageVersion) {
                    const damagePart = {
                        formula: criticalDamageRoll,
                        types: attackDamageType,
                        operator: "and"
                    };
                    criticalObject.parts = [damagePart];
                } else {
                    criticalObject.parts = [[criticalDamageRoll, attackDamageType]];
                }
            }

            itemData = mergeObject(itemData, {system: {critical: criticalObject}});
        }

        if (!itemData["name"]) {
            throw "No name for attack.";
        }
        
        return itemData;
    }
}

class SBTraitParser extends SBParserBase {
    constructor(traitField, supportedValues, dontSplitTraits = false) {
        super();
        this.traitField = traitField;
        this.supportedValues = supportedValues;
        this.dontSplitTraits = dontSplitTraits;
    }

    async parse(key, value) {
        const parsedValues = {"value": [], "custom": ""};

        const values = SBUtils.splitEntries(value);
        for (const traitValue of values) {
            let splitTrait = [];
            if (this.dontSplitTraits) {
                splitTrait.push(traitValue);
            } else {
                splitTrait = traitValue.trim().toLowerCase().split(' ');
            }
            
            const traitName = splitTrait[0]
            const traitModifier = splitTrait.length > 1 ? splitTrait[1] : null;

            if (this.supportedValues.includes(traitName)) {
                if (traitModifier != null) {
                    const trait = {[traitName]: traitModifier};
                    parsedValues.value.push(trait);
                } else {
                    parsedValues.value.push(traitName);
                }
            } else {
                if (parsedValues.custom.length > 0) {
                    parsedValues.custom += "; ";
                }
                parsedValues.custom += SBUtils.camelize(traitName);
            }
        }

        const actorData = {};
        actorData[this.traitField] = parsedValues;
        return {actorData: actorData};
    }
}

class SBLanguagesParser extends SBTraitParser {
    constructor(traitField, supportedValues) {
        super(traitField, supportedValues, true);
    }

    async parse(key, value) {
        if (value) {
            value = value.toLowerCase().replace("lashunta", "castrovelian");
            return super.parse(key, value);
        } else {
            return {};
        }
    }
}

class SBWeaknessesParser extends SBParserBase {
    async parse(key, value) {
        const recognizedWeaknesses = Object.keys(CONFIG["SFRPG"].damageTypes).map(x => x.toLowerCase());

        const knownWeaknesses = [];
        let customWeaknesses = "";

        const weaknesses = SBUtils.splitEntries(value);
        for (const rawWeakness of weaknesses) {
            const parsedWeakness = rawWeakness.split(/vulnerab.*\sto\s(.*)/i);

            let weakness = parsedWeakness[0];
            if (!weakness && parsedWeakness.length > 1) {
                weakness = parsedWeakness[1].trim().toLowerCase();
            }
            
            if (recognizedWeaknesses.includes(weakness)) {
                knownWeaknesses.push(weakness);
            } else {
                if (customWeaknesses) {
                    customWeaknesses += "; ";
                }
                customWeaknesses += SBUtils.camelize(rawWeakness);
            }
        }

        const parsedData = {
            data: {
                traits: {
                    dv: {"value": knownWeaknesses, "custom": customWeaknesses}
                }
            }
        };
        return {actorData: parsedData};
    }
}

class SBImmunitiesParser extends SBParserBase {
    async parse(key, value) {
        let recognizedConditionImmunities = Object.keys(CONFIG["SFRPG"].conditionTypes).map(x => x.toLowerCase());
        let recognizedDamageImmunities = Object.keys(CONFIG["SFRPG"].damageTypes).map(x => x.toLowerCase());

        let knownConditionImmunities = [];
        let knownDamageImmunities = [];
        let customImmunities = "";

        // Replace known cases
        value = value.toLowerCase()
            .replace("stunning", "stunned")
            .replace("sleep", "asleep");

        let rawImmunities = SBUtils.splitEntries(value);
        for (let rawImmunity of rawImmunities) {
            let parsedImmunity = rawImmunity.trim();
            if (recognizedConditionImmunities.includes(parsedImmunity)) {
                knownConditionImmunities.push(parsedImmunity);
            } else if (recognizedDamageImmunities.includes(parsedImmunity)) {
                knownDamageImmunities.push(parsedImmunity);
            } else {
                if (customImmunities) {
                    customImmunities += "; ";
                }
                customImmunities += SBUtils.camelize(parsedImmunity);
            }
        }

        const parsedData = {
            system: {
                traits: {
                    ci: {"value": knownConditionImmunities, "custom": customImmunities},
                    di: {"value": knownDamageImmunities, "custom": customImmunities}
                }
            }
        };

        return {actorData: parsedData};
    }
}

class SBAbilityParser extends SBParserBase {
    constructor(additionalNameOutput) {
        super();

        this.additionalNameOutput = additionalNameOutput;
    }

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

        parsedAbilities = SBUtils.splitEntries(value);

        //SBUtils.log("Abilities: " + JSON.stringify(parsedAbilities));
        for (let ability of parsedAbilities) {
            if (!ability) {
                continue;
            }

            let abilityValue = SBParsing.parseSubtext(ability);
            ability = SBUtils.camelize(abilityValue[0]);

            let existingItemData = await SBUtils.fuzzyFindCompendiumAsync("Class Features", ability);
            if (!existingItemData) {
                existingItemData = await SBUtils.fuzzyFindCompendiumAsync("Feats", ability);
                if (!existingItemData) {
                    existingItemData = await SBUtils.fuzzyFindCompendiumAsync("Universal Creature Rules", ability);
                }
            }

            if (abilityValue.length > 1) {
                let itemData = existingItemData || {};
                if (!("name" in itemData)) {
                    itemData["name"] = ability + " - " + SBUtils.camelize(abilityValue[1]);
                }
                if (!("type" in itemData)) {
                    itemData["type"] = "feat";
                }

                items.push(itemData);
            } else {
                let itemData = existingItemData || {};
                if (!("name" in itemData)) {
                    itemData["name"] = ability;
                }
                if (!("type" in itemData)) {
                    itemData["type"] = "feat";
                }

                items.push(itemData);
            }
        }

        let actorData = {};
        if (this.additionalNameOutput) {
            let auraNames = items.map(x => SBParsing.parseSubtext(x.name)[0]);
            actorData[this.additionalNameOutput] = auraNames.join(', ');
        }
        return {actorData: actorData, items: items};
    }
}

class SBGearParser extends SBParserBase {
    async parse(key, value) {
        let items = [];
        let errors = [];

        let itemsToAdd = [];

        let splitValues = SBUtils.splitEntries(value);
        for (let rawItem of splitValues) {
            try {
                let withItems = rawItem.trim().split("with");
                let baseItem = withItems[0].trim();
                if (baseItem.endsWith("(")) {
                    baseItem = baseItem.substring(0, baseItem.length - 1).trim();
                }

                let baseItemElements = SBParsing.parseSubtext(baseItem);
                let baseItemAmountName = baseItemElements[0].split(/(\d*)?[\s]?(.*)/i);
                let baseItemAmount = baseItemAmountName[1] ? baseItemAmountName[1] : 1;
                let baseItemName = baseItemAmountName[2];

                if (baseItemElements.length > 1 && !Number.isNaN(Number(baseItemElements[1])) && !baseItemAmountName[1]) {
                    baseItemAmount = Number(baseItemElements[1]);
                }
                
                //SBUtils.log("Parsed gear item: " + baseItemAmount + "x " + baseItemName);
                itemsToAdd.push({item: baseItemName, amount: baseItemAmount, subText: baseItemElements[1], source: baseItem, subText: baseItemElements[1]});
                
                if (withItems.length > 1) {
                    let withItem = withItems[1].trim();

                    let withItemElements = SBParsing.parseSubtext(withItem);
                    let withItemAmountName = withItemElements[0].split(/(\d*)?[\s]?(.*)/i);
                    let withItemAmount = withItemAmountName[1] ? withItemAmountName[1] : 1;
                    let withItemName = withItemAmountName[2];

                    if (withItemElements.length > 1 && !Number.isNaN(Number(withItemElements[1])) && !withItemAmountName[1]) {
                        withItemAmount = Number(withItemElements[1]);
                    }

                    //SBUtils.log("Parsed gear item: " + withItemAmount + "x " + withItemName);
                    itemsToAdd.push({item: withItemName, amount: withItemAmount, subText: withItemElements[1], source: withItem, subText: withItemElements[1]});
                }
            } catch (err) {
                errors.push([`${key} -> ${rawItem}`, err]);
            }
        }

        for (const itemToAdd of itemsToAdd) {
            try {
                let itemData = await SBUtils.fuzzyFindItemAsync(itemToAdd.item);
                //SBUtils.log("> " + itemToAdd.item + " found: " + JSON.stringify(itemData));
                if (!itemData) {
                    itemData = {};
                    itemData["name"] = SBUtils.camelize(itemToAdd.source ? itemToAdd.source : itemToAdd.item);
                } else {
                    itemData["source"] = { compendium: "Equipment", id: itemData["_id"] };
                    delete itemData["_id"];
                }
                itemData = mergeObject(itemData, {data: {quantity: itemToAdd.amount}});
                if (!itemData["type"]) {
                    itemData["type"] = "goods";
                }

                if (SBUtils.stringContains(itemData["name"], "credstick", false)) {
                    if (itemToAdd.subText) {
                        let textSplit = itemToAdd.subText.split(' ');
                        itemData = mergeObject(itemData, {data: {price: Number(textSplit[0].trim())}});
                        itemData["name"] = `Credstick (${itemData.system.price} credits)`;
                    }
                }

                items.push(itemData);
            } catch (err) {
                errors.push([`${key} -> ${itemToAdd.item}`, err]);
            }
        }


        return {gear: items, errors: errors};
    }
}

class SBSpellLikeParser extends SBParserBase {
    async parse(key, value) {
        const spells = [];
        const errors = [];

        // First, split up the spell blocks by level
        const splitSpellblocks = [];
        const spellsSection = value.substring(value.indexOf(')') + 1).trim();
        const regex = /(((\d*)\/day)|at will|atwill|constant)\s*[-—]\s*(.*)/gim;
        const block = spellsSection.split(regex);
        let spellHeader = block[1];
        let currentText = block[4];
        while(currentText) {
            let nextSet = currentText.split(regex);
            if (nextSet.length > 1) {
                let spellData = nextSet[0].trim();
                if (spellHeader && spellData) {
                    let spellObject = {level: spellHeader, spells: spellData};
                    splitSpellblocks.push(spellObject);
                }
    
                spellHeader = nextSet[1].trim();
                currentText = nextSet[4];
            } else {
                if (spellHeader) {
                    let spellObject = {level: spellHeader, spells: currentText.trim()};
                    splitSpellblocks.push(spellObject);
                }
                currentText = null;
            }
        }

        //SBUtils.log("Parsed result: " + JSON.stringify(splitSpellblocks));

        // Next up, for each spell level, split up into spells, which we can pull from the compendium using fuzzy search.
        for (let spellBlock of splitSpellblocks) {
            let splitSpells = SBUtils.splitEntries(spellBlock.spells);
            for (let rawSpell of splitSpells) {
                let parsedSpellData = SBParsing.parseSubtext(rawSpell);
                let foundSpell = await SBUtils.fuzzyFindSpellAsync(parsedSpellData[0]);
                
                let spellActivation = spellBlock.level.split('/');
                if (foundSpell) {
                    //SBUtils.log(">> Known spell: " + rawSpell);
                    foundSpell["sourceId"] = foundSpell["_id"];
                    foundSpell.system["name"] = SBUtils.camelize(rawSpell);
                    foundSpell = mergeObject(foundSpell, {system: {preparation: { prepared: true, mode: "innate" }}});

                    if (["atwill", "at will", "constant"].includes(spellBlock.level.toLowerCase())) {
                        foundSpell.system.preparation.mode = "always";
                        foundSpell["name"] += " (" + SBUtils.camelize(spellBlock.level) + ")";
                    }

                    if (spellActivation.length == 2) {
                        if (!foundSpell.system.activation) {
                            foundSpell = mergeObject(foundSpell, {system: {activation: { cost: 0, type: "none" }}});
                        } else if (!foundSpell.system.activation.type) {
                            foundSpell.system.activation.type = "none";
                        }

                        foundSpell = mergeObject(foundSpell, {system: {uses: {
                            value: Number(spellActivation[0]),
                            max: Number(spellActivation[0]),
                            per: "day"
                        }}});
                    }

                    spells.push(foundSpell);
                } else {
                    //SBUtils.log(">> Unknown spell: " + rawSpell);
                    foundSpell = {
                        name: SBUtils.camelize(rawSpell),
                        type: "spell",
                        system: {
                            level: SBParsing.parseInteger(spellBlock.level[0]),
                            preparation: { prepared: true, mode: "innate" }
                        }
                    };

                    if (["atwill", "at will", "constant"].includes(spellBlock.level.toLowerCase())) {
                        foundSpell.system.preparation = { prepared: true, mode: "always" };
                        foundSpell.system.name += " (" + SBUtils.camelize(spellBlock.level) + ")";
                    }

                    if (spellActivation.length == 2) {
                        foundSpell.system.activation = {
                            cost: 0,
                            type: "none"
                        };

                        foundSpell.system.uses = {
                            value: Number(spellActivation[0]),
                            max: Number(spellActivation[0]),
                            per: "day"
                        };
                    }

                    spells.push(foundSpell);
                }
            }
        }

        return {spells: spells, errors: errors};
    }
}

class SBSpellsParser extends SBParserBase {
    async parse(key, value) {
        const spells = [];
        const errors = [];

        // First, split up the spell blocks by level
        const splitSpellblocks = [];
        const spellsSection = value.substring(value.indexOf(')') + 1).trim();
        const regex = /([0|1st|2nd|3rd|4th|5th|6th|1|2|3|4|5|6]*)\s\((\S*|at will)?\)\s*[-—]{1}\s*(.*)/gim;
        const block = spellsSection.split(regex);
        let spellHeader = block[1];
        let usage = block[2];
        let currentText = block[3];
        while(currentText) {
            const nextSet = currentText.split(regex);
            if (nextSet.length > 1) {
                const spellData = nextSet[0].trim();
                if (spellHeader && spellData) {
                    const spellObject = {
                        level: spellHeader,
                        usage: usage,
                        spells: spellData
                    };
                    splitSpellblocks.push(spellObject);
                }
    
                spellHeader = nextSet[1].trim();
                usage = nextSet[2].trim();
                currentText = nextSet[3];
            } else {
                if (spellHeader) {
                    const spellObject = {
                        level: spellHeader,
                        usage: usage,
                        spells: currentText.trim()
                    };
                    splitSpellblocks.push(spellObject);
                }
                currentText = null;
            }
        }

        //SBUtils.log("Parsed result: " + JSON.stringify(splitSpellblocks));

        const actorData = {
            system: {
                spells: {
                    spell1: {},
                    spell2: {},
                    spell3: {},
                    spell4: {},
                    spell5: {},
                    spell6: {}
                }
            }
        };

        // Next up, for each spell level, split up into spells, which we can pull from the compendium using fuzzy search.
        for (const spellBlock of splitSpellblocks) {
            const splitSpells = SBUtils.splitEntries(spellBlock.spells);

            const spellblockLevel = SBParsing.parseInteger(spellBlock.level);

            const isAtWillSpell = SBUtils.stringContains(spellBlock.usage, "at will", false);
            if (spellBlock.usage && !isAtWillSpell) {
                const trimmedUsage = spellBlock.usage.trim();
                const parsedUsage = trimmedUsage.split(/(\d*)/i);
                
                const spellKey = `spell${spellblockLevel}`;
                const spellsData = {
                    [spellKey]: {
                        value: parsedUsage[1],
                        max: parsedUsage[1]
                    }
                };

                actorData.system.spells = mergeObject(actorData.system.spells, spellsData);
            }
            
            for (const rawSpell of splitSpells) {
                const parsedSpellData = SBParsing.parseSubtext(rawSpell);
                const foundSpell = await SBUtils.fuzzyFindSpellAsync(parsedSpellData[0]);

                let dc = "";
                if (parsedSpellData.length > 1) {
                    if (SBUtils.stringContains(parsedSpellData[1], "DC", false)) {
                        const dcString = parsedSpellData[1];
                        const dcTokens = dcString.split(' ');
                        dc = SBParsing.parseInteger(dcTokens[1]);
                    }
                }

                const preparation = { prepared: true, mode: isAtWillSpell ? "always" : null };

                if (foundSpell) {
                    //SBUtils.log(">> Known spell: " + rawSpell);
                    foundSpell["sourceId"] = foundSpell["_id"];
                    foundSpell["name"] = SBUtils.camelize(rawSpell);
                    if (isAtWillSpell) {
                        foundSpell["name"] += " (At will)";
                    }

                    foundSpell.system.preparation = preparation;
                    foundSpell.system.level = spellblockLevel;
                    if (dc) {
                        foundSpell.system = mergeObject(foundSpell.system, {save: { dc: dc}});
                    }

                    spells.push(foundSpell);
                } else {
                    //SBUtils.log(">> Unknown spell: " + rawSpell);
                    foundSpell = {};
                    foundSpell["name"] = SBUtils.camelize(rawSpell);
                    if (isAtWillSpell) {
                        foundSpell["name"] += " (At will)";
                    }

                    foundSpell["type"] = "spell";
                    foundSpell.system.preparation = preparation;
                    foundSpell.system.level = spellblockLevel;
                    if (dc) {
                        foundSpell.system = mergeObject(foundSpell.system, {save: { dc: dc}});
                    }

                    spells.push(foundSpell);
                }
            }
        }

        return {actorData: actorData, spells: spells, errors: errors};
    }
}

class SBDescriptionParser extends SBCategoryParserBase {
    constructor(category, bIsSecret = true) {
        super();
        this.category = category;
        this.bIsSecret = bIsSecret;
    }

    async parse(key, value) {
        if (key === "description") {
            while (value && value.length > 0 && value[0] === "") {
                value.shift();
            }
            value = value.join('<br/><br/>');
        }
        return {characterDescriptions: [{category: SBUtils.camelize(this.category), title: SBUtils.camelize(key), body: value, bIsSecret: this.bIsSecret}]};
    }
}

class SBTelepathyParser extends SBParserBase {
    async parse(key, value) {
        let actorData = {};
        actorData["system.traits.languages.custom"] = SBUtils.camelize(key) + " " + value;
        return {actorData: actorData};
    }
}

class SBSpecialAbilitiesParser extends SBCategoryParserBase {
    async parse(key, value) {
        const errors = [];
        const abilityDescriptions = [];

        // Iterate through the special abilities
        let currentAbilityKey = "";
        let currentAbilityText = "";
        for (const line of value) {
            const matched = line.match(/(.*\s\([Ex|Su|Sp]*\))\s(.*)/i);
            if (matched && matched.length === 3) {
                if (currentAbilityKey && currentAbilityText) {
                    const newAbility = {name: currentAbilityKey, description: currentAbilityText};
                    abilityDescriptions.push(newAbility);
                    currentAbilityKey = "";
                    currentAbilityText = "";
                }

                currentAbilityKey = matched[1].trim();
                currentAbilityText = matched[2].trim();
            } else {
                currentAbilityText += " " + line.trim();
            }
        }

        if (currentAbilityKey && currentAbilityText) {
            const newAbility = {name: currentAbilityKey, description: currentAbilityText};
            abilityDescriptions.push(newAbility);
        }

        return {abilityDescriptions: abilityDescriptions, errors: errors};
    }
}

export function initParsers() {
    if (SBParserMapping.parsers) {
        return;
    }

    const npc2Version = game.system.version.localeCompare("0.16.0", undefined, { numeric: true, sensitivity: 'base' }) >= 0;

    SBParserMapping.parsers = {
        "base": {
            "init": npc2Version ? new SBSingleValueParser(["system.attributes.init.value"], true, SBParsing.parseInteger) : new SBSingleValueParser(["system.attributes.init.total"]),
            "senses": new SBSingleValueParser(["system.traits.senses"], false),
            "perception": new SBSkillParser(),
            "aura": new SBAbilityParser("system.details.aura")
        },
        "defense": {
            "hp": new SBSingleValueParser(["system.attributes.hp.value", "system.attributes.hp.max"]),
            "sp": new SBSingleValueParser(["system.attributes.sp.value", "system.attributes.sp.max"]),
            "rp": new SBSingleValueParser(["system.attributes.rp.value", "system.attributes.rp.max"]),
            "eac": npc2Version ? new SBSingleValueParser(["system.attributes.eac.base"], true, SBParsing.parseInteger) : new SBSingleValueParser(["system.attributes.eac.value"]),
            "kac": npc2Version ? new SBSingleValueParser(["system.attributes.kac.base"], true, SBParsing.parseInteger) : new SBSingleValueParser(["system.attributes.kac.value"]),
            "fort": npc2Version ? new SBSingleValueParser(["system.attributes.fort.base"], true, SBParsing.parseInteger) : new SBSingleValueParser(["system.attributes.fort.bonus"]),
            "ref": npc2Version ? new SBSingleValueParser(["system.attributes.reflex.base"], true, SBParsing.parseInteger) : new SBSingleValueParser(["system.attributes.reflex.bonus"]),
            "will": npc2Version ? new SBSingleValueParser(["system.attributes.will.base"], true, SBParsing.parseInteger) : new SBSingleValueParser(["system.attributes.will.bonus"]),
            "sr": new SBSingleValueParser(["system.traits.sr"], false),
            "dr": new SBSplitValueParser(["system.traits.damageReduction.value", "system.traits.damageReduction.negatedBy"], "/", false),
            "resistances": new SBTraitParser("system.traits.dr", Object.keys(CONFIG["SFRPG"].energyDamageTypes).map(x => x.toLowerCase())),
            "resist": new SBTraitParser("system.traits.dr", Object.keys(CONFIG["SFRPG"].energyDamageTypes).map(x => x.toLowerCase())), // Hero Lab support
            "weaknesses": new SBWeaknessesParser(),
            "immunities": new SBImmunitiesParser(),
            "defensive abilities": new SBAbilityParser()
        },
        "offense": {
            "speed": new SBSpeedParser(),
            "melee": new SBAttackParser(true),
            "ranged": new SBAttackParser(false),
            "multiattack": new SBAttackParser(true, true),
            "offensive abilities": new SBAbilityParser(),
            "spell-like abilities": new SBSpellLikeParser(), // Hero Lab support
            "* spell-like abilities": new SBSpellLikeParser(),
            "* spells known": new SBSpellsParser(),
            "connection": new SBDescriptionParser('offense'),
            "space": new SBSingleValueParser(["system.attributes.space"], false),
            "reach": new SBSingleValueParser(["system.attributes.reach"], false)
        },
        "statistics": {
            "str": npc2Version ? new SBSingleValueParser(["system.abilities.str.base"], false, SBParsing.parseInteger) : new SBSingleValueParser(["system.abilities.str.mod"], false, SBParsing.parseInteger),
            "dex": npc2Version ? new SBSingleValueParser(["system.abilities.dex.base"], false, SBParsing.parseInteger) : new SBSingleValueParser(["system.abilities.dex.mod"], false, SBParsing.parseInteger),
            "con": npc2Version ? new SBSingleValueParser(["system.abilities.con.base"], false, SBParsing.parseInteger) : new SBSingleValueParser(["system.abilities.con.mod"], false, SBParsing.parseInteger),
            "int": npc2Version ? new SBSingleValueParser(["system.abilities.int.base"], false, SBParsing.parseInteger) : new SBSingleValueParser(["system.abilities.int.mod"], false, SBParsing.parseInteger),
            "wis": npc2Version ? new SBSingleValueParser(["system.abilities.wis.base"], false, SBParsing.parseInteger) : new SBSingleValueParser(["system.abilities.wis.mod"], false, SBParsing.parseInteger),
            "cha": npc2Version ? new SBSingleValueParser(["system.abilities.cha.base"], false, SBParsing.parseInteger) : new SBSingleValueParser(["system.abilities.cha.mod"], false, SBParsing.parseInteger),
            "skills": new SBSkillsParser(),
            "languages": new SBLanguagesParser("system.traits.languages", Object.keys(CONFIG["SFRPG"].languages).map(x => x.toLowerCase())),
            "other abilities": new SBAbilityParser(),
            "noncombat abilities": new SBAbilityParser(),
            "feats": new SBAbilityParser(),
            "gear": new SBGearParser(),
            "other gear": new SBGearParser(), // Hero Lab support
            "* telepathy": new SBTelepathyParser()
        },
        "tactics": {
            "before combat": new SBDescriptionParser('tactics'),
            "during combat": new SBDescriptionParser('tactics'),
            "morale": new SBDescriptionParser('tactics')
        },
        "special abilities": new SBSpecialAbilitiesParser(),
        "ecology": {
            "environment": new SBCopyValueParser("system.details.environment"),
            "organization": new SBCopyValueParser("system.details.organization")
        },
        "description": new SBDescriptionParser('description', false),
        "hero lab": null // Hero Lab support
    };
}
