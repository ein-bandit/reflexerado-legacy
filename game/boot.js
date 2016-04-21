Shootme = {};

Shootme.Boot = function (game) {
};

Shootme.Boot.prototype = {

    preload: function () {

        this.load.image('preloaderBar', 'assets/preload.png');

    },

    create: function () {

        this.input.maxPointers = 1;
        // this.stage.disableVisibilityChange = true;

        this.state.start('Preloader');

    }

};