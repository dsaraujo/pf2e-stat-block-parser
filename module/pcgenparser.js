import { SBUtils, SBConfig } from "./utils.js";

export class SBPCGenParser {
    attributeMapping = {
        "root.character.name": ["name"],
        "root.character.alignment": ["data.details.alignment"],
        "root.character.size": ["data.traits.size"],
        "root.character.race": ["data.details.race"]
    };

    getNode(xmlDoc, path, bGetTextNode = true) {
        let tokens = path.split('.');

        let currentNode = xmlDoc;
        for (let token of tokens) {
            let elements = currentNode.getElementsByTagName(token);
            if (elements.length == 0) {
                return undefined;
            }

            currentNode = elements[0];
        }

        if (currentNode == undefined) {
            return undefined;
        }

        if (bGetTextNode) {
            for (let childNode of currentNode.childNodes) {
                //console.log(childNode.nodeType + ": " + childNode.nodeName + " = " + childNode.nodeValue);
                if (childNode.nodeType == 3) {
                    return childNode;
                }
            }
            return undefined;
        }

        return currentNode;
    }
    
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

        let errors = [];

        try {
            let xmlParser = new DOMParser();
            let xmlDoc = xmlParser.parseFromString(inputText,"text/xml");
            SBUtils.log("Stat: " + this.getNode(xmlDoc, "root.character.name").nodeValue);

            let keys = Object.keys(this.attributeMapping);
            for (let key of keys) {
                let targetAttribute = this.attributeMapping[key];
                let parsedValue = this.getNode(xmlDoc, key);
                if (parsedValue) {
                    characterData.actorData[targetAttribute] = parsedValue.nodeValue;
                }
            }
        } catch (err) {
            errors.push(["XML Parsing", err]);
        }

        return {success: true, characterData: characterData, errors: errors};
    }
}
