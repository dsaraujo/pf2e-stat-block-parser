export class SFStatblockParser {
    async parseStatblock(updateData, statBlockText) {
        function camelize(str) {
            return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
                return word.toUpperCase();
            }).replace(/\s+/g, ' ');
        }
    
        if (updateData == null || statBlockText == null || statBlockText.length == 0) {
            return {success: false};
        }
        
        // Start parsing text
        let splitNewlines = statBlockText.split(/[\r\n]+/);
        
        let recognizedKeywords = ["HP", "Init", "Perception", "EAC", "KAC", "Fort", "Ref", "Will", "Speed",
          "Str", "Dex", "Con", "Int", "Wis", "Cha", "Skills", "Senses", "SR", "DR", "Languages", "Melee", "Ranged"];
        
        let tokens = [];
        updateData["data.attributes.sp.max"] = 0;
        updateData["data.attributes.rp.max"] = 0;
        
        for (var skill in CONFIG.SFRPG.skills) {
            updateData["data.skills." + skill + ".enabled"] = false;
            updateData["data.skills." + skill + ".mod"] = 0;
        }
        
        splitNewlines.forEach(element => {
            if (element.includes('CR')) {
                let nameBlock = element.split(/(.*)\s(CR|cr|Cr|cR)\s(\d*\/?\d*)/);
                console.log('SFSBP | Name: ' + nameBlock[1] + ', CR: ' + nameBlock[3] + '.');
                
                let CR = 1;
                let crs = { "1/8" : 0.125, "1/6" : 1/6, "1/4": 0.25, "1/3": 1/3, "1/2": 0.5 };

                if (crs[nameBlock[3]] != null)
                  CR = crs[nameBlock[3]];
                else
                  CR = parseFloat(nameBlock[3]);
                
                updateData['name'] = camelize(nameBlock[1].toLowerCase());
                updateData['data.details.cr'] = CR;
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
                console.log("New size: " + size);
                
                updateData['data.details.type'] = type;
                updateData['data.details.alignment'] = alignment;
                updateData['data.traits.size'] = size;
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
                updateData["data.attributes.hp.value"] = values[0];
                updateData["data.attributes.hp.max"] = values[0];
            }
            else if (key == "Init") {
                let values = value.split(' ');
                updateData["data.attributes.init.total"] = values[0];
            }
            else if (key == "EAC") {
                let values = value.split(' ');
                updateData["data.attributes.eac.value"] = values[0];
            }
            else if (key == "KAC") {
                let values = value.split(' ');
                updateData["data.attributes.kac.value"] = values[0];
            }
            else if (key == "Fort") {
                let values = value.split(' ');
                updateData["data.attributes.fort.bonus"] = values[0];
            }
            else if (key == "Ref") {
                let values = value.split(' ');
                updateData["data.attributes.reflex.bonus"] = values[0];
            }
            else if (key == "Will") {
                let values = value.split(' ');
                updateData["data.attributes.will.bonus"] = values[0];
            }
            else if (key == "Perception") {
                let values = value.split(' ');
                updateData["data.skills.per.enabled"] = true;
                updateData["data.skills.per.mod"] = values[0];
            }
            else if (key == "Speed") {
                updateData["data.attributes.speed.value"] = value;
            }
            else if (key == "Str") {
                updateData["data.abilities.str.mod"] = parseInt(value);
            }
            else if (key == "Dex") {
                updateData["data.abilities.dex.mod"] = parseInt(value);
            }
            else if (key == "Con") {
                updateData["data.abilities.con.mod"] = parseInt(value);
            }
            else if (key == "Int") {
                updateData["data.abilities.int.mod"] = parseInt(value);
            }
            else if (key == "Wis") {
                updateData["data.abilities.wis.mod"] = parseInt(value);
            }
            else if (key == "Cha") {
                updateData["data.abilities.cha.mod"] = parseInt(value);
            }
            else if (key == "Skills") {
                let skillPairs = value.split(',');
                skillPairs.forEach(pair => {
                    let skillPair = pair.trim().split(' ');
                    //console.log('SFSBP | Splitting: ' + pair + ', into: ' + skillPair + '.');
                    
                    let skillName = skillPair[0].substring(0,3).toLowerCase();
                    let skillModifier = skillPair[1];
                    //console.log('SFSBP | Processing skill: ' + skillName + ', with modifier: ' + skillModifier + '.');

                    updateData["data.skills." + skillName + ".enabled"] = true;
                    updateData["data.skills." + skillName + ".mod"] = skillModifier;
                });
            }
            else if (key == "Senses") {
                updateData["data.traits.senses"] = value;
            }
            else if (key == "SR") {
                updateData["data.traits.sr"] = value;
            }
            else if (key == "DR") {
                let damageReduction = value.split('/');
                updateData["data.traits.damageReduction.value"] = damageReduction[0].trim();
                updateData["data.traits.damageReduction.negatedBy"] = damageReduction[1].trim();
            }
            else if (key == "Melee") {
                let allAttacks = value.split(/\sor\s|,/);
                allAttacks.forEach(attack => {
                    attack = attack.trim();
                    let attackInfo = attack.split(/([a-zA-Z\s]*)\s([\+|-]\d*)\s\((.*)\)/);
                    
                    let attackName = attackInfo[1];
                    let attackModifier = attackInfo[2];
                    let attackDamageData = attackInfo[3].split(/(\d*d\d*\+\d*)\s(.*)/);
                    let attackDamageRoll = attackDamageData[1];
                    let attackDamageType = attackDamageData[2];
                    
                    // First, we try to find an item that matches the attackName
                    // If we do, adjust damage and rolls
                    
                    // If we don't find one, we'll have to create a new one
                    
                    //console.log('SFSBP | Attack: ' + attackName + ' (' + attackModifier + '), with damage: ' + attackDamageRoll + ' of ' + attackDamageType + '.');
                });
            }
            else if (key == "Ranged") {
                let allAttacks = value.split(/\sor\s|,/);
                allAttacks.forEach(attack => {
                    attack = attack.trim();
                    let attackInfo = attack.split(/([a-zA-Z\s]*)\s([\+|-]\d*)\s\((.*)\)/);
                    
                    let attackName = attackInfo[1];
                    let attackModifier = attackInfo[2];
                    let attackDamageData = attackInfo[3].split(/(\d*d\d*\+\d*)\s(.*)/);
                    let attackDamageRoll = attackDamageData[1];
                    let attackDamageType = attackDamageData[2];
                    
                    //console.log('SFSBP | Attack: ' + attackName + ' (' + attackModifier + '), with damage: ' + attackDamageRoll + ' of ' + attackDamageType + '.');
                });
            }
        }

        //console.log('SFSBP | Parsed ' + tokens.length + ' tokens.');
        //console.log('SFSBP | JSON: ' + JSON.stringify(updateData));
        
        return {success: true, actorData: updateData};
    }
}
