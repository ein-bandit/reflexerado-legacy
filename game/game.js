Shootme.Game = function (game) {

    this.buttons = {p1: [], p2: []};

    this.inputs = {p1: null, p2: null};

    this.lives = {p1: 5, p2: 5};

    this.stoppageTime;

    this.enabledButton;

    this.timeP1 = null;
    this.timeP2 = null;
};

Shootme.Game.prototype = {
    preload: function () {

    },

    create: function () {
        var bg = this.add.image(0, 0, 'bg');

        //bg.scale.setTo(0.5,0.5);

        console.log(this.buttons);
        this.buttons.p1.push(this.add.sprite(this.world.centerX-96, 64, 'btns-red'));
        this.buttons.p1.push(this.add.sprite(this.world.centerX, 160, 'btns-red'));
        this.buttons.p1.push(this.add.sprite(this.world.centerX+96, 64, 'btns-red'));


        this.buttons.p2.push(this.add.sprite(this.world.centerX-96, this.world.height-64, 'btns-blue'));
        this.buttons.p2.push(this.add.sprite(this.world.centerX, this.world.height-160, 'btns-blue'));
        this.buttons.p2.push(this.add.sprite(this.world.centerX+96, this.world.height-64, 'btns-blue'));

        this.input.enabled = false;
        this.inputs.p1 = [this.input.keyboard.addKey(Phaser.Keyboard.Q),
            this.input.keyboard.addKey(Phaser.Keyboard.S),
            this.input.keyboard.addKey(Phaser.Keyboard.Y)];
        this.inputs.p2 = [this.input.keyboard.addKey(Phaser.Keyboard.I),
            this.input.keyboard.addKey(Phaser.Keyboard.J),
            this.input.keyboard.addKey(Phaser.Keyboard.M)];

        var tempInputs = this.inputs.p1.concat(this.inputs.p2);
        var tempButtons = this.buttons.p1.concat(this.buttons.p2);
        for (var key in tempInputs) {
            tempInputs[key].onDown.add(this.evaluateInput, this);
        }
        for (var nein in tempButtons) {
            //tempButtons[nein].scale.setTo(0.5);
            tempButtons[nein].enabled = false;
        }

        this.enableRandomButton();
    },

    update: function () {

    },
    render: function (game) {

        game.debug.text('lives: ' + this.lives.p1 + ' : ' + this.lives.p2, 600, 600, 50);
    },


    enableRandomButton: function () {
        this.time.events.add(Phaser.Timer.SECOND *
            this.rnd.realInRange(1, 2), function () {
            this.enabledButton = this.rnd.integerInRange(0, 2);
            console.log("enable button " + this.enabledButton);
            this.showAndEnableButtons();
            this.stoppageTime = this.time.now
        }, this);
    },


    showAndEnableButtons: function () {
        this.buttons.p1[this.enabledButton].frame = 1;
        this.buttons.p2[this.enabledButton].frame = 1;

        this.buttons.p1[this.enabledButton].enabled = true;
        this.buttons.p2[this.enabledButton].enabled = true;
        this.input.enabled = true;
    },

    evaluateInput: function (keyObj) {
        if (this.inputs.p1.indexOf(keyObj) !== -1) {
            if (this.inputs.p1.indexOf(keyObj) === this.enabledButton) {
                timeP1 = this.time.now - this.stoppageTime;

            } else {
                timeP1 = "wrong";
            }
            this.buttons.p1[this.enabledButton].frame = 0;
        } else if (this.inputs.p2.indexOf(keyObj) !== -1) {
            if (this.inputs.p2.indexOf(keyObj) === this.enabledButton) {
                timeP2 = this.time.now - this.stoppageTime;

            } else {
                timeP2 = "wrong";
            }
            this.buttons.p2[this.enabledButton].frame = 0;
        }
        keyObj.isDown = false;
        console.log(timeP1 + " - " + timeP2);
        if (timeP1 && timeP2) {
            if (Number.isInteger(timeP1) && isNaN(timeP2) || timeP1 < timeP2) {
                this.lives.p1--;
            } else if (Number.isInteger(timeP2) && isNaN(timeP1) || timeP2 < timeP1) {
                this.lives.p2--;
            }

            createScoreAnimation(this.world.centerX - 150, timeP1, this);
            createScoreAnimation(this.world.centerX + 150, timeP2, this);
            timeP1 = 0;
            timeP2 = 0;

            this.input.enabled = false;

            if (this.lives.p1 === 0 || this.lives.p2 === 0 ) {
                //show end screen

                //add button / input click for proceeding

                // go to state main menu
                this.state.start('MainMenu');
            }

            this.enableRandomButton();
        }
    }
};

var timeP1;
var timeP2;


function createScoreAnimation(x, message, game) {

    var scoreFont = "45px Arial";

    //Create a new label for the score
    var scoreAnimation = game.add.text(x, game.world.centerY, message, {
        font: scoreFont,
        fill: "#39d179",
        stroke: "#ffffff",
        strokeThickness: 15
    });
    scoreAnimation.anchor.setTo(0.5, 0);
    scoreAnimation.align = 'center';

    //Tween this score label to the total score label
    var scoreTween = game.add.tween(scoreAnimation).to({x: x, y: 400}, 800, Phaser.Easing.Exponential.In, true);

    //When the animation finishes, destroy this score label, trigger the total score labels animation and add the score
    scoreTween.onComplete.add(function () {
        scoreAnimation.destroy();
    }, game);
}

