export class SBTextInputDialog extends Dialog {

    static get defaultOptions() {
        const options = super.defaultOptions;
        mergeObject(options, {
            width: 462
        });

        return options;
    }

    constructor(actor, dialogData={}, options={}) {
        super(dialogData, options);
        this.options.classes = ["sfrpg", "dialog"];
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

        try {
            let parsedJson = JSON.parse(SBTextInputDialog.enteredText);
            if (parsedJson.schema_version === 2) {
                let formatSelectors = document.getElementsByName("inputFormat");
                for (let selector of formatSelectors) {
                    selector.value = "vttes";
                }
                SBTextInputDialog.dataFormat = "vttes";
            }

        } catch (err) {

        }
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