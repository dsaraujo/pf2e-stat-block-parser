import { SBUtils, SBConfig } from "./utils.js";
import { SBParserMapping } from "./parsers.js";

export class SBStatblockParser {
    /** Parses the passed along statblock into the passed along actor data block. */
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
        splitNewlines.forEach(line => {
            let nameBlock = line.split(/(.*)\sCR\s(\d*\/?\d*)/i);
            if (nameBlock[0].length == 0) {
                let npcName = SBUtils.camelize(nameBlock[1].toLowerCase());
                let npcCR = nameBlock[2];
                
                let crs = { "1/8" : 0.125, "1/6" : 1/6, "1/4": 0.25, "1/3": 1/3, "1/2": 0.5 };

                if (crs[npcCR] != null) {
                    npcCR = crs[npcCR];
                }
                else {
                    let parsedCR = parseFloat(npcCR);
                    if (!isNaN(parsedCR)) {
                        npcCR = parsedCR;
                    }
                }
                
                actorData['name'] = npcName;
                actorData['data.details.cr'] = npcCR;
                return;
            }
            
            if (SBUtils.stringStartsWith(line, "melee", false) || SBUtils.stringStartsWith(line, "ranged", false)) {
                tokens.push(line);
                return;
            }
            
            let sizeBlock = line.split(/(.*)\s(Fine|Diminutive|Tiny|Small|Medium|Large|Huge|Gargantuan|Colossal)\s(.*)/i);
            if (sizeBlock[0].length == 0) {
                let alignment = sizeBlock[1];
                let size = sizeBlock[2];
                let type = sizeBlock[3];

                size = size.toLowerCase();
                
                actorData['data.details.type'] = SBUtils.camelize(type);
                actorData['data.details.alignment'] = alignment;
                actorData['data.traits.size'] = size;
                return;
            }
          
            let splitTokens = line.split(';');
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
            //SBUtils.log('Processing key: ' + key + ', with value: ' + value + '.');
            
            let parser = SBParserMapping.parsers[key];
            if (parser != undefined)
            {
                let parsedData = parser.parse(key, value);
                //SBUtils.log("Parsed: " + JSON.stringify(parsedData));

                actorData = {...actorData, ...parsedData};
                //SBUtils.log("Merged: " + JSON.stringify(actorData));
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

        //SBUtils.log('Parsed ' + tokens.length + ' tokens.');
        //SBUtils.log('JSON: ' + JSON.stringify(actorData));
        
        return {success: true, actorData: actorData, items: items};
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

    /** Will try to find an item that matches all the terms, will return the first item it finds that does. */
    async fuzzyFindItem(statBlockItemName) {
        //SBUtils.log("Fuzzy search for item named: " + statBlockItemName);
        let equipment = game.packs.find(element => element.title.includes("Equipment"));
        if (equipment == undefined) {
            SBUtils.log("Could not find equipment compendium.");
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
            //SBUtils.log("Item " + JSON.stringify(itemWeWant));
        } else {
            //SBUtils.log("Item not found.");
        }
        return itemWeWant;
    }
}
