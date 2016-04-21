Shootme.MainMenu = function (game) {

    this.music = null;
    this.playButton = null;


};

Shootme.MainMenu.prototype = {

    create: function () {

        // this.music = this.add.audio('titleMusic');
        // this.music.play();

        var bg = this.add.image(0, 0, 'bg');
        this.playbutton=this.add.button(this.world.centerX, this.world.centerY, 'btn-play',

            this.startGame, this, this.world.centerX, this.world.centerY);

    },

    update: function () {

    },

    startGame: function (pointer) {

        // this.music.stop();

        //	And start the actual game
        this.state.start('Game');

    }

};