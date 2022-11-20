export const SBConfig = {};
SBConfig.weaponDamageTypes = {
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
    "p & c": "cold+piercing",
    "s": "slashing",
    "s & p": "slashing+piercing",
    "s & so": "slashing+sonic"
};

SBConfig.weaponDamageTypeNew = {
    "a": {"acid": true},
    "c": {"cold": true},
    "f": {"fire": true},
    "e": {"electricity": true},
    "so": {"sonic": true},
    "b": {"bludgeoning": true},
    "p": {"piercing": true},
    "s": {"slashing": true}
};

SBConfig.skillMapping = {
    "acrobatics": "acr",
    "athletics": "ath",
    "bluff": "blu",
    "computers": "com",
    "culture": "cul",
    "diplomacy": "dip",
    "disguise": "dis",
    "disguise self": "dis",
    "engineering": "eng",
    "intimidate": "int",
    "life science": "lsc",
    "medicine": "med",
    "mysticism": "mys",
    "perception": "per",
    "physical science": "phs",
    "piloting": "pil",
    "profession": "pro",
    "sense motive": "sen",
    "sleight of hand": "sle",
    "stealth": "ste",
    "survival": "sur"
};

SBConfig.sizeMapping = {
    "fine": 1,
    "diminutive": 1,
    "tiny": 1,
    "small": 1,
    "medium": 1,
    "large": 2,
    "huge": 3,
    "gargantuan": 4,
    "colossal": 6
};

export class SBUtils {
    static openingBrackets = ['(', '[', '{'];
    static closingBrackers = [')', ']', '}'];
    static matchingClosingBrackets = {'(': ')', '[' : ']', '{': '}'};

