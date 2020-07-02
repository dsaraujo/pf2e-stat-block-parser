/**
 * A helper Dialog subclass for taking user input
 * @type {Dialog}
 */
export class TextInputDialog extends Dialog {
    constructor(actor, dialogData={}, options={}) {
        super(dialogData, options);
        this.options.classes = ["starfinder", "dialog"];

        /**
         * Store a reference to the Actor entity which is resting
         * @type {Actor}
         */
        this.actor = actor;
    }
    
    activateListeners(html) {
        super.activateListeners(html);

        let textEntryBox = html.find('#text-entry');
        textEntryBox.change(this._onTextChanged.bind(this));
    }

    async _onTextChanged(event) {
        const textEntryBox = event.currentTarget;
        TextInputDialog.enteredText = textEntryBox.value;
    }

    static async textInputDialog({actor, title, originalText=""}={}) {
        TextInputDialog.enteredText = originalText;
        const html = await renderTemplate("systems/starfinder/templates/apps/text-input.html", {
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
                        callback: () => resolve({result: true, text: TextInputDialog.enteredText})
                    },
                    cancel: {
                        icon: '<i class="fas fa-times"></i>',
                        label: "Cancel",
                        callback: () => resolve({result: false, text: TextInputDialog.enteredText})
                    }
                }
            });
            dlg.render(true);
        });
    }
}