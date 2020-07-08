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
        if (bCaseSensitive) {
            return startPart.startsWith(searchString);
        } else {
            let startPart = string.substring(0, searchString.length);
            return startPart.toLowerCase() === searchString.toLowerCase();
        }
    }

    static log(message) {
        console.log("SFSBP | " + message);
    }

    /** Will try to find an item that matches all the terms, will return the first item it finds that does. */
    static async fuzzyFindItem(statBlockItemName) {
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

            itemWeWant = equipment.getEntry(item._id);
            break;
        }

        if (itemWeWant != undefined) {
            //SBUtils.log("Item " + JSON.stringify(itemWeWant));
        } else {
            //SBUtils.log("Item " + statBlockItemName + " not found.");
        }
        return itemWeWant;
    }

    static async splitEntries(baseString) {
        let results = null;
        let stack = [];
        let entry = "";
        for (let i = 0; i<baseString.length; i++) {
            let character = baseString[i];
            if (character == '(' || character == '[' || character == '{') {
                entry += character;
                stack.push(character);
            } else if (character == ')' && stack[stack.length-1] == '(') {
                entry += character;
                stack.pop();
            } else if (character == ']' && stack[stack.length-1] == '[') {
                entry += character;
                stack.pop();
            } else if (character == '{' && stack[stack.length-1] == '}') {
                entry += character;
                stack.pop();
            } else if (character == ',') {
                if (stack.length == 0 && entry.length > 0) {
                    if (!results) {
                        results = [entry.trim()];
                    } else {
                        results.push(entry.trim());
                    }
                    //SBUtils.log("Comma hit, pushing " + entry)
                    entry = "";
                }
            } else {
                entry += character;
                if (entry.toLowerCase().endsWith("or") && stack.length == 0 && baseString[i+1] == ' ') {
                    entry = entry.substring(0, entry.length - 2);
                    //SBUtils.log("Or hit, pushing " + entry)
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
            //SBUtils.log("Wrapping up, pushing " + entry);
            if (!results) {
                results = [entry];
            } else {
                results.push(entry);
            }
        }

        SBUtils.log("Finished array: " + JSON.stringify(results));
        return results;
    }
}