    static camelize(str) {
        if (!str) {
            return str;
        }
        return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(word, index) {
            return word.toUpperCase();
        }).replace(/\s+/g, ' ');
    }

    static stringContains(string, subString, bCaseSensitive = true) {
        if (bCaseSensitive) {
            return string.includes(subString);
        }
        return string.toLowerCase().includes(subString.toLowerCase());
    }

    static stringStartsWith(string, searchString, bCaseSensitive = true) {
        if (!string) return false;
        if (!searchString) return false;

        try {
            if (searchString.length > string.length) {
                return false;
            }

            if (bCaseSensitive) {
                return string.startsWith(searchString);
            } else {
                let startPart = string.substring(0, searchString.length);
                return startPart.toLowerCase() === searchString.toLowerCase();
            }
        } catch (err) {
            SBUtils.log(`stringStartsWith('${string}', '${searchString}', ${bCaseSensitive}) threw an error: ${err}`);
            throw err;
        }
    }

    /** Similar method to string.indexOf, but takes regex as an argument. */
    static regexIndexOf(string, regex, position = 0) {
        var indexOf = string.substring(position || 0).search(regex);
        return (indexOf >= 0) ? (indexOf + (position || 0)) : indexOf;
    }

    /** Update a character at a specific index in a string. */
    static setCharacterAtIndex(string, character, index) {
        if(index > string.length - 1) return string;
        return string.substring(0, index) + character + string.substring(index + 1);
    }

    static log(message) {
        console.log("SFSBP | " + message);
    }

    static warn(message) {
        console.warn("SFSBP | " + message);
    }

    /** Will try to find an entry in the specified compendium that matches all the terms, will return the first entry that does. */
    static async fuzzyFindCompendiumAsync(compendiumName, searchString) {
        if (!compendiumName) {
            SBUtils.log("No compendium name specified.");
            return null;
        }

        if (!searchString) {
            SBUtils.log("No search string specified.");
            return null;
        }

        let compendium = game.packs.find(element => element.title.includes(compendiumName));
        if (compendium == undefined) {
            SBUtils.log("Could not find compendium named " + compendium + ".");
            return null;
        }

        const rawString = this.parseSubtext(searchString)[0];
        
        // Let the compendium load
        await compendium.getIndex();
        
        const terms = rawString.toLowerCase().replace("(ex)","").replace("(su)","").replace("(sp)","").trim().replace(/[*,;()\[\]'"]/g,"").split(' ');
        let entryWeWant = null;
        for (const entry of compendium.index) {
            const rawEntryName = this.parseSubtext(entry.name)[0];
            const entryName = rawEntryName.toLowerCase().replace("(ex)","").replace("(su)","").replace("(sp)","").trim();
            const entryTerms = entryName.replace(/[*,;()\[\]'"]/g,"").split(' ');

            if (terms.length !== entryTerms.length) {
                continue;
            }
            
            let bAllTermsPresent = true;
            for (let term of terms) {
                if (!entryTerms.includes(term)) {
                    bAllTermsPresent = false;
                    break;
                }
            }

            if (!bAllTermsPresent) {
                continue;
            }

            const document = await compendium.getDocument(entry._id);
            entryWeWant = document;
            break;
        }

        if (entryWeWant) {
            return duplicate(entryWeWant);
            //SBUtils.log("Item " + JSON.stringify(entryWeWant));
        } else {
            //SBUtils.warn("Item " + rawString + " not found.");
        }
    }

    static async fuzzyFindItemAsync(statBlockItemName) {
        statBlockItemName = statBlockItemName.toLowerCase();

        // Common substitutions
        statBlockItemName = statBlockItemName.replace("grenades", "grenade");
        if (statBlockItemName.endsWith("grenade 1")) {
            statBlockItemName = statBlockItemName.replace("grenade 1", "grenade i");
        } else if (statBlockItemName.endsWith("grenade 2")) {
            statBlockItemName = statBlockItemName.replace("grenade 2", "grenade ii");
        } else if (statBlockItemName.endsWith("grenade 3")) {
            statBlockItemName = statBlockItemName.replace("grenade 3", "grenade iii");
        } else if (statBlockItemName.endsWith("grenade 4")) {
            statBlockItemName = statBlockItemName.replace(" 4", "grenade iv");
        } else if (statBlockItemName.endsWith("grenade 5")) {
            statBlockItemName = statBlockItemName.replace("grenade 5", "grenade v");
        }

        statBlockItemName = statBlockItemName.replace("batteries", "battery");
        return this.fuzzyFindCompendiumAsync("Equipment", statBlockItemName);
    }

    static async fuzzyFindSpellAsync(statBlockSpellName) {
        statBlockSpellName = statBlockSpellName.replace("/ ", "/");
        statBlockSpellName = statBlockSpellName.replace(" /", "/");
        console.log(statBlockSpellName)
        return this.fuzzyFindCompendiumAsync("Spells", statBlockSpellName);
    }

    static parseSubtext = (value) => {
        let startSubtextIndex = value.indexOf('(');
        let endSubtextIndex = value.indexOf(')');
        if (startSubtextIndex > -1 && endSubtextIndex > startSubtextIndex) {
            let baseValue = value.substring(0, startSubtextIndex).trim();
            let subValue = value.substring(startSubtextIndex+1, endSubtextIndex).trim();
            return [baseValue, subValue];
        } else {
            return [value];
        }
    }

    /** Supported options:
     * preventDefaultSplitters: (Boolean) Prevents the usage of 'or' and 'and' as delimiters for string splitting, useful in cases where you explicitly want to split only on a specific delimiter.
     * additionalEntrySplitters: (Array) Additional delimiters to use on top of the defaults.
     */
    static splitEntries(baseString, options = {}) {
        let textualEntrySplitters = [];
        if (!options.preventDefaultSplitters) {
            textualEntrySplitters = ["or", "and"];
        }

        if (options.additionalEntrySplitters) {
            textualEntrySplitters = textualEntrySplitters.concat(options.additionalEntrySplitters);
        }

        let results = null;
        let stack = [];
        let entry = "";
        for (let i = 0; i<baseString.length; i++) {
            let character = baseString[i];
            let stackTop = stack.length > 0 ? stack[stack.length-1] : '';
            if (SBUtils.openingBrackets.includes(character)) {
                entry += character;
                stack.push(character);
            } else if (stackTop && character == SBUtils.matchingClosingBrackets[stackTop]) {
                entry += character;
                stack.pop();
            } else if (character === ',' || character === ';' || (options.additionalDelimiters && options.additionalDelimiters.includes(character))) {
                if (stack.length === 0 && entry.length > 0) {
                    if (!results) {
                        results = [entry.trim()];
                    } else {
                        results.push(entry.trim());
                    }
                    entry = "";
                } else {
                    entry += character;
                }
            } else {
                entry += character;
                for (let splitter of textualEntrySplitters) {
                    let ending = " " + splitter;
                    if (entry.toLowerCase().endsWith(ending) && stack.length == 0 && baseString[i+1] == ' ') {
                        entry = entry.substring(0, entry.length - splitter.length);
                        if (!results) {
                            results = [entry.trim()];
                        } else {
                            results.push(entry.trim());
                        }
                        entry = "";
                    }
                }
            }
        }

        entry = entry.trim();
        if (entry) {
            if (!results) {
                results = [entry];
            } else {
                results.push(entry);
            }
        }

        return results;
    }

    static actorSizeToTokenSize(actorSize) {
        if (actorSize in SBConfig.sizeMapping) {
            return SBConfig.sizeMapping[actorSize];
        }
        return 1;
    }
}
