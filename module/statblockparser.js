import { SBParserMapping } from "./parsers.js";
import { SBUtils, SBConfig } from "./utils.js";

export class SBStatblockParser {
    /** Parses the passed along statblock into the passed along actor data block. */
    async parseInput(actorData, inputText) {
        if (actorData == null || !inputText) {
            return {success: false};
        }

        let recognizedKeywords = Object.keys(SBParserMapping.parsers);
        let tokens = [];
        let items = [];
        
        // NPCs by default have no SP or RP
        actorData["data.attributes.sp.max"] = 0;
        actorData["data.attributes.rp.max"] = 0;

        let bNameHandled = false;
        let bSizeHandled = false;

        // Start parsing text
        // Parse out name, certain key lines that we don't want to split by ;, and all elements ; deliminated
        let splitNewlines = inputText.split(/[\r\n]+/);
        splitNewlines.forEach(line => {
            if (!bNameHandled) {
                let nameBlock = line.split(/(.*)\sCR\s(\d*\/?\d*)/i);
                if (nameBlock[0].length == 0) {
                    let npcName = SBUtils.camelize(nameBlock[1].toLowerCase());
                    let npcCR = nameBlock[2];
                    
                    let crs = { "1/8" : 0.125, "1/6" : 1/6, "1/4": 0.25, "1/3": 1/3, "1/2": 0.5 };

                    if (crs[npcCR] != null) {
                        npcCR = crs[npcCR];
                    } else {
                        let parsedCR = parseFloat(npcCR);
                        if (!isNaN(parsedCR)) {
                            npcCR = parsedCR;
                        }
                    }
                    
                    bNameHandled = true;
                    actorData['name'] = npcName;
                    actorData['data.details.cr'] = npcCR;
                    return;
                }
            }
            
            if (SBUtils.stringStartsWith(line, "melee", false) || SBUtils.stringStartsWith(line, "ranged", false)) {
                tokens.push(line);
                return;
            }
            
            if (!bSizeHandled) {
                let sizeBlock = line.split(/(.*)\s(Fine|Diminutive|Tiny|Small|Medium|Large|Huge|Gargantuan|Colossal)\s(.*)/i);
                if (sizeBlock[0].length == 0) {
                    let alignment = sizeBlock[1];
                    let size = sizeBlock[2];
                    let type = sizeBlock[3];

                    size = size.toLowerCase();
                    
                    bSizeHandled = true;
                    actorData['data.details.type'] = SBUtils.camelize(type);
                    actorData['data.details.alignment'] = alignment;
                    actorData['data.traits.size'] = size;
                    return;
                }
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
            if (parser != undefined) {
                let parsedData = await parser.parse(key, value);

                if (parsedData.actorData != undefined) {
                    actorData = {...actorData, ...parsedData.actorData};
                }

                if (parsedData.items != undefined) {
                    items = items.concat(parsedData.items);
                }
            }
        }

        //SBUtils.log('Parsed ' + tokens.length + ' tokens.');
        //SBUtils.log('JSON: ' + JSON.stringify(actorData));
        
        return {success: true, actorData: actorData, items: items};
    }
}
