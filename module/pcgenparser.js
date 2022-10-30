import { SBUtils, SBConfig } from "./utils.js";

function getNode(xmlDoc, path, bGetTextNode = true) {
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
        this.bWantsNode = false;
    }

    parse(characterData, value) {
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
            characterData.actorData[field] = value;
        }
    }
}

class SBSkillParser {
    constructor() {
        this.bWantsNode = true;
    }

    parse(characterData, skillListNode) {
        //SBUtils.log("> Parsing skills: " + skillListNode.nodeName + ", with " + skillListNode.childNodes.length + " children");
        for (let childNode of skillListNode.childNodes) {
            // Skip text nodes
            if (childNode.nodeType == 3) {
                continue;
            }

            let skillName = "";
            try {
                //SBUtils.log(">> Parsing " + childNode.nodeName + ": "+ childNode.nodeType);
                skillName = getNode(childNode, "label").nodeValue.toLowerCase();
                let skillTotal = parseInt(getNode(childNode, "total").nodeValue);
    
                //SBUtils.log(">> Parsing " + skillName + " with a score of " + skillTotal);
                skillTotal = parseInt(skillTotal);
                if (Number.isNaN(skillTotal) || skillTotal == 0) {
                    continue;
                }

                skillName = SBConfig.skillMapping[skillName.toLowerCase()];
                if (!skillName) {
                    skillName = skillName.toLowerCase().substring(0, 3);
                }

                characterData.actorData["system.skills." + skillName + ".enabled"] = true;
                characterData.actorData["system.skills." + skillName + ".mod"] = skillTotal;
            } catch (err) {
                if (skillName) {
                    SBUtils.log("Error occurred parsing skill: " + skillName + ", err: " + err);
                }
                throw err;
            }
        }
    }
}

class SBFeatParser {
    constructor() {
        this.bWantsNode = true;
    }

    parse(characterData, featListNode) {
        //SBUtils.log("> Parsing skills: " + featListNode.nodeName + ", with " + featListNode.childNodes.length + " children");
        for (let childNode of featListNode.childNodes) {
            // Skip text nodes
            if (childNode.nodeType == 3) {
                continue;
            }

            let featName = "";
            try {
                //SBUtils.log(">> Parsing " + childNode.nodeName + ": "+ childNode.nodeType);
                featName = getNode(childNode, "name").nodeValue;
                let featSummary = getNode(childNode, "summary.p");
                if (featSummary) {
                    featSummary = featSummary.nodeValue;
                }
                let featBenefit = getNode(childNode, "benefit.p");
                if (featBenefit) {
                    featBenefit = featBenefit.nodeValue;
                }
                let featNormal = getNode(childNode, "normal.p");
                if (featNormal) {
                    featNormal = featNormal.nodeValue;
                }
                let featSpecial = getNode(childNode, "special.p");
                if (featSpecial) {
                    featSpecial = featSpecial.nodeValue;
                }

                let description = "";
                if (featSummary) {
                    description += `<h2>Summary</h2>\n`;
                    description += `<p>${featSummary}</p>\n`;
                    description += `<p>&nbsp;</p>\n`;
                }
                if (featBenefit) {
                    description += `<h2>Benefit</h2>\n`;
                    description += `<p>${featBenefit}</p>\n`;
                    description += `<p>&nbsp;</p>\n`;
                }
                if (featNormal) {
                    description += `<h2>Normal</h2>\n`;
                    description += `<p>${featNormal}</p>\n`;
                    description += `<p>&nbsp;</p>\n`;
                }
                if (featSpecial) {
                    description += `<h2>Special</h2>\n`;
                    description += `<p>${featSpecial}</p>\n`;
                    description += `<p>&nbsp;</p>\n`;
                }

                if (featName) {
                    let item = {};
                    item["name"] = featName;
                    item["type"] = "feat";
                    item["system.description.value"] = description;

                    //SBUtils.log("Parsed feat: " + JSON.stringify(item));

                    characterData.items.push(item);
                }
            } catch (err) {
                if (featName) {
                    SBUtils.log("Error occurred parsing feat: " + featName + ", err: " + err);
                }
                throw err;
            }
        }
    }
}

export class SBPCGenParser {
    attributeMapping = {
        "root.character.name": new SBDirectFieldParser(["name"]),
        "root.character.alignment": new SBDirectFieldParser(["system.details.alignment"]),
        "root.character.speed": new SBDirectFieldParser(["system.attributes.speed.value"]),
        "root.character.size": new SBDirectFieldParser(["system.traits.size"], SBDirectFieldAssignmentMode.LowerCase),
        "root.character.race": new SBDirectFieldParser(["system.details.race"], SBDirectFieldAssignmentMode.Camelized),
        "root.character.hp.total": new SBDirectFieldParser(["system.attributes.hp.value", "system.attributes.hp.max"]),
        "root.character.sp.total": new SBDirectFieldParser(["system.attributes.sp.value", "system.attributes.sp.max"]),
        "root.character.rp.total": new SBDirectFieldParser(["system.attributes.rp.value", "system.attributes.rp.max"]),
        "root.character.abilities.strength.bonus": new SBDirectFieldParser(["system.abilities.str.mod"], SBDirectFieldAssignmentMode.Integer),
        "root.character.abilities.dexterity.bonus": new SBDirectFieldParser(["system.abilities.dex.mod"], SBDirectFieldAssignmentMode.Integer),
        "root.character.abilities.constitution.bonus": new SBDirectFieldParser(["system.abilities.con.mod"], SBDirectFieldAssignmentMode.Integer),
        "root.character.abilities.intelligence.bonus": new SBDirectFieldParser(["system.abilities.int.mod"], SBDirectFieldAssignmentMode.Integer),
        "root.character.abilities.wisdom.bonus": new SBDirectFieldParser(["system.abilities.wis.mod"], SBDirectFieldAssignmentMode.Integer),
        "root.character.abilities.charisma.bonus": new SBDirectFieldParser(["system.abilities.cha.mod"], SBDirectFieldAssignmentMode.Integer),
        "root.character.skilllist": new SBSkillParser(),
        "root.character.featlist": new SBFeatParser()
    };

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
        characterData.actorData["system.attributes.sp.max"] = 0;
        characterData.actorData["system.attributes.rp.max"] = 0;

        let errors = [];

        try {
            let xmlParser = new DOMParser();
            let xmlDoc = xmlParser.parseFromString(inputText,"text/xml");

            let keys = Object.keys(this.attributeMapping);
            for (let key of keys) {
                let valueParser = this.attributeMapping[key];
                if (valueParser.bWantsNode) {
                    let node = getNode(xmlDoc, key, false);
                    valueParser.parse(characterData, node);
                } else {
                    let parsedValue = getNode(xmlDoc, key);
                    if (parsedValue) {
                        valueParser.parse(characterData, parsedValue.nodeValue);
                    }
                }
            }
        } catch (err) {
            errors.push(["XML Parsing", err]);
        }

        return {success: true, characterData: characterData, errors: errors};
    }
}
