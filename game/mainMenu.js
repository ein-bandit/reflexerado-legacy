Reflexerado.MainMenu = function (game) {

    this.music;
    this.shoot;

    this.playerOneReady;
    this.playerTwoReady;

    this.controls;

    this.buttons;
};

Reflexerado.MainMenu.prototype = {
    init: function () {
        console.log("inside init");
        if (this.music) {
            this.music.destroy();
        }
        this.music = null;
        this.shoot = null;
        this.playerOneReady = false;
        this.playerTwoReady = false;

        this.controls = {
            p1: null,
            p2: null
        };
        this.buttons = {p1: [], p2: []};
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

        this.buttons.p1.push(this.add.sprite(this.world.centerX - 96 - 32, this.world.height - 146, 'btns-blue'));
        this.buttons.p1.push(this.add.sprite(this.world.centerX - 32, this.world.height - 274, 'btns-red'));
        this.buttons.p1.push(this.add.sprite(this.world.centerX + 96 - 32, this.world.height - 146, 'btns-blue'));

        this.buttons.p2.push(this.add.sprite(this.world.centerX - 96 + 32, 82, 'btns-blue'));
        this.buttons.p2.push(this.add.sprite(this.world.centerX + 32, 210, 'btns-red'));
        this.buttons.p2.push(this.add.sprite(this.world.centerX + 96 + 32, 82, 'btns-blue'));

        for (var i = 0; i < this.buttons.p1.length; i++) {
            this.buttons.p1[i].scale.setTo(0.5);

        }
        this.buttons.p1[1].animations.add('flash', Phaser.ArrayUtils.numberArray(0, 1), 2, true);
        this.buttons.p1[1].animations.play('flash');

        for (var j = 0; j < this.buttons.p2.length; j++) {
            this.buttons.p2[j].scale.setTo(0.5);
            this.buttons.p2[j].scale.x *= -1;
            this.buttons.p2[j].scale.y *= -1;
        }
        this.buttons.p2[1].animations.add('flash', Phaser.ArrayUtils.numberArray(0, 1), 2, true);
        this.buttons.p2[1].animations.play('flash');



        this.controls.p1 = this.buttons.p1[1];

        this.controls.p1.events.onInputDown.add(function () {
            this.buttons.p1[1].animations.stop();
            this.buttons.p1[1].animations.frame = 2;
            this.playerOneReady = true;
        }, this);

        this.controls.p2 = this.buttons.p2[1];
        this.controls.p2.events.onInputDown.add(function () {
            this.buttons.p2[1].animations.stop();
            this.buttons.p2[1].animations.frame = 2;
            this.playerTwoReady = true;
        }, this);

        this.controls.p1.inputEnabled = true;
        this.controls.p2.inputEnabled = true;

        this.input.enabled = true;
    },

    update: function () {
        if (this.playerOneReady === true && this.playerTwoReady === true) {
            this.controls.p1.inputEnabled  = false;
            this.controls.p2.inputEnabled  = false;

            this.input.enabled = false;
            
            this.shoot.play();
            this.buttons.p1[1].animations.stop();
            this.buttons.p2[1].animations.stop();
            this.playerOneReady = false;
            this.playerTwoReady = false;
            this.titlescreen.visible = false;
            this.titlescreen = this.add.image(this.world.centerX, this.world.centerY, 'fakescreen');
            this.titlescreen.anchor.set(0.5, 0.5);

            //destroy title screen buttons
            var all = this.buttons.p1.concat(this.buttons.p2);
            for (var i = 0; i < all.length; i++) {
                all[i].visible = false;
            }

            //hack for webmode button
            if (webmode === true)
                document.getElementById("start").getElementsByTagName("button")[0].style.display = "none";


            this.time.events.add(Phaser.Timer.SECOND, function () {
                this.add.tween(this.titlescreen.scale).to(
                    {
                        x: 50,
                        y: 50
                    }, 600, Phaser.Easing.Circular.In, true).onComplete.add(function () {
                    this.titlescreen.visible = false;
                    this.state.start('Game', true, false);
                }, this);

            }, this);
        }

    }

};