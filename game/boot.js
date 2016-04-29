var debug = false;
var webmode = true;

Reflexerado = {};

Reflexerado.Boot = function (game) {
};

Reflexerado.Boot.prototype = {

    preload: function () {

        this.load.image('preloaderBar', 'assets/preload_new.png');

    },

    create: function () {

        this.input.maxPointers = 1;
        // this.stage.disableVisibilityChange = true;

        this.state.start('Preloader');

    }

};