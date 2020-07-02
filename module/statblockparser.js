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

export class SFStatblockParser {
    async fuzzyFindItem(statBlockItemName) {
        console.log("SFSBP | Fuzzy search for item named: " + statBlockItemName);
        let equipment = game.packs.find(element => element.title.includes("Equipment"));
        if (equipment == undefined) {
            console.log("SFSBP | Could not find equipment compendium.");
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
                //console.log("SFSBP | Item " + itemName + " did not match " + statBlockItemName);
                continue;
            }

            itemWeWant = item;
            break;
        }

        if (itemWeWant != undefined) {
            delete itemWeWant["_id"];
            console.log("SFSBP | Item " + JSON.stringify(itemWeWant));
        } else {
            console.log("SFSBP | Item not found.");
        }
        return itemWeWant;
    }
  
    async parseAttack(attack, bIsMeleeAttack) {
        let attackInfo = attack.split(/([a-zA-Z\s]*)\s([\+|-]\d*)\s\((.*)\)/);
                    
        let attackName = this.camelize(attackInfo[1]);
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
        
        // Start parsing text
        let splitNewlines = statBlockText.split(/[\r\n]+/);
        
        let recognizedKeywords = ["HP", "Init", "Perception", "EAC", "KAC", "Fort", "Ref", "Will", "Speed",
          "Str", "Dex", "Con", "Int", "Wis", "Cha", "Skills", "Senses", "SR", "DR", "Languages", "Melee", "Ranged"];
        
        let tokens = [];
        actorData["data.attributes.sp.max"] = 0;
        actorData["data.attributes.rp.max"] = 0;
        
        let items = [];
        
        for (var skill in CONFIG.SFRPG.skills) {
            actorData["data.skills." + skill + ".enabled"] = false;
            actorData["data.skills." + skill + ".mod"] = 0;
        }
        
        splitNewlines.forEach(element => {
            if (element.includes('CR')) {
                let nameBlock = element.split(/(.*)\s(CR|cr|Cr|cR)\s(\d*\/?\d*)/);
                //console.log('SFSBP | Name: ' + nameBlock[1] + ', CR: ' + nameBlock[3] + '.');
                
                let CR = 1;
                let crs = { "1/8" : 0.125, "1/6" : 1/6, "1/4": 0.25, "1/3": 1/3, "1/2": 0.5 };

                if (crs[nameBlock[3]] != null)
                  CR = crs[nameBlock[3]];
                else
                  CR = parseFloat(nameBlock[3]);
                
                actorData['name'] = this.camelize(nameBlock[1].toLowerCase());
                actorData['data.details.cr'] = CR;
                return;
            }
            else if (element.toLowerCase().includes('melee') || element.toLowerCase().includes('ranged')) {
                tokens.push(element);
                return;
            }
            else if (element.split(/(.*)\s(Fine|Diminutive|Tiny|Small|Medium|Large|Huge|Gargantuan|Colossal)\s(.*)/)[0].length == 0) {
                let groups = element.split(/(.*)\s(Fine|Diminutive|Tiny|Small|Medium|Large|Huge|Gargantuan|Colossal)\s(.*)/);
                let alignment = groups[1];
                let size = groups[2];
                let type = groups[3];

                size = size.toLowerCase();
                //console.log("New size: " + size);
                
                actorData['data.details.type'] = type;
                actorData['data.details.alignment'] = alignment;
                actorData['data.traits.size'] = size;
                return;
            }
          
            let splitTokens = element.split(';');
            splitTokens.forEach(token => {
                tokens.push(token);
            });
        });
        
        let keyValuePairs = {};
        tokens.forEach(token => {
            let items = token.split(' ');
            items.forEach(function(element, index, array) {
                if (recognizedKeywords.includes(element) && index < array.length - 1) {
                    let value = array.slice(index + 1).join(' ');
                    keyValuePairs[element] = value;
                    recognizedKeywords = recognizedKeywords.filter(item => item !== element);
                }
            });
        });
        
        for (var key in keyValuePairs) {
            let value = keyValuePairs[key];
            value = value.trim().replace('–','-');
            //console.log('SFSBP | Processing key: ' + key + ', with value: ' + value + '.');
            
            if (key == "HP") {
                let values = value.split(' ');
                actorData["data.attributes.hp.value"] = values[0];
                actorData["data.attributes.hp.max"] = values[0];
            }
            else if (key == "Init") {
                let values = value.split(' ');
                actorData["data.attributes.init.total"] = values[0];
            }
            else if (key == "EAC") {
                let values = value.split(' ');
                actorData["data.attributes.eac.value"] = values[0];
            }
            else if (key == "KAC") {
                let values = value.split(' ');
                actorData["data.attributes.kac.value"] = values[0];
            }
            else if (key == "Fort") {
                let values = value.split(' ');
                actorData["data.attributes.fort.bonus"] = values[0];
            }
            else if (key == "Ref") {
                let values = value.split(' ');
                actorData["data.attributes.reflex.bonus"] = values[0];
            }
            else if (key == "Will") {
                let values = value.split(' ');
                actorData["data.attributes.will.bonus"] = values[0];
            }
            else if (key == "Perception") {
                let values = value.split(' ');
                actorData["data.skills.per.enabled"] = true;
                actorData["data.skills.per.mod"] = values[0];
            }
            else if (key == "Speed") {
                actorData["data.attributes.speed.value"] = value;
            }
            else if (key == "Str") {
                actorData["data.abilities.str.mod"] = parseInt(value);
            }
            else if (key == "Dex") {
                actorData["data.abilities.dex.mod"] = parseInt(value);
            }
            else if (key == "Con") {
                actorData["data.abilities.con.mod"] = parseInt(value);
            }
            else if (key == "Int") {
                actorData["data.abilities.int.mod"] = parseInt(value);
            }
            else if (key == "Wis") {
                actorData["data.abilities.wis.mod"] = parseInt(value);
            }
            else if (key == "Cha") {
                actorData["data.abilities.cha.mod"] = parseInt(value);
            }
            else if (key == "Skills") {
                let skillPairs = value.split(',');
                skillPairs.forEach(pair => {
                    let skillPair = pair.trim().split(' ');
                    //console.log('SFSBP | Splitting: ' + pair + ', into: ' + skillPair + '.');
                    
                    let skillName = skillPair[0].substring(0,3).toLowerCase();
                    let skillModifier = skillPair[1];
                    //console.log('SFSBP | Processing skill: ' + skillName + ', with modifier: ' + skillModifier + '.');

                    actorData["data.skills." + skillName + ".enabled"] = true;
                    actorData["data.skills." + skillName + ".mod"] = skillModifier;
                });
            }
            else if (key == "Senses") {
                actorData["data.traits.senses"] = value;
            }
            else if (key == "SR") {
                actorData["data.traits.sr"] = value;
            }
            else if (key == "DR") {
                let damageReduction = value.split('/');
                actorData["data.traits.damageReduction.value"] = damageReduction[0].trim();
                actorData["data.traits.damageReduction.negatedBy"] = damageReduction[1].trim();
            }
            else if (key == "Melee") {
                let allAttacks = value.split(/\sor\s|,/);
                for (let attack of allAttacks) {
                    attack = attack.trim();
                    
                    let itemData = await this.parseAttack(attack, true);
                    items.push(itemData);
                    
                    //console.log('SFSBP | Melee attack: ' + attackName + ' (' + attackModifier + '), with damage: ' + attackDamageRoll + ' of ' + attackDamageType + '.');
                }
            }
            else if (key == "Ranged") {
                let allAttacks = value.split(/\sor\s|,/);
                for (let attack of allAttacks) {
                    attack = attack.trim();
                    
                    let itemData = await this.parseAttack(attack, false);
                    items.push(itemData);
                    
                    //console.log('SFSBP | Ranged Attack: ' + attackName + ' (' + attackModifier + '), with damage: ' + attackDamageRoll + ' of ' + attackDamageType + '.');
                }
            }
        }

        //console.log('SFSBP | Parsed ' + tokens.length + ' tokens.');
        //console.log('SFSBP | JSON: ' + JSON.stringify(actorData));
        
        return {success: true, actorData: actorData, items: items};
    }
    
    camelize(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
            return word.toUpperCase();
        }).replace(/\s+/g, ' ');
    }
}
