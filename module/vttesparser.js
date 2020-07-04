import { SBUtils, SBConfig } from "./utils.js";

export class SBVTTESParser {
    async parseInput(actorData, inputText) {
        if (actorData == null || !inputText) {
            return {success: false};
        }

        let items = [];

        return {success: true, actorData: actorData, items: items};
    }
}
