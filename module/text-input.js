import { SBUtils } from "./utils.js";

/**
 * A helper Dialog subclass for taking user input
 * @type {Dialog}
 */
export class SBTextInputDialog extends Dialog {
    constructor(actor, dialogData={}, options={}) {
        super(dialogData, options);
        this.options.classes = ["sfrpg", "dialog"];

        /**
         * Store a reference to the Actor entity which is resting
         * @type {Actor}
         */
        this.actor = actor;
    }
    
    activateListeners(html) {
        super.activateListeners(html);

        let textFormatSelector = html.find('#text-format');
        textFormatSelector.change(this._onDataFormatChanged.bind(this));

        let textEntryBox = html.find('#text-entry');
        textEntryBox.change(this._onTextChanged.bind(this));
    }

    async _onDataFormatChanged(event) {
        const textFormatSelector = event.currentTarget;
        SBTextInputDialog.dataFormat = textFormatSelector.value;
    }

    async _onTextChanged(event) {
        const textEntryBox = event.currentTarget;
        SBTextInputDialog.enteredText = textEntryBox.value;
    }

    static async textInputDialog({actor, title, originalText=""}={}) {
        SBTextInputDialog.dataFormat = "statblock";
        SBTextInputDialog.enteredText = originalText;
        const html = await renderTemplate("modules/sfrpg-statblock-parser/templates/text-input.html", {
          originalText: originalText
        });
        return new Promise(resolve => {
            const dlg = new this(actor, {
                title: title,
                content: html,
                buttons: {
                    ok: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Ok",
                        callback: () => resolve({result: true, text: SBTextInputDialog.enteredText, dataFormat: SBTextInputDialog.dataFormat})
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => resolve({result: false, text: SBTextInputDialog.enteredText, dataFormat: SBTextInputDialog.dataFormat})
                    }
                }
            });
            dlg.render(true);
        });
    }
}