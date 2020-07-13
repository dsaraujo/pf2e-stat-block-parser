import { SBUtils, SBConfig } from "./utils.js";

class SBLambdaParser {
    constructor(parserFunction) {
        this.parserFunction = parserFunction;
    }

    parse(key, value) {
        this.parserFunction(key, value);
    }
}

const SBDirectFieldAssignmentMode = {
    Direct: "direct",
    LowerCase: "lowercase",
    Camelized: "camelized",
    Integer: "integer"
};

class SBDirectFieldParser {
    constructor(targetFields, assignmentMode = SBDirectFieldAssignmentMode.Direct) {
        this.targetFields = targetFields;
        this.assignmentMode = assignmentMode;
    }

    parse(key, value) {
        switch (this.assignmentMode) {
            default:
            case SBDirectFieldAssignmentMode.Direct:
                break;
            case SBDirectFieldAssignmentMode.LowerCase:
                value = value.toLowerCase();
                break;
            case SBDirectFieldAssignmentMode.Camelized:
                value = SBUtils.camelize(value);
                break;
            case SBDirectFieldAssignmentMode.Integer:
                value = parseInt(value);
                if (Number.isNaN(value)) {
                    value = 0;
                }
                break;
        }

        for (let field of this.targetFields) {
            key[field] = value;
        }
    }
}

export class SBPCGenParser {
    attributeMapping = {
        "root.character.name": new SBDirectFieldParser(["name"]),
        "root.character.alignment": new SBDirectFieldParser(["data.details.alignment"]),
        "root.character.speed": new SBDirectFieldParser(["data.attributes.speed.value"]),
        "root.character.size": new SBDirectFieldParser(["data.traits.size"], SBDirectFieldAssignmentMode.LowerCase),
        "root.character.race": new SBDirectFieldParser(["data.details.race"], SBDirectFieldAssignmentMode.Camelized),
        "root.character.hp.total": new SBDirectFieldParser(["data.attributes.hp.value", "data.attributes.hp.max"]),
        "root.character.sp.total": new SBDirectFieldParser(["data.attributes.sp.value", "data.attributes.sp.max"]),
        "root.character.rp.total": new SBDirectFieldParser(["data.attributes.rp.value", "data.attributes.rp.max"]),
        "root.character.abilities.strength.bonus": new SBDirectFieldParser(["data.abilities.str.mod"], SBDirectFieldAssignmentMode.Integer),
        "root.character.abilities.dexterity.bonus": new SBDirectFieldParser(["data.abilities.dex.mod"], SBDirectFieldAssignmentMode.Integer),
        "root.character.abilities.constitution.bonus": new SBDirectFieldParser(["data.abilities.con.mod"], SBDirectFieldAssignmentMode.Integer),
        "root.character.abilities.intelligence.bonus": new SBDirectFieldParser(["data.abilities.int.mod"], SBDirectFieldAssignmentMode.Integer),
        "root.character.abilities.wisdom.bonus": new SBDirectFieldParser(["data.abilities.wis.mod"], SBDirectFieldAssignmentMode.Integer),
        "root.character.abilities.charisma.bonus": new SBDirectFieldParser(["data.abilities.cha.mod"], SBDirectFieldAssignmentMode.Integer)
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
                let parsedValue = this.getNode(xmlDoc, key);
                if (parsedValue) {
                    let valueParser = this.attributeMapping[key];
                    valueParser.parse(characterData.actorData, parsedValue.nodeValue);
                }
            }
        } catch (err) {
            errors.push(["XML Parsing", err]);
        }

        return {success: true, characterData: characterData, errors: errors};
    }
}
