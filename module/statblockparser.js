import { SFSBPUtils } from "./utils.js";

export const SFSBP = {};
SFSBP.weaponDamageTypes = {
    "a": "acid",
    "a & b": "acid+bludgeoning",
    "a & f": "acid+fire",
    "a & p": "acid+piercing",
    "a & s": "acid+slashing",
    "c": "cold",
    "c & p": "cold+piercing",
    "e": "electricity",
    "e & f": "electricity+fire",
    "e & p": "electricity+piercing",
    "e & s": "electricity+slashing",
    "f": "fire",
    "f & p": "fire+piercing",
    "f & s": "fire+slashing",
    "so": "sonic",
    "b": "bludgeoning",
    "b & c": "bludgeoning+cold",
    "b & e": "bludgeoning+electricity",
    "b & f": "bludgeoning+fire",
    "b & so": "bludgeoning+sonic",
    "p": "piercing",
    "p & s": "piercing+sonic",
    "s": "slashing",
    "s & p": "slashing+piercing",
    "s & so": "slashing+sonic"
};

SFSBP.statMapping = {
    "hp": ["data.attributes.hp.value", "data.attributes.hp.max"],
    "init": ["data.attributes.init.total"],
    "eac": ["data.attributes.eac.value"],
    "kac": ["data.attributes.kac.value"],
    "fort": ["data.attributes.fort.bonus"],
    "ref": ["data.attributes.reflex.bonus"],
    "will": ["data.attributes.will.bonus"],
    "speed": ["data.attributes.speed.value"],
    "str": ["data.abilities.str.mod"],
    "dex": ["data.abilities.dex.mod"],
    "con": ["data.abilities.con.mod"],
    "int": ["data.abilities.int.mod"],
    "wis": ["data.abilities.wis.mod"],
    "cha": ["data.abilities.cha.mod"]
};

export class SFStatblockParser {
    /* Will try to find an item that matches all the terms, will return the first item it finds that does. */
    async fuzzyFindItem(statBlockItemName) {
        //SFSBPUtils.log("Fuzzy search for item named: " + statBlockItemName);
        let equipment = game.packs.find(element => element.title.includes("Equipment"));
        if (equipment == undefined) {
            SFSBPUtils.log("Could not find equipment compendium.");
            return null;
        }
        
        await equipment.getIndex();
        
        let terms = statBlockItemName.toLowerCase().split(' ');
        let itemWeWant = null;
        for (let item of equipment.index) {
            let itemName = item.name.toLowerCase();
            
            let bAllTermsPresent = true;
            for (let term of terms) {
                if (!itemName.includes(term)) {
                    bAllTermsPresent = false;
                    break;
                }
            }

            if (!bAllTermsPresent) {
                continue;
            }

            itemWeWant = item;
            break;
        }

        if (itemWeWant != undefined) {
            delete itemWeWant["_id"];
            //SFSBPUtils.log("Item " + JSON.stringify(itemWeWant));
        } else {
            //SFSBPUtils.log("Item not found.");
        }
        return itemWeWant;
    }
  
    async parseAttack(attack, bIsMeleeAttack) {
        let attackInfo = attack.split(/([a-zA-Z\s]*)\s([\+|-]\d*)\s\((.*)\)/);
                    
        let attackName = SFSBPUtils.camelize(attackInfo[1]);
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
        if (SFSBP.weaponDamageTypes[attackDamageType] != undefined) {
            attackDamageType = SFSBP.weaponDamageTypes[attackDamageType];
        } else {
            attackDamageType = "slashing";
        }
        
        let matchingItem = await this.fuzzyFindItem(attackName);

        let itemData = matchingItem != null ? matchingItem : {"name": attackName};
        itemData["type"] = "weapon";
        itemData["data.actionType"] = bIsMeleeAttack ? "mwak" : "rwak";
        itemData["data.weaponType"] = bIsMeleeAttack ? "basicM" : "smallA";
        itemData["data.ability"] = bIsMeleeAttack ? "str" : "dex";
        itemData["data.attackBonus"] = attackModifier;
        itemData["data.damage"] = {parts: [[attackDamageRoll, attackDamageType]]};
        itemData["data.critical"] = {"effect": "", "parts": [["1d4", "burn"]]};
        itemData["data.chatFlavor"] = criticalDamage;
        
        return itemData;
    }
  
