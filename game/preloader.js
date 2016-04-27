Reflexerado.Preloader = function (game) {

    this.background = null;
    this.preloadBar = null;

    this.ready = false;

};

Reflexerado.Preloader.prototype = {

    preload: function () {

        this.preloadBar = this.add.sprite(this.world.width / 13 * 5, this.world.centerY, 'preloaderBar');

        this.load.setPreloadSprite(this.preloadBar);

        this.load.image('bg', 'assets/background.png');
        this.load.image('titlescreen', 'assets/titlescreen.png');
        this.load.image('screen', 'assets/screen.png');
        this.load.image('fakescreen', 'assets/fake_screen.png');

        this.load.spritesheet('title_buttons', 'assets/play_anim.png', 700, 100);

        this.load.image('hole', 'assets/hole.png');
        this.load.image('hole_2', 'assets/hole_t.png');

        this.load.spritesheet('btns-red', 'assets/buttons_red.png', 128, 128);
        this.load.spritesheet('btns-blue', 'assets/buttons_blue.png', 128, 128);

        this.load.spritesheet('p1_animations', 'assets/red_animations.png', 256, 256);
        this.load.spritesheet('p2_animations', 'assets/yellow_animations.png', 256, 256);

        this.load.image('heart', 'assets/heart.png');
        this.load.spritesheet('heart_animation', 'assets/heart_anim.png',32,32);
        this.load.spritesheet('heart_flipped_animation', 'assets/heart_flipped_anim.png',32,32);

        this.load.image('bullet', 'assets/bullet.png');

        this.load.audio('bg_audio', 'assets/sound/ambient.mp3');
        this.load.audio('shot', 'assets/sound/gunshot.wav');
    },

    create: function () {

        this.preloadBar.cropEnabled = false;

        this.state.start('MainMenu', true);

    }

};