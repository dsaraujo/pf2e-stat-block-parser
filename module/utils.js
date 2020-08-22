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
    "s": "slashing",
    "s & p": "slashing+piercing",
    "s & so": "slashing+sonic"
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

    static log(message) {
        console.log("SFSBP | " + message);
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
        
        // Let the compendium load
        await compendium.getIndex();
        
        let terms = searchString.toLowerCase().replace(/[,;()\[\]'"]/g,"").split(' ');
        let entryWeWant = null;
        for (let entry of compendium.index) {
            let entryName = entry.name.toLowerCase();
            let entryTerms = entryName.replace(/[,;()\[\]'"]/g,"").split(' ');

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

            entryWeWant = compendium.getEntry(entry._id);
            break;
        }

        if (entryWeWant != undefined) {
            //SBUtils.log("Item " + JSON.stringify(entryWeWant));
        } else {
            //SBUtils.log("Item " + entryName + " not found.");
        }
        return entryWeWant;
    }

    static async fuzzyFindItemAsync(statBlockItemName) {
        return this.fuzzyFindCompendiumAsync("Equipment", statBlockItemName);
    }

    static async fuzzyFindSpellAsync(statBlockSpellName) {
        return this.fuzzyFindCompendiumAsync("Spells", statBlockSpellName);
    }

    static splitEntries(baseString) {
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
            } else if (character === ',' || character === ';') {
                if (stack.length === 0 && entry.length > 0) {
                    if (!results) {
                        results = [entry.trim()];
                    } else {
                        results.push(entry.trim());
                    }
                    entry = "";
                }
            } else {
                entry += character;
                if (entry.toLowerCase().endsWith(" or") && stack.length == 0 && baseString[i+1] == ' ') {
                    entry = entry.substring(0, entry.length - 2);
                    if (!results) {
                        results = [entry.trim()];
                    } else {
                        results.push(entry.trim());
                    }
                    entry = "";
                } else if (entry.toLowerCase().endsWith(" and") && stack.length == 0 && baseString[i+1] == ' ') {
                    entry = entry.substring(0, entry.length - 3);
                    if (!results) {
                        results = [entry.trim()];
                    } else {
                        results.push(entry.trim());
                    }
                    entry = "";
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
}
