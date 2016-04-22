Shootme.Game = function (game) {

    this.buttons = {p1: [], p2: []};

    this.inputs = {p1: null, p2: null};

    this.lives = {p1: null, p2: null};

    this.stoppageTime;

    this.enabledButton;

    this.gameScore = "";

    this.minTime = 3;
    this.maxTime = 4;

    this.timeP1 = null;
    this.timeP2 = null;
};

Shootme.Game.prototype = {
    preload: function () {

    },

    create: function () {
        var bg = this.add.image(0, 0, 'bg');

        this.buttons.p1.push(this.add.sprite(this.world.centerX - 96, 52, 'btns-blue'));
        this.buttons.p1.push(this.add.sprite(this.world.centerX, 180, 'btns-red'));
        this.buttons.p1.push(this.add.sprite(this.world.centerX + 96, 52, 'btns-blue'));

        this.buttons.p2.push(this.add.sprite(this.world.centerX - 96, this.world.height - 136, 'btns-blue'));
        this.buttons.p2.push(this.add.sprite(this.world.centerX, this.world.height - 264, 'btns-red'));
        this.buttons.p2.push(this.add.sprite(this.world.centerX + 96, this.world.height - 136, 'btns-blue'));


        //put p1 sprite idle, add p1 sprite shoot
        this.p1 = this.add.sprite(this.world.centerX - 96, -24, 'p1_animations');
        this.p1.animations.add('idle', Phaser.ArrayUtils.numberArray(0, 8), 10, true);
        this.p1.animations.add('shoot', Phaser.ArrayUtils.numberArray(9, 21), 10, true);
        this.p1.animations.play('idle');
        //do same for p2
        this.p2 = this.add.sprite(this.world.centerX - 96, this.world.height - 264, 'p2_animations');
        this.p2.animations.add('idle', Phaser.ArrayUtils.numberArray(0, 8), 10, true);
        this.p2.animations.add('shoot', Phaser.ArrayUtils.numberArray(9, 21), 10, true);
        this.p2.animations.play('idle');

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
            tempButtons[nein].scale.setTo(0.5);
            tempButtons[nein].enabled = false;
        }

        this.lives.p1 = this.add.group();
        this.lives.p2 = this.add.group();

        for (var i = 0; i < 5; i++) {
            this.lives.p1.create(20 + 40 * i, 0, 'heart');
            this.lives.p2.create(20 + 40 * i, this.world.height - 100, 'heart');
        }


        this.enableRandomButton();
    },

    update: function () {

    },

    render: function () {
        if (this.gameScore) {
            this.gameScore.destroy();
        }
        this.gameScore = this.add.text(550, 500, 'lives: ' + this.lives.p1.length + ' : ' + this.lives.p2.length, {font: '36pt Arial'});
    },


    enableRandomButton: function () {
        this.time.events.add(Phaser.Timer.SECOND *
            this.rnd.realInRange(this.minTime, this.maxTime), function () {
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
        var p1_key = this.inputs.p1.indexOf(keyObj);
        var p2_key = this.inputs.p2.indexOf(keyObj);
        if (p1_key !== -1) {
            if (timeP1 > 0 || timeP1 === "wrong") {
                return;
            }
            if (p1_key === this.enabledButton) {

                timeP1 = this.time.now - this.stoppageTime;

            } else {
                timeP1 = "wrong";
                this.buttons.p1[this.enabledButton].frame = 0;
            }
            //set button pressed
            this.buttons.p1[p1_key].frame = 2;
            var buttons1 = this.buttons;
            //set timer to reset button;
            this.time.events.add(Phaser.Timer.SECOND / 2, function (game) {
                buttons1.p1[p1_key].frame = 0;
            });
        } else if (p2_key !== -1) {
            if (timeP2 > 0 || timeP2 === "wrong") {
                return;
            }
            if (p2_key === this.enabledButton) {

                timeP2 = this.time.now - this.stoppageTime;

            } else {
                timeP2 = "wrong";
                this.buttons.p2[this.enabledButton].frame = 0;
            }
            this.buttons.p2[p2_key].frame = 2;

            var buttons2 = this.buttons;
            this.time.events.add(Phaser.Timer.SECOND / 2, function (game) {
                buttons2.p2[p2_key].frame = 0;
            });
        }
        keyObj.isDown = false;
        console.log(timeP1 + " - " + timeP2);
        if (timeP1 && timeP2) {
            if (Number.isInteger(timeP1) && isNaN(timeP2) || timeP1 < timeP2) {
                //p1 shoot ani start
                this.lives.p1.getAt(0).destroy();
                var p1_anim = this.p1.animations;
                this.time.events.add(Phaser.Timer.SECOND * 1.5, function () {
                    p1_anim.stop();
                    var shoot = p1_anim.play('shoot', 10, false);
                    shoot.onComplete.add(function () {
                        p1_anim.stop();
                        p1_anim.play('idle');
                    }, this);
                });
            } else if (Number.isInteger(timeP2) && isNaN(timeP1) || timeP2 < timeP1) {
                //p2 shoot ani start
                this.lives.p2.getAt(0).destroy();
                var p2_anim = this.p2.animations;
                this.time.events.add(Phaser.Timer.SECOND * 1.5, function () {
                    p2_anim.stop();

                    var shoot = p2_anim.play('shoot', 10, false);
                    shoot.onComplete.add(function () {
                        p2_anim.stop();
                        p2_anim.play('idle');
                    }, this);
                });
            }

            this.buttons.p1[this.enabledButton].frame = 0;
            this.buttons.p2[this.enabledButton].frame = 0;

            createScoreAnimation(this.world.centerX - 150, timeP1, this);
            createScoreAnimation(this.world.centerX + 150, timeP2, this);
            timeP1 = 0;
            timeP2 = 0;

            this.input.enabled = false;

            if (this.lives.p1.length === 0 || this.lives.p2.length === 0) {
                //show end screen

                //add button / input click for proceeding

                // go to state main menu
                createScoreAnimation(this.world.centerX, "game ended! press any button", this);
                this.p1.animations.stop();
                this.p2.animations.stop();
                this.gameScore.destroy();
                this.add.text(550, 500, "end, press any key to exit");

                this.input.onDown.add(function () {
                    this.state.start('MainMenu');
                }, this);
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

