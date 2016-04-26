Reflexerado.MainMenu = function (game) {

    this.music = null;
    this.playButton = null;

    this.playerOneReady = false;
    this.playerTwoReady = false;

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


};

Reflexerado.MainMenu.prototype = {

    create: function () {

        if (!this.music) {
            this.music = this.add.audio('bg_audio');
            this.music.loop = true;
            if (debug === false)
                this.music.play();
        }

        this.add.image(0, 0, 'titlescreen');
        this.add.text(350, 475, 'press both red buttons to start.', {font: '36pt Western'});

        this.input.enabled = true;
        var p1 = this.input.keyboard.addKey(this.controls.p1.center);
        p1.onDown.add(function () {
            this.playerOneReady = true;
        }, this);
        var p2 = this.input.keyboard.addKey(this.controls.p2.center);
        p2.onDown.add(function () {
            this.playerTwoReady = true;
        }, this);

    },

    update: function () {

        if (this.playerOneReady === true && this.playerTwoReady === true) {
            this.playerOneReady = false;
            this.playerTwoReady = false;
            this.state.start('Game', true, false, {controls: this.controls});
        }

    }

};