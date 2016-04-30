Reflexerado.MainMenu = function (game) {

    this.music;
    this.shoot;

    this.playerOneReady;
    this.playerTwoReady;

    this.controls;

    this.title_buttons;
};

Reflexerado.MainMenu.prototype = {
    init: function () {
        this.music = null;
        this.shoot = null;
        this.playerOneReady = false;
        this.playerTwoReady = false;

        //p2 has swapped controls on left/right.
        if (webmode === true) {
            this.controls = {
                p1: {
                    left: Phaser.Keyboard.Q,
                    center: Phaser.Keyboard.S,
                    right: Phaser.Keyboard.Y
                },
                p2: {
                    left: Phaser.Keyboard.M,
                    center: Phaser.Keyboard.J,
                    right: Phaser.Keyboard.I
                }
            };
        } else {
            this.controls = {
                p1: {
                    left: Phaser.Keyboard.A,
                    center: Phaser.Keyboard.TWO,
                    right: Phaser.Keyboard.C
                },
                p2: {
                    left: Phaser.Keyboard.I,
                    center: Phaser.Keyboard.K,
                    right: 191
                }
            };
        }

        this.title_buttons = {
            p1: null,
            p2: null
        }
    },

    create: function () {


        if (!this.music) {
            this.music = this.add.audio('bg_audio');
            this.shoot = this.add.audio('shot');
            this.music.loop = true;
            if (debug === false)
                this.music.play();
        }
        this.screen = this.add.image(0, 0, 'screen');
        this.screen.scale.setTo(1 * (4 / 3), 1 * (4 / 3));

        this.titlescreen = this.add.image(this.world.centerX, this.world.centerY, 'titlescreen');
        this.titlescreen.anchor.setTo(0.5, 0.5);

        this.title_buttons.p1 = this.add.sprite(this.world.width / 2 - 350, this.world.height / 7 * 6, 'title_buttons');
        this.title_buttons.p1.animations.add('press');
        this.title_buttons.p1.animations.play('press', 2, true);

        this.title_buttons.p2 = this.add.sprite(this.world.width / 2 + 350, this.world.height / 7, 'title_buttons');
        this.title_buttons.p2.scale.x *= -1;
        this.title_buttons.p2.scale.y *= -1;
        this.title_buttons.p2.animations.add('press');
        this.title_buttons.p2.animations.play('press', 2, true);


        this.input.enabled = true;
        var p1 = this.input.keyboard.addKey(this.controls.p1.center);
        p1.onDown.add(function () {
            this.playerOneReady = true;
        }, this);
        p1.onUp.add(function () {
            this.playerOneReady = false;
        }, this);
        var p2 = this.input.keyboard.addKey(this.controls.p2.center);
        p2.onDown.add(function () {
            this.playerTwoReady = true;
        }, this);
        p2.onUp.add(function () {
            this.playerTwoReady = false;
        }, this);

        if (webmode === true) {
            this.input.keyboard.addKey(Phaser.Keyboard.Z).onDown.add(function () {
                this.sound.mute = true;
            }, this);
        }


    },

    update: function () {
        if (this.playerOneReady === true && this.playerTwoReady === true) {
            this.shoot.play();
            this.title_buttons.p1.animations.stop();
            this.title_buttons.p2.animations.stop();
            this.playerOneReady = false;
            this.playerTwoReady = false;
            this.titlescreen.visible = false;
            this.titlescreen = this.add.image(this.world.centerX, this.world.centerY, 'fakescreen');
            this.titlescreen.anchor.set(0.5, 0.5);
            this.titlescreen.scale.set(1.429, 1.429);

            this.title_buttons.p1.visible = false;
            this.title_buttons.p2.visible = false;


            this.time.events.add(Phaser.Timer.SECOND, function () {
                this.add.tween(this.titlescreen.scale).to(
                    {
                        x: 50,
                        y: 50
                    }, 600, Phaser.Easing.Circular.In, true).onComplete.add(function () {
                    this.titlescreen.visible = false;
                    this.state.start('Game', true, false, {controls: this.controls, mute: this.sound});
                }, this);

            }, this);
        }

    }

};