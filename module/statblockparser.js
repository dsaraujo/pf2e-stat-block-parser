import { SBCategoryParserBase, SBParserBase, SBParserMapping, SBParsing } from "./parsers.js";
import { SBUtils, SBConfig } from "./utils.js";

export class SBStatblockParser {
    /** Parses the passed along statblock into the passed along actor data block. */
    async parseInput(actorData, inputText) {
        if (actorData == null || !inputText) {
            return {success: false};
        }

        let characterData = {
            actorData: actorData,
            items: [],
            spells: [],
            abilityDescriptions: [],
            characterDescriptions: []
        }

        // NPCs by default have no SP or RP
        characterData.actorData["data.attributes.sp.max"] = 0;
        characterData.actorData["data.attributes.rp.max"] = 0;

        let bNameHandled = false;
        let bSizeHandled = false;
        let bRaceHandled = false;

        let availableCategories = Object.keys(SBParserMapping.parsers);
        
        let category = "base";
        delete availableCategories[category];

        let categoryLines = {};
        let errors = [];

        // Start parsing text
        inputText = inputText.replace(/—/gi, '-');
        inputText = inputText.replace(/–/gi, '-');

        // Parse out name, certain key lines that we don't want to split by ;, and all elements ; deliminated
        let splitNewlines = inputText.split(/[\r\n]+/);
        splitNewlines.forEach(line => {
            // Detect category
            for (let availableCat of availableCategories) {
                if (SBUtils.stringStartsWith(line, availableCat, false)) {
                    category = availableCat;
                    delete availableCategories[category];
                    line = line.substring(category.length + 1);
                }
            }

            if (category == "base") {
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
                        characterData.actorData['name'] = npcName;
                        characterData.actorData['data.details.cr'] = npcCR;
                        return;
                    }
                }

                if (!bRaceHandled) {
                    let genderRaceClassBlock = line.split(/(male|female|host)\s(.*)\s(\S*)/i);
                    if (genderRaceClassBlock[0].length == 0) {
                        let gender = genderRaceClassBlock[1];
                        let race = genderRaceClassBlock[2];
                        let npcClass = genderRaceClassBlock[3];

                        bRaceHandled = true;
                        characterData.actorData['data.details.gender'] = SBUtils.camelize(gender);
                        characterData.actorData['data.details.race'] = SBUtils.camelize(race);
                        characterData.actorData['data.details.class'] = SBUtils.camelize(npcClass);
                        return;
                    }
                }
                
                if (!bSizeHandled) {
                    let sizeBlock = line.split(/(.*)\s(Fine|Diminutive|Tiny|Small|Medium|Large|Huge|Gargantuan|Colossal)\s(.*)/i);
                    if (sizeBlock[0].length == 0) {
                        let alignment = sizeBlock[1];
                        let size = sizeBlock[2];
                        let typeRace = sizeBlock[3];

                        let typeSeparation = typeRace.split(/(\S*)( \((.*)\))?/i);
                        let type = typeSeparation[1];
                        let subType = "";
                        if (typeSeparation.length > 3) {
                            subType = typeSeparation[3];
                        }

                        size = size.toLowerCase();
                        
                        bSizeHandled = true;
                        characterData.actorData['data.details.type'] = SBUtils.camelize(type);
                        if (subType) {
                            characterData.actorData['data.details.subtype'] = SBUtils.camelize(subType);
                        }
                        characterData.actorData['data.details.alignment'] = alignment;
                        characterData.actorData['data.traits.size'] = size;
                        return;
                    }
                }
            }

            if (!categoryLines[category]) {
                categoryLines[category] = [line];
            } else {
                categoryLines[category].push(line);
            }
        });

        function getRawMatchingKeyword(input, keywords) {
            for (let keyword of keywords) {
                if (keyword.includes("*")) {
                    let regex = new RegExp(keyword.replace("*", "(\\S*)"), "i");
                    let matched = input.match(regex);
                    if (matched != null) {
                        //SBUtils.log("SWK: Keyword " + keyword + " is now " + JSON.stringify(matched));
                        //keyword = matched[0];
                        return keyword;
                    }
                }
                
                if (SBUtils.stringStartsWith(input, keyword + " ", false)) {
                    return keyword;
                }
            }
            return input;
        }

        function startsWithKeyword(line, keywords) {
            for (let keyword of keywords) {
                if (keyword.includes("*")) {
                    let regex = new RegExp(keyword.replace("*", "(\\S*)"), "i");
                    let matched = line.match(regex);
                    if (matched != null) {
                        //SBUtils.log("SWK: Keyword " + keyword + " is now " + JSON.stringify(matched));
                        keyword = matched[0];
                    }
                }
                
                if (SBUtils.stringStartsWith(line, keyword + " ", false)) {
                    return true;
                }
            }
            return false;
        }

        function indexOfNextKeyword(line, keywords) {
            let index = -1;
            let lowerCaseLine = line.toLowerCase();
            let foundKeyword = "";
            for(let keyword of keywords) {
                if (keyword.includes("*")) {
                    let regex = new RegExp(keyword.replace("*", "(\\S*)"), "i");
                    let matched = line.match(regex);
                    if (matched != null) {
                        //SBUtils.log("IONK: Keyword " + keyword + " is now " + JSON.stringify(matched));// + ", from line: " + line);
                        keyword = matched[0];
                    }
                }
                
                let keywordIndex = lowerCaseLine.indexOf(keyword.toLowerCase());
                if (keywordIndex != -1) {
                    let textUpToKeyword = lowerCaseLine.substring(0, keywordIndex);
                    let stack = [];
                    for (let i = 0; i<textUpToKeyword.length; i++) {
                        let character = textUpToKeyword[i];
                        if (SBUtils.openingBrackets.includes(character)) {
                            stack.push(character);
                        } else if (stack.length > 0 && SBUtils.matchingClosingBrackets[stack[stack.length - 1]] == character) {
                            stack.pop();
                        }
                    }

                    if (stack.length > 0) {
                        //SBUtils.log("Rejected " + keyword + " because inside " + stack[stack.length - 1]);
                        continue;
                    }

                    if (index == -1 || keywordIndex < index) {
                        index = keywordIndex;
                        foundKeyword = keyword.toLowerCase();
                    }
                }
            }
            return {index: index, keyword: foundKeyword};
        }

        SBUtils.log("Parsing categories");
        for (const [key, value] of Object.entries(categoryLines)) {
            category = key;
            SBUtils.log("> Parsing " + category);

            let categoryParsing = SBParserMapping.parsers[category];
            if (!categoryParsing) {
                SBUtils.log("> No parser for " + category + " (Can be ignored safely)");
                continue;
            }
            
            if (categoryParsing instanceof SBCategoryParserBase) {
                let parsedData = null;
                try {
                    parsedData = await categoryParsing.parse(category, value);
                } catch (err) {
                    errors.push([firstWord, err]);
                    continue;
                }

                let processedResults = this.processParsedData(parsedData, characterData, errors);
                characterData = processedResults.characterData;
                errors = processedResults.errors;
                continue;
            }

            let availableKeywords = Object.keys(categoryParsing);

            let combinedLine = "";
            for(let line of value) {
                if (!combinedLine) {
                    combinedLine = line;
                } else {
                    if (startsWithKeyword(line, availableKeywords)) {
                        combinedLine += "; " + line;
                    } else {
                        combinedLine += " " + line;
                    }
                }
            }

            // Now we try to consume tokens
            let iterationsLeft = 100;
            while (combinedLine && iterationsLeft > 0) {
                //SBUtils.log(">> Evaluating " + combinedLine + " with set: " + availableKeywords);

                // First try to get the first keyword
                let firstWord = "";
                for (let availableKeyword of availableKeywords) {
                    if (availableKeyword.includes("*")) {
                        let regex = new RegExp(availableKeyword.replace("*", "(\\S*)"), "i");
                        let matched = combinedLine.match(regex);
                        if (matched != null) {
                            //SBUtils.log("SWK: Keyword " + keyword + " is now " + JSON.stringify(matched));
                            availableKeyword = matched[0];
                        }
                    }
                    
                    if (SBUtils.stringStartsWith(combinedLine, availableKeyword, false)) {
                        //SBUtils.log("Starts with keyword " + availableKeyword);
                        firstWord = availableKeyword;
                        availableKeywords = availableKeywords.filter(x => x != firstWord.toLowerCase());
                        combinedLine = combinedLine.substring(firstWord.length).trim();
                    }
                }

                // If no keyword was found, consume precisely 1 word and try again.
                if (!firstWord) {
                    var firstSpace = combinedLine.indexOf(" ");
                    firstWord = firstSpace > 0 ? combinedLine.substring(0, firstSpace) : combinedLine;
                    combinedLine = combinedLine.substring(firstWord.length).trim();
                    //SBUtils.log("No keyword found, parsed out " + firstWord);
                    continue;
                }

                // Next, get the parsable value (Everything up to the next keyword)
                var parsableValue = combinedLine;
                var nextKeyword = indexOfNextKeyword(combinedLine, availableKeywords);
                //SBUtils.log("For " + firstWord + ", next keyword is " + nextKeyword.keyword + " at " + nextKeyword.index + ", as attained from " + combinedLine);
                var nextKeywordIndex = nextKeyword.index;
                if (nextKeywordIndex != -1) {
                    parsableValue = combinedLine.substring(0, nextKeywordIndex).trim();
                    combinedLine = combinedLine.substring(parsableValue.length).trim();
                } else {
                    combinedLine = "";
                }
                if (parsableValue.endsWith(";")) {
                    parsableValue = parsableValue.substring(0, parsableValue.length - 1).trim();
                }

                //SBUtils.log(">> Evaluating " + firstWord + ", with value: " + parsableValue);
                let rawKeyword = getRawMatchingKeyword(firstWord, availableKeywords);
                var parser = SBParserMapping.parsers[category][rawKeyword];
                if (parser != null) {
                    let parsedData = null;
                    try {
                        parsedData = await parser.parse(firstWord, parsableValue);
                    } catch (err) {
                        errors.push([firstWord, err]);
                        continue;
                    }

                    let processedResults = this.processParsedData(parsedData, characterData, errors);
                    characterData = processedResults.characterData;
                    errors = processedResults.errors;
                } else {
                    SBUtils.log("No parser for " + category + "." + firstWord + " (Can be ignored safely)");
                }

                iterationsLeft--;
            }
        }

        // Reduce any attack bonuses on items by their ability modifier, to prevent double bonuses
        for (let item of characterData.items) {
            if (item.type == "weapon") {
                let bonus = SBParsing.parseInteger(characterData.actorData["data.abilities." + item["data.ability"] + ".mod"]);
                item["data.attackBonus"] -= bonus;
            }
        }

        return {success: true, characterData: characterData, errors: errors};
    }

    processParsedData(parsedData, characterData, errors) {

        if (parsedData.actorData != undefined) {
            characterData.actorData = {...characterData.actorData, ...parsedData.actorData};
        }

        if (parsedData.items != undefined) {
            for (let item of parsedData.items) {
                if (!item["name"]) {
                    SBUtils.log("Parser for " + category + "." + firstWord + " produced an invalid item.");
                }
            }
            characterData.items = characterData.items.concat(parsedData.items);
        }

        if (parsedData.spells != undefined) {
            for (let spell of parsedData.spells) {
                if (!spell["name"]) {
                    SBUtils.log("Parser for " + category + " produced an invalid item.");
                }
            }
            characterData.spells = characterData.spells.concat(parsedData.spells);
        }

        if (parsedData.abilityDescriptions != undefined) {
            characterData.abilityDescriptions = characterData.abilityDescriptions.concat(parsedData.abilityDescriptions);
        }

        if (parsedData.characterDescriptions != undefined) {
            characterData.characterDescriptions = characterData.characterDescriptions.concat(parsedData.characterDescriptions);
        }

        if (parsedData.errors != undefined) {
            errors = errors.concat(parsedData.errors);
        }
        
        return {characterData: characterData, errors: errors};
    }
}
