Shootme.Preloader = function (game) {

    this.background = null;
    this.preloadBar = null;

    this.ready = false;

};

Shootme.Preloader.prototype = {

    preload: function () {

        this.preloadBar = this.add.sprite(0, 100, 'preloaderBar');

        this.load.setPreloadSprite(this.preloadBar);

        this.load.image('btn-play', 'assets/button_play.png');

        this.load.spritesheet('btns-red', 'assets/buttons_red.png', 128, 128);
        this.load.spritesheet('btns-blue', 'assets/buttons_blue.png', 128, 128);
        this.load.image('bg', 'assets/background.png');

        this.load.spritesheet('p1_animations', 'assets/yellow_animations.png', 256, 256);

        this.load.spritesheet('p2_animations', 'assets/red_animations.png', 256, 256);

        this.load.image('heart', 'assets/heart.png');
    },

    create: function () {

        this.preloadBar.cropEnabled = false;

        this.state.start('MainMenu', true);

    }

};