    async parseStatblock(actorData, statBlockText) {
        if (actorData == null || statBlockText == null || statBlockText.length == 0) {
            return {success: false};
        }
        
        actorData["data.attributes.sp.max"] = 0;
        actorData["data.attributes.rp.max"] = 0;

        let tokens = [];
        let items = [];
        
        // Start parsing text
        let splitNewlines = statBlockText.split(/[\r\n]+/);
        
        let recognizedKeywords = ["HP", "Init", "Perception", "EAC", "KAC", "Fort", "Ref", "Will", "Speed",
            "Str", "Dex", "Con", "Int", "Wis", "Cha", "Skills", "Senses", "SR", "DR", "Languages", "Melee", "Ranged"];
        recognizedKeywords = recognizedKeywords.map(x => x.toLowerCase());
        
        // Parse out name, certain key lines that we don't want to split by ;, and all elements ; deliminated
        splitNewlines.forEach(element => {
            let nameBlock = element.split(/(.*)\sCR\s(\d*\/?\d*)/i);
            if (nameBlock[0].length == 0) {
                //SFSBPUtils.log('Name: ' + nameBlock[1] + ', CR: ' + nameBlock[3] + '.');
                
                let CR = 1;
                let crs = { "1/8" : 0.125, "1/6" : 1/6, "1/4": 0.25, "1/3": 1/3, "1/2": 0.5 };

                if (crs[nameBlock[3]] != null)
                  CR = crs[nameBlock[3]];
                else
                  CR = parseFloat(nameBlock[3]);
                
                actorData['name'] = SFSBPUtils.camelize(nameBlock[1].toLowerCase());
                actorData['data.details.cr'] = CR;
                return;
            }
            
            if (SFSBPUtils.stringContains(element, "melee", false) || SFSBPUtils.stringContains(element, "ranged", false)) {
                tokens.push(element);
                return;
            }
            
            let sizeBlock = element.split(/(.*)\s(Fine|Diminutive|Tiny|Small|Medium|Large|Huge|Gargantuan|Colossal)\s(.*)/i);
            if (sizeBlock[0].length == 0) {
                let alignment = sizeBlock[1];
                let size = sizeBlock[2];
                let type = sizeBlock[3];

                size = size.toLowerCase();
                
                actorData['data.details.type'] = SFSBPUtils.camelize(type);
                actorData['data.details.alignment'] = alignment;
                actorData['data.traits.size'] = size;
                return;
            }
          
            let splitTokens = element.split(';');
            splitTokens.forEach(token => {
                tokens.push(token);
            });
        });
        
        // Process all tokens into key-values, such as "hp 13" and "str +4"
        let keyValuePairs = {};
        for(let token of tokens) {
            let items = token.split(' ');
            items.forEach(function(element, index, array) {
                let lowerCaseElement = element.toLowerCase();
                if (recognizedKeywords.includes(lowerCaseElement) && index < array.length - 1) {
                    let value = array.slice(index + 1).join(' ');
                    keyValuePairs[lowerCaseElement] = value;
                    recognizedKeywords = recognizedKeywords.filter(item => item !== lowerCaseElement);
                }
            });
        }
        
        // Process all key-values
        for (var key in keyValuePairs) {
            let value = keyValuePairs[key];
            value = value.trim().replace('–','-');
            //SFSBPUtils.log('Processing key: ' + key + ', with value: ' + value + '.');
            
            if (SFSBP.statMapping[key] != undefined) {
                let values = value.split(' ');
                for (let mappedKey of SFSBP.statMapping[key]) {
                    actorData[mappedKey] = values[0];
                }
            }
            else if (key == "perception") {
                let values = value.split(' ');
                actorData["data.skills.per.enabled"] = true;
                actorData["data.skills.per.mod"] = values[0];
            }
            else if (key == "skills") {
                let skillPairs = value.split(',');
                skillPairs.forEach(pair => {
                    let skillPair = pair.trim().split(' ');
                    //SFSBPUtils.log('Splitting: ' + pair + ', into: ' + skillPair + '.');
                    
                    let skillName = skillPair[0].substring(0,3).toLowerCase();
                    let skillModifier = skillPair[1];
                    //SFSBPUtils.log('Processing skill: ' + skillName + ', with modifier: ' + skillModifier + '.');

                    actorData["data.skills." + skillName + ".enabled"] = true;
                    actorData["data.skills." + skillName + ".mod"] = skillModifier;
                });
            }
            else if (key == "senses") {
                actorData["data.traits.senses"] = value;
            }
            else if (key == "sr") {
                actorData["data.traits.sr"] = value;
            }
            else if (key == "dr") {
                let damageReduction = value.split('/');
                actorData["data.traits.damageReduction.value"] = damageReduction[0].trim();
                actorData["data.traits.damageReduction.negatedBy"] = damageReduction[1].trim();
            }
            else if (key == "melee") {
                let allAttacks = value.split(/\sor\s|,/);
                for (let attack of allAttacks) {
                    let itemData = await this.parseAttack(attack.trim(), true);
                    items.push(itemData);
                }
            }
            else if (key == "ranged") {
                let allAttacks = value.split(/\sor\s|,/);
                for (let attack of allAttacks) {
                    let itemData = await this.parseAttack(attack.trim(), false);
                    items.push(itemData);
                }
            }
        }

        //SFSBPUtils.log('Parsed ' + tokens.length + ' tokens.');
        //SFSBPUtils.log('JSON: ' + JSON.stringify(actorData));
        
        return {success: true, actorData: actorData, items: items};
    }
}